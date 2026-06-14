import { Misc } from "consts/MiscConsts"
import { Taskmaster } from "./Taskmaster/main"
import {
    CreateFindandUpdateRemotesPlan,
    CreateGoBuildPlan,
    CreateGoHarvestPlan,
    CreateGoHaulPlan,
    CreateGoQueenPlan,
    CreateGoRemoteMinePlan,
    CreateGoScoutPlan,
    CreateGoUpgradePlan,
    CreateRunTowerTask,
    CreateSpawnHarvesterPlan,
    CreateSpawnHaulerPlan
} from "./Taskmaster/plans";
import { buildOrder, creepLimits, getCreepLimit, globalBuildOrder } from "consts/EcoConsts"
import "functions/list";
import { getTrueDistance } from "functions/misc";
import { createAndUpdateCheckerSite } from "./imports/checkerboardBuilder"
import { bodyConsts } from "consts/BodyConsts"
import { ErrorMapper } from "ErrorMapper";
import { SayAll } from "./functions/sayAll";
import { RespondToCombatThreats } from "./Taskmaster/tasks/combat/AllocateCombatCreeps";
import { getUsableSpawns } from "./functions/HelperFunctions";
import { FindAndUpdateRemotes } from "./Taskmaster/tasks/remoteSpecific/MineAndDrop";
// main.js
//import * as trafficManager from "./imports/TrafficManager";
declare global {
    var taskmaster: Taskmaster
}

