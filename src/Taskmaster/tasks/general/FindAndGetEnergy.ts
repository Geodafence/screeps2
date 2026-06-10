import { GoHarvestConstructor, GoHaulConstructor, GoUpgradeConstructor } from "../../planConstructor";
import { taskReturn } from "../../taskdefs";


export function findAndHarvest(allocatedItems: Id<AnyCreep>[] | Id<Structure>[], planState: GoHarvestConstructor | GoUpgradeConstructor): taskReturn {
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
        let sourceid: Id<Source>;
        if (typeof planState.targetId === "object") {
            sourceid = planState.targetId.source;
        } else {
            sourceid = planState.targetId;
        }
        creep.memory.previousTarget = sourceid;
        let source: Source = Game.getObjectById(sourceid);
        if (source === null) {
            return {
                suceeded: false,
                status: "source doesn't exist",
                updatedItems: allocatedItems
            };
        }
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }

        if (creep.store.getFreeCapacity() !== 0) {
            confirm = false;
        }
        iter += 1;
    }


    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function GrabFromSpawn(
    allocatedItems: Id<AnyCreep>[] | Id<Structure>[],
    planState: GoUpgradeConstructor
): taskReturn {
    let iter = 0;
    let confirm = true;
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I);
        let spawn: AnyStructure = Game.getObjectById(planState.targetId.spawn);
        if (creep === null || !(creep instanceof Creep) || spawn === null) {
            allocatedItems.splice(iter, 1);
            return {
                suceeded: false,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            };
        }
        let container = false;
        if (creep.room.find(FIND_STRUCTURES, { filter: (a) => a.structureType === STRUCTURE_CONTAINER }).length > 0) {
            spawn = creep.room.find(FIND_STRUCTURES, { filter: (a) => a.structureType === STRUCTURE_CONTAINER })[0];
            container = true;

        }

        // @ts-ignore
        let storage: StructureStorage = creep.room.find(FIND_STRUCTURES, {
            filter: (a) => a.structureType === STRUCTURE_STORAGE
        })[0];
        if (storage && creep.room.memory.creeps.queens.all.length > 0) {
            spawn = storage;
            container = true;
        }

        if (creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
        // @ts-ignore
        if (container && spawn.store.getUsedCapacity() === 0) {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name),{maxRooms:1,maxOps: 80});
        }
        if (creep.store.getFreeCapacity() !== 0) {
            confirm = false;
        }
        iter += 1;
    }

    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function GrabFromStorage(
    allocatedItems: Id<AnyCreep>[] | Id<Structure>[],
    planState: GoUpgradeConstructor
): taskReturn {
    let iter = 0;
    let confirm = true;
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I);
        //let spawn: AnyStructure = Game.getObjectById(planState.targetId.spawn);
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1);
            return {
                suceeded: false,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            };
        }
        if (creep.room.find(FIND_STRUCTURES, { filter: (a) => a.structureType === STRUCTURE_STORAGE }).length > 0) {
            // @ts-ignore
            let storage: StructureStorage = creep.room.find(FIND_STRUCTURES, { filter: (a) => a.structureType === STRUCTURE_STORAGE })[0];

            if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
            }
            if (storage.store.getUsedCapacity() === 0) {
                creep.moveTo(new RoomPosition(25, 25, creep.room.name));
            }
        }

        if (creep.store.getFreeCapacity() !== 0) {
            confirm = false;
        }
        iter += 1;
    }

    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function HaulerGrabFromDroppedResource(allocatedItems: Id<Creep>[], planState: GoHaulConstructor): taskReturn {
    let iter = 0;
    let confirm = true;
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I);
        let item = Game.getObjectById(planState.targetId);
        if (creep === null) {
            allocatedItems.splice(iter, 1);
            console.log("Creep ded");
            return {
                suceeded: true,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            };
        }

        if (item?.resourceType == null) {
            console.log("This dropped resource died");
            confirm = true;
            break;
        }
        if (creep.pickup(item) !== OK) {
            creep.moveTo(item);
        }
        console.log(creep.store.getFreeCapacity(), item);
        if (creep.store.getFreeCapacity() > 0) {
            confirm = false;
        }
        if (item == null) {
            confirm = true;
        }
        iter += 1;
    }

    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function GrabFromDroppedResource(allocatedItems: Id<Creep>[], planState: GoHaulConstructor): taskReturn {
    let iter = 0;
    let confirm = true;
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I);

        if (creep === null) {
            allocatedItems.splice(iter, 1);
            console.log("Creep ded");
            return {
                suceeded: true,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            };
        }

        let item = creep.room.find(FIND_DROPPED_RESOURCES)[0];

        if (item?.resourceType == null) {
            //console.log("This dropped resource died");
            //confirm = true;
            break;
        }
        if (creep.pickup(item) !== OK) {
            creep.moveTo(item,{maxRooms: 1});
        }
        console.log(creep.store.getFreeCapacity(), item);
        if (creep.store.getFreeCapacity() > 0) {
            confirm = false;
        } else {
            creep.moveTo(new RoomPosition(25,25,creep.room.name),{maxRooms: 1});
        }
        //if (item == null) {
            //confirm = true;
        //}
        iter += 1;
    }

    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
