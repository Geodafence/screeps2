import { GoHarvestConstructor, planConstructor } from "Taskmaster/planConstructor";
import { taskReturn } from "Taskmaster/taskdefs";


export function removeCreepFromList(allocatedItems: Id<Creep>[], planState: planConstructor): taskReturn {
    let namemapping: { [taskname: string]: string } = {
        goHarvest: "harvesters",
        goHaul: "haulers",
        goUpgrade: "upgraders",
        goBuild: "builders",
        goScout: "scouts",
        goRemoteMine: "remoteminers",
        goQueen: "queens"
    };
    let removeFrom = namemapping[planState.type]
    for (let creep of allocatedItems) {
        let getroom = (Game.getObjectById(creep) !== null) ? Game.getObjectById(creep).room : (planState.roomName !== undefined) ? Game.rooms[planState.roomName] : null
        let creepget = Game.getObjectById(creep)
        if (getroom === null) {
            console.log("RemoveCreepFromList is unable to pinpoint the room a dead creep is from! Forcefully ending the task to prevent crashes")
            return {
                suceeded: true, status: "unable to find room"
            }
        }
        if (getroom.memory.creeps === undefined) {
            if ((planState.roomName !== undefined) && creepget !== null) {
                creepget.moveTo(new RoomPosition(25, 25, planState.roomName))
                return {
                    suceeded: false, status: "creep is not in main room"
                }
            } else {
                return {
                    suceeded: true, status: "creep doesn't exist and unable to find room"
                }
            }
        }
        getroom.memory.creeps[removeFrom].closed.splice(getroom.memory.creeps[removeFrom].closed.indexOf(creep), 1)
    }
    return {
        suceeded: true, status: "removed"
    }
}
export function nulltask(allocatedItems: Id<AnyCreep>[] | Id<Structure>[], planState: planConstructor): taskReturn {
    return { suceeded: true, status: "Parent" };
}
export function reverseRoomAndPlanId(allocatedItems: Id<AnyCreep>[] | Id<Structure>[], planState: planConstructor): taskReturn {
    let rn = planState.roomName;
    planState.roomName = planState.targetId;
    planState.targetId = rn;
    return {suceeded: true, status: "Parent" };
}