if(Memory.global===undefined) {
    Memory.global = {creeps: {scouts: {all: [], closed: []}},
    defenseRequests: {}}
}
if(Memory.roomData===undefined) {
    Memory.roomData = {}
}
export const loop = ErrorMapper.wrapLoop(() => {
    if(Memory.deferCreepGrab!==undefined) {
        for(let grab of Memory.deferCreepGrab) {
            if (Game.creeps[grab.name] !== undefined) {
                switch (grab.type) {
                    case "harvester":
                        Memory.rooms[grab.roomName].creeps.harvesters.all.push(Game.creeps[grab.name].id);
                        break;
                    case "hauler":
                        Memory.rooms[grab.roomName].creeps.haulers.all.push(Game.creeps[grab.name].id);
                        break;
                    case "upgrader":
                        Memory.rooms[grab.roomName].creeps.upgraders.all.push(Game.creeps[grab.name].id);
                        break;
                    case "builder":
                        Memory.rooms[grab.roomName].creeps.builders.all.push(Game.creeps[grab.name].id);
                        break;
                    case "scout":
                        Memory.global.creeps.scouts.all.push(Game.creeps[grab.name].id);
                        break;
                    case "remote":
                        Memory.rooms[grab.roomName].creeps.remoteminers.all.push(Game.creeps[grab.name].id);
                        break;
                    case "remotehauler":
                        Memory.rooms[grab.roomName].creeps.remotehaulers.all.push(Game.creeps[grab.name].id);
                        break;
                    case "queen":
                        Memory.rooms[grab.roomName].creeps.queens.all.push(Game.creeps[grab.name].id);
                        break;
                    case "defender":
                        Memory.rooms[grab.roomName].creeps.defenders.all.push(Game.creeps[grab.name].id);
                        break;
                }
            }
            Memory.deferCreepGrab.splice(Memory.deferCreepGrab.indexOf(grab), 1);
        }
    }
    if(Memory.global.creeps===undefined) {
        Memory.global.creeps = {
            scouts: { all: [], closed: []}
        }
    }
    global.taskmaster = new Taskmaster(20)
    for(let roomid in Game.rooms) {
        let room = Game.rooms[roomid];
        if (room.controller?.level === 0 || room.controller?.level === undefined || room.controller.my === false)
            continue;
        if (room.memory.init !== true) {
            console.log("init");
            room.memory = {
                creeps: {
                    harvesters: {
                        all: [],
                        closed: []
                    },
                    haulers: {
                        all: [],
                        closed: []
                    },
                    upgraders: {
                        all: [],
                        closed: []
                    },
                    builders: {
                        all: [],
                        closed: []
                    },
                    remotehaulers: {
                        all: [],
                        closed: []
                    },
                    remoteminers: {
                        all: [],
                        closed: []
                    },
                    queens: {
                        all: [],
                        closed: []
                    },
                    defenders: {
                        all: [],
                        closed: []
                    }
                },
                AllocatedRooms: [],
                buildInfo: { builds: [], sites: [], built: [], confirmed: false },
                init: true,
                flags: {
                    threatened: false,
                    restartRoom: false,
                }
            };
        }
        let Spawn = getUsableSpawns(room);
        console.log("For " + room.name + " " + Spawn);
        let towers: StructureTower[] = room.find(FIND_STRUCTURES, {
            filter: (x) => x.structureType === STRUCTURE_TOWER
        });

        for (let pointer in room.memory.creeps) {
            room.memory.creeps[pointer] = room.memory.creeps[pointer] || { all: [], closed: [] };
            let arr = room.memory.creeps[pointer];
            let creeplist = arr.closed;
            let creeplistall = arr.all;
            for (let creep of creeplistall) {
                let exists = Game.getObjectById(creep);
                if (!exists || exists?.hits <= 0) {
                    creeplistall = creeplistall.removeItemOnce(creep);
                    creeplist = creeplist.removeItemOnce(creep);
                }
            }
            if (pointer === "remoteminers" || pointer === "remotehaulers") {
                console.log("Uh oh");
                continue;
            }
            for (let creep of creeplist) {
                if (taskmaster.ContainsPlan(undefined, undefined, [creep]) === false) {
                    creeplist = creeplist.removeItemOnce(creep);
                }
            }
        }
        let madeCreep = false;
        for (let curOrder of buildOrder) {
            if (curOrder.planFunction === null) {
                continue;
            }
            if (curOrder.planSkipCondition) {
                if (curOrder.planSkipCondition(room)) continue;
            }
            console.log(taskmaster.ContainsPlan(curOrder.planName, room.name) + " for " + curOrder.planName);
            if (
                room.memory.creeps[curOrder.pointer].all.length < getCreepLimit(room, curOrder.pointer) &&
                !taskmaster.ContainsPlan(curOrder.planName, room.name)
            ) {
                console.log("creating a " + curOrder.planName);
                taskmaster.AppendPlan(curOrder.planFunction(room));
            }
            if (room.memory.creeps[curOrder.pointer].all.length < getCreepLimit(room, curOrder.pointer)) {
                madeCreep = true;
                break;
            }
        }
        if (madeCreep === false) {
            for (let curOrder of globalBuildOrder) {
                if (curOrder.planFunction === null) {
                    continue;
                }
                if (curOrder.planSkipCondition) {
                    if (curOrder.planSkipCondition(room)) continue;
                }
                if (
                    Memory.global.creeps[curOrder.pointer].all.length < getCreepLimit(room, curOrder.pointer) &&
                    taskmaster.ContainsPlan(curOrder.planName) === false
                ) {
                    taskmaster.AppendPlan(curOrder.planFunction(room));
                }
                if (Memory.global.creeps[curOrder.pointer].all.length < getCreepLimit(room, curOrder.pointer)) {
                    break;
                }
            }
        }
        /*
        if(room.memory.creeps.harvesters.all.length<creepLimits.harvesters&&
            taskmaster.ContainsPlan("SpawnHarvester")===false
        ) {
            taskmaster.AppendPlan(CreateSpawnHarvesterPlan(room))
        } else if(room.memory.creeps.haulers.all.length<creepLimits.haulers&&
            taskmaster.ContainsPlan("SpawnHauler")===false&&taskmaster.ContainsPlan("SpawnHarvester")===false
        ) {
            taskmaster.AppendPlan(CreateSpawnHaulerPlan(room))
        } else if(room.memory.creeps.haulers.all.length<creepLimits.haulers&&
            taskmaster.ContainsPlan("S")===false&&taskmaster.ContainsPlan("SpawnHarvester")===false
        ) {
            taskmaster.AppendPlan(CreateSpawnHaulerPlan(room))
        }
        */

        if (
            room.memory.creeps.haulers.all.length > room.memory.creeps.haulers.closed.length &&
            room.find(FIND_DROPPED_RESOURCES).length > 0
        ) {
            let creeplist = room.memory.creeps.haulers.all.filter(
                (a) => !room.memory.creeps.haulers.closed.includes(a) && !Game.getObjectById(a).spawning
            );
            if (creeplist.length > 0) {
                for (let creep of creeplist) {
                    if (Game.getObjectById(creep) !== undefined)
                        if (taskmaster.ContainsPlan(undefined, undefined, [creep]) === false) {
                            room.memory.creeps.haulers.closed.push(Game.getObjectById(creep).id);
                            taskmaster.AppendPlan(CreateGoHaulPlan(Spawn.room.name, Game.getObjectById(creep)));
                        }
                }
            }
        }

        if (room.memory.creeps.harvesters.all.length > room.memory.creeps.harvesters.closed.length) {
            let creeplist = room.memory.creeps.harvesters.all.filter(
                (a) => !room.memory.creeps.harvesters.closed.includes(a) && !Game.getObjectById(a).spawning
            );
            if (creeplist.length > 0) {
                for (let creep of creeplist) {
                    if (Game.getObjectById(creep) !== undefined)
                        if (!taskmaster.ContainsPlan(undefined, undefined, [creep])) {
                            room.memory.creeps.harvesters.closed.push(Game.getObjectById(creep).id);
                            taskmaster.AppendPlan(CreateGoHarvestPlan(Spawn.room.name, Game.getObjectById(creep)));
                        }
                }
            }
        }

        if (room.memory.creeps.upgraders.all.length > room.memory.creeps.upgraders.closed.length) {
            let creeplist = room.memory.creeps.upgraders.all.filter(
                (a) => !room.memory.creeps.upgraders.closed.includes(a) && !Game.getObjectById(a).spawning
            );
            if (creeplist.length > 0) {
                for (let creep of creeplist) {
                    if (Game.getObjectById(creep) !== undefined)
                        if (!taskmaster.ContainsPlan(undefined, undefined, [creep])) {
                            room.memory.creeps.upgraders.closed.push(Game.getObjectById(creep).id);
                            taskmaster.AppendPlan(CreateGoUpgradePlan(Spawn.room.name, Game.getObjectById(creep)));
                        }
                }
            }
        }

        if (room.memory.creeps.builders.all.length > room.memory.creeps.builders.closed.length) {
            let creeplist = room.memory.creeps.builders.all.filter(
                (a) => !room.memory.creeps.builders.closed.includes(a) && !Game.getObjectById(a).spawning
            );
            if (creeplist.length > 0) {
                for (let creep of creeplist) {
                    if (Game.getObjectById(creep) !== undefined)
                        if (!taskmaster.ContainsPlan(undefined, undefined, [creep])) {
                            room.memory.creeps.builders.closed.push(Game.getObjectById(creep).id);
                            taskmaster.AppendPlan(CreateGoBuildPlan(Spawn.room.name, Game.getObjectById(creep)));
                        }
                }
            }
        }
        if (room.memory.creeps.queens.all.length > room.memory.creeps.queens.closed.length) {
            let creeplist = room.memory.creeps.queens.all.filter(
                (a) => !room.memory.creeps.queens.closed.includes(a) && !Game.getObjectById(a).spawning
            );
            if (creeplist.length > 0) {
                for (let creep of creeplist) {
                    if (Game.getObjectById(creep) !== undefined)
                        if (!taskmaster.ContainsPlan(undefined, undefined, [creep])) {
                            room.memory.creeps.queens.closed.push(Game.getObjectById(creep).id);
                            taskmaster.AppendPlan(CreateGoQueenPlan(Spawn.room.name, Game.getObjectById(creep)));
                        }
                }
            }
        }

        for (let tower of towers) {
            if (!taskmaster.ContainsPlan("TowerImmortalTask", undefined, [tower.id])) {
                taskmaster.AppendPlan(CreateRunTowerTask(tower, room));
            }
        }

        //if (!taskmaster.ContainsPlan("findUpdateRooms",room.name)) {
        //taskmaster.AppendPlan(CreateFindandUpdateRemotesPlan(Spawn.room));
        //}

        // Run additional functions
        if (Game.time % 20 === 0) {
            createAndUpdateCheckerSite(room.memory, "buildInfo", Spawn.name);
        }
        RespondToCombatThreats(room);
        FindAndUpdateRemotes([room.name]);

        if (
            room.memory.creeps.harvesters.all.length === 0 &&
            room.memory.creeps.haulers.all.length === 0 &&
            room.memory.creeps.remotehaulers.all.length === 0 &&
            room.memory.creeps.remoteminers.all.length === 0
        ) {
            room.memory.flags.restartRoom = true;
        }
        if(
            room.memory.creeps.harvesters.all.length >= getCreepLimit(room,"harvesters") &&
            room.memory.creeps.haulers.all.length >= getCreepLimit(room,"haulers") &&
            room.memory.creeps.remotehaulers.all.length >= getCreepLimit(room,"remotehaulers")
        ) {
            room.memory.flags.restartRoom = false;
        }
        //if(taskmaster.ContainsActivePlan("GoUpgrade")===false&&taskmaster.ContainsInactivePlan("GoUpgrade")===false)
        //taskmaster.AppendPlan(CreateGoUpgradePlan(Spawn.room.name,Game.creeps["upgrade"]))
        let allcreeps = room.memory.creeps.harvesters.all.concat(room.memory.creeps.haulers.all);
        let actualcreeps: Array<Creep | null> = allcreeps.map((a) => Game.getObjectById(a));
        if (actualcreeps.length > 0 && !actualcreeps.includes(null))
            // @ts-expect-error
            SayAll(actualcreeps);
    }

    // Global Creep Actions (Ones not working for a specific room)


    for (let pointer in Memory.global.creeps) {
        let arr = Memory.global.creeps[pointer];
        let creeplist = arr.closed;
        let creeplistall = arr.all;
        for (let creep of creeplistall) {
            let exists = Game.getObjectById(creep);
            if (!exists || exists?.hits <= 0) {
                creeplistall = creeplistall.removeItemOnce(creep);
                creeplist = creeplist.removeItemOnce(creep);
            }
        }
        for (let creep of creeplist) {
            if (taskmaster.ContainsPlan(undefined, undefined, [creep]) === false) {
                creeplist = creeplist.removeItemOnce(creep);
            }
        }
    }

    if (
        taskmaster.ContainsInactivePlan("goScout") === false &&
        Memory.global.creeps.scouts.all.length > Memory.global.creeps.scouts.closed.length
    ) {
        let creep = Memory.global.creeps.scouts.all.filter(
            (a) => Memory.global.creeps.scouts.closed.includes(a) === false && Game.getObjectById(a).spawning === false
        );
        if (creep.length > 0) {
            Memory.global.creeps.scouts.closed.push(Game.getObjectById(creep[0]).id);
            taskmaster.AppendPlan(CreateGoScoutPlan(Game.getObjectById(creep[0])));
        }
    }

    for(let creep in Memory.creeps) {
        if(!Game.creeps[creep]){
            delete Memory.creeps[creep];
        }
    }
    taskmaster.run()
})
function InternalCalcBodySize(spawn:StructureSpawn,bodydict:{[num:number]:BodyPartConstant[]}):BodyPartConstant[] {
    let size = Math.floor(spawn.room.energyCapacityAvailable / 50) * 50;
    let biggest: BodyPartConstant[] = [];
    for(let I in bodydict) {
        //@ts-ignore
        if(size >= I) {
            biggest = bodydict[I]
        }
    }
    return biggest
}

function InternalGetBodyCost(spawn:StructureSpawn):number {
    return Math.floor(spawn.room.energyCapacityAvailable/50)*50
}
