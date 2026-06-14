import { planConstructor, GoHarvestConstructor } from "Taskmaster/planConstructor";
import { taskReturn } from "Taskmaster/taskdefs";


export function buildBuilding(allocatedItems: Id<Creep>[], planState: planConstructor): taskReturn {
    let iter = 0
    let confirm = true
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I)
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1)
            return {
                suceeded: true,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            }
        }
        let container = creep.room.find(FIND_CONSTRUCTION_SITES)
        let containerfind = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        if (container.length === 0) {
            return {
                suceeded: true,
                status: "nothing to build",
                updatedItems: allocatedItems
            }
        } else if (containerfind) {
            if (creep.build(containerfind) === ERR_NOT_IN_RANGE) {
                creep.moveTo(containerfind)
            }
        }
        if (creep.store.getUsedCapacity() !== 0 || !creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
            confirm = false
        }
        iter += 1
    }


    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function buildContainer(allocatedItems: Id<Creep>[], planState: planConstructor): taskReturn {
    let iter = 0
    let confirm = true
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I)
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1)
            return {
                suceeded: true,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            }
        }
        let container = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (a) => a.structureType === STRUCTURE_CONTAINER
        });

        if (container.length === 0 && creep.room.find(FIND_MY_SPAWNS)[0]) {
            let constructloc = creep.room.find(FIND_MY_SPAWNS)[0].pos;
            let issite = creep.room.lookForAt(
                LOOK_STRUCTURES,
                new RoomPosition(constructloc.x, constructloc.y - 1, creep.room.name)
            );
            if(issite.length===0)
                    new RoomPosition(constructloc.x, constructloc.y - 1, creep.room.name).createConstructionSite(
                        STRUCTURE_CONTAINER
                    );
        } else if (creep.build(container[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container[0]);
        }
        if (creep.store.getUsedCapacity() !== 0 && creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }).length <= 0) {
            confirm = false
        }
        iter += 1
    }


    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function GoUpgradeController(allocatedItems: Id<AnyCreep>[] | Id<Structure>[], planState: GoHarvestConstructor): taskReturn {
    let iter = 0
    let confirm = true
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I)
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1)
            return {
                suceeded: true,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            }
        }
        let controller = creep.room.controller
        if (controller === undefined) {
            return {
                suceeded: true,
                status: "controller doesn't exist",
                updatedItems: allocatedItems
            }
        }

        creep.upgradeController(controller)
        if (!creep.pos.inRangeTo(controller.pos, 2)) {
            creep.moveTo(controller)
        }

        if (creep.store.getUsedCapacity() !== 0) {
            confirm = false
        }
        iter += 1
    }


    return {
        suceeded: confirm,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
