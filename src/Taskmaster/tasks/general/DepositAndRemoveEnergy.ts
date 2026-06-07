import { GoHarvestConstructor } from "Taskmaster/planConstructor";
import { taskReturn } from "Taskmaster/taskdefs";


export function dropItems(allocatedItems: Id<Creep>[], planState: GoHarvestConstructor): taskReturn {
    let confirm = true
    let iter = 0;
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
        iter += 1
    }
    for (let id of allocatedItems) {
        let c = Game.getObjectById(id).drop(RESOURCE_ENERGY)
        if (c !== OK) {
            confirm = false
        }
    }
    return {
        suceeded: confirm,
        updatedItems: allocatedItems
    }
}
export function depositToSpawn(allocatedItems: Id<AnyCreep>[] | Id<Structure>[], planState: GoHarvestConstructor): taskReturn {
    let iter = 0
    let confirm = true
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I)
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1)
            return {
                suceeded: false,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            }
        }
        let validStructures: StructureConstant[] = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_STORAGE]

        // While using a simple array.includes function could work here, the compiler is a piece of shit and can't figure out that filter will be one of the above structures.
        // Attempting to forcefully typecast the correct structures will also result in the compiler throwing a hissy fit.
        let filter: (StructureExtension | StructureSpawn | StructureContainer | StructureTower)[] = creep.room.find(FIND_STRUCTURES, {
            filter: (a) => a.structureType === STRUCTURE_SPAWN || a.structureType === STRUCTURE_EXTENSION || a.structureType === STRUCTURE_TOWER
        });

        let struct = filter.filter(
            (a) =>
                a.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                (a.structureType !== STRUCTURE_TOWER || a.store.getFreeCapacity(RESOURCE_ENERGY) > 100)
        );

        console.log(allocatedItems.length + " moveTo " + struct);
        if (struct.length > 0) {
            let closest = creep.pos.findClosestByRange(struct);
            if(closest !== null)
                if (creep.transfer(closest, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest);
                }
        } else {
            // More compiler being a dumbass
            //@ts-ignore
            let struct: StructureContainer = creep.room.find(FIND_STRUCTURES, {
                filter: (a) => a.structureType === STRUCTURE_CONTAINER
            })[0];

            if (creep.transfer(struct, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                if (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0) creep.moveTo(struct);
                else creep.moveTo(new RoomPosition(25, 25, creep.room.name));
            }
            if (!struct) {
                creep.moveTo(new RoomPosition(25, 25, creep.room.name));
            } else if (struct.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                creep.moveTo(new RoomPosition(25, 25, creep.room.name));
            }
        }
        if (creep.store.getUsedCapacity() !== 0) {
            confirm = false;
        } else {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name));
        }
        iter += 1
    }


    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
