import { addCoordinates } from "functions/misc";
import { Taskmaster } from "Taskmaster/main";
import { FindUpdateRemotesConstructor, GoRemoteMineConstructor } from "Taskmaster/planConstructor";
import { CreateGoRemoteHaulPlan, CreateGoRemoteMinePlan } from "Taskmaster/plans";
import { taskReturn } from "Taskmaster/taskdefs";
import { getCreepLimit } from "../../../consts/EcoConsts";
import { detectDanger } from "../../../functions/combatDetections";
import { SayAll } from "../../../functions/sayAll";

export function GoMineAndDrop(allocatedItems: Id<Creep>[], planState: GoRemoteMineConstructor): taskReturn {

    let iter = 0;
    let confirm = true;
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I);
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1);
            return {
                suceeded: false,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            };
        }
        detectDanger(creep);

        new RoomVisual(creep.room.name).text("Remote Mining " + planState.targetId, creep.pos.x, creep.pos.y, {
            color: "red"
        });

        let source = Memory.roomData[planState.targetId].sources[iter];
        if (source === null) {
            return {
                suceeded: false,
                status: "source doesn't exist",
                updatedItems: allocatedItems
            };
        }
        console.log("Remote mining Source " + source);
        if (planState.targetId !== creep.room.name) {
            creep.moveTo(source);
        } else {
            let sourcereal = new RoomPosition(source.x, source.y, source.roomName).findInRange(FIND_SOURCES, 3)[0];
            console.log("sourcereal " + JSON.stringify(sourcereal));
            if (creep.harvest(sourcereal) !== OK) {
                creep.moveTo(sourcereal,{maxRooms: 1});
            }
        }

        if (creep.store.getFreeCapacity() !== 0) {
            confirm = false;
        }
        iter += 1;
    }
    if (confirm) {
        iter = 0;
        for (let I of allocatedItems) {
            let creep = Game.getObjectById(I);
            if (creep === null || !(creep instanceof Creep)) {
                allocatedItems.splice(iter, 1);
                return {
                    suceeded: false,
                    status: "creep doesn't exist",
                    updatedItems: allocatedItems
                };
            }
            iter += 1;
            creep.drop(RESOURCE_ENERGY);
        }
        confirm = false;

        if (planState.roomName) {
            let room = Game.rooms[planState.roomName];

            let roomData = room.memory.AllocatedRooms.find((a)=>a.RoomName===planState.targetId);
            if(roomData) {
                if (allocatedItems.length !== roomData.Allocated.length) {
                    confirm = true;
                }
            }
        }
    }
    //SayAll(
    //    allocatedItems.map((a) => Game.getObjectById(a)),
    //    "sixteentons"
    //;
    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    };
}

export function FindAndUpdateRemotes(allocatedItems: string[]): taskReturn {
    let room = Game.rooms[allocatedItems[0]];
    let maxcost = 50;
    let maxSources = getCreepLimit(room,"remoteminers");

    let currentSources = room.memory.AllocatedRooms.reduce((a, b) => {
        return a + b.sources;
    }, 0);
    if (Game.time % 10 === 0 && currentSources < maxSources) {
        let checkrooms = ["W1N0", "E1N0", "E0N1", "E0S1", "E1S1", "W1S1", "E1N1", "W1N1", "W2N0", "E2N0", "E0N2", "E0S2", "E2S2", "W2S2", "E2N2", "W2N2", "W2N1", "W2S1", "E2N1", "E2S1", "W1N2", "W1S2", "E1N2", "E1S2"];
        for (let room2 of checkrooms) {
            let currentSources = room.memory.AllocatedRooms.reduce((a, b) => {
                return a + b.sources;
            }, 0);
            if (currentSources >= maxSources) {
                break;
            }
            room2 = addCoordinates(room.name, room2);
            if (!Memory.roomData[room2]) continue;
            console.log("Cost of " + room2 + " " + findCostOfRoom(room, room2));
            if (findCostOfRoom(room, room2) <= maxcost&&Memory.roomData[room2].sources.length <= 2&&!Memory.roomData[room2].controller.owned) {
                if (!room.memory.AllocatedRooms.some((i) => i.RoomName === room2)) {
                    room.memory.AllocatedRooms.push({
                        RoomName: room2,
                        Allocated: [],
                        AllocatedHaulers: [],
                        sources: Memory.roomData[room2].sources.length
                    });
                }
            } else {
                if (room.memory.AllocatedRooms.some((i) => i.RoomName === room2)) {
                    room.memory.AllocatedRooms.splice(
                        room.memory.AllocatedRooms.findIndex((i) => i.RoomName === room2),
                        1
                    );
                }
            }
        }
    }
    //@ts-ignore
    console.logUnsafe(
        "[red]" +
            Memory.rooms[room.name].creeps.remoteminers.all.length +
            " " +
            Memory.rooms[room.name].creeps.remoteminers.closed.length
    );
    if (
        Memory.rooms[room.name].creeps.remoteminers.all.length >
        Memory.rooms[room.name].creeps.remoteminers.closed.length
    ) {
        let toAdd = Memory.rooms[room.name].creeps.remoteminers.all.filter(
            (i) => Memory.rooms[room.name].creeps.remoteminers.closed.includes(i) === false
        );
        //Memory.rooms[room.name].creeps.remoteminers.closed = Memory.rooms[room.name].creeps.remoteminers.closed.concat(toAdd)
        console.log("Non-allocated miners: " + toAdd);
        let toClose = [];
        for (let Aroom of room.memory.AllocatedRooms) {
            if (toAdd.length <= 0) break;
            for (let creep of Aroom.Allocated) {
                let exists = Game.getObjectById(creep);
                if (!exists || exists?.hits <= 0) {
                    console.log("Remove");
                    Aroom.Allocated = Aroom.Allocated.removeItemOnce(creep);
                }
            }
            if (Aroom.sources > Aroom.Allocated.length) {
                //@ts-ignore
                let creep: Id<Creep> = toAdd.shift();

                Aroom.Allocated.push(creep);

                console.log("Pushing " + creep + " To closed");
                toClose.push(creep);
            }
        }
        Memory.rooms[room.name].creeps.remoteminers.closed =
            Memory.rooms[room.name].creeps.remoteminers.closed.concat(toClose);
    }
    // TODO: Ugly repeated code
    if (
        Memory.rooms[room.name].creeps.remotehaulers.all.length >
        Memory.rooms[room.name].creeps.remotehaulers.closed.length
    ) {
        let toAdd = Memory.rooms[room.name].creeps.remotehaulers.all.filter(
            (i) => Memory.rooms[room.name].creeps.remotehaulers.closed.includes(i) === false
        );
        //Memory.rooms[room.name].creeps.remoteminers.closed = Memory.rooms[room.name].creeps.remoteminers.closed.concat(toAdd)
        console.log("Non-allocated haulers: " + toAdd);
        let toClose = [];
        for (let Aroom of room.memory.AllocatedRooms) {
            if (toAdd.length <= 0) break;
            for (let creep of Aroom.AllocatedHaulers) {
                let exists = Game.getObjectById(creep);
                if (!exists || exists?.hits <= 0) {
                    console.log("Remove");
                    Aroom.AllocatedHaulers = Aroom.AllocatedHaulers.removeItemOnce(creep);
                }
            }

            // TODO: Change from hardcoded
            let multiplication = (room.controller?.level || 0) === 3 ? 3 : (room.controller?.level || 0) === 2 ? 3 : (room.controller?.level || 0) >= 5 ? 1: 2

            if (Math.ceil(Aroom.sources * multiplication) > Aroom.AllocatedHaulers.length) {
                //@ts-ignore
                let creep: Id<Creep> = toAdd.shift();

                Aroom.AllocatedHaulers.push(creep);

                console.log("Pushing " + creep + " To closed");
                toClose.push(creep);
            }
        }
        Memory.rooms[room.name].creeps.remotehaulers.closed =
            Memory.rooms[room.name].creeps.remotehaulers.closed.concat(toClose);
    }

    let iter = 0;
    for (let item of room.memory.AllocatedRooms) {
        if (item.Allocated.length > 0) {
            if (!taskmaster.ContainsPlan("goRemoteMine", undefined, undefined, item.RoomName)) {
                let iter = 0;
                for (let remove of item.Allocated.map((i) => Game.getObjectById(i))) {
                    if (remove === null) {
                        item.Allocated.splice(iter, 1);
                    }
                    iter++;
                }
                let task = CreateGoRemoteMinePlan(
                    room.name,
                    item.RoomName,
                    item.Allocated.map((i) => Game.getObjectById(i))
                );
                task.id = String(iter);
                //@ts-ignore
                console.log("[green]Uh oh");
                taskmaster.AppendPlan(task);
            }
        }
        // TODO: Ugly repeated code
        if (item.AllocatedHaulers.length > 0) {
            if (!taskmaster.ContainsPlan("goRemoteHaul", undefined, item.AllocatedHaulers, undefined)) {
                let iter = 0;
                for (let remove of item.AllocatedHaulers.map((i) => Game.getObjectById(i))) {
                    if (remove === null) {
                        item.AllocatedHaulers.splice(iter, 1);
                    }
                    iter++;
                }
                let task = CreateGoRemoteHaulPlan(
                    room.name,
                    item.RoomName,
                    item.AllocatedHaulers.map((i) => Game.getObjectById(i))
                );
                task.id = room.name + String(iter);
                //@ts-ignore
                console.log("[green]Uh oh");
                taskmaster.AppendPlan(task);
            }
        }
        iter += 1;
    }

    return {
        status: "no errors",
        suceeded: true
    };
}
function findCostOfRoom(room:Room,room2:string) {
    console.log("1 "+room2 + " " + room.name)
    let cost = PathFinder.search(new RoomPosition(25, 25, room.name), new RoomPosition(25, 25, room2)).cost;
    console.log("2")
    cost -= Memory.roomData[room2].sources.length * 20;
    return cost;
}
