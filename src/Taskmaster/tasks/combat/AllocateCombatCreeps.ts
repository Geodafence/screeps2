import { FindUpdateRemotesConstructor } from "../../planConstructor";
import { taskReturn } from "../../taskdefs";
import { getCreepLimit } from "../../../consts/EcoConsts";
import { addCoordinates, getTrueDistance } from "../../../functions/misc";
import { CreateGoHaulPlan, CreateGoProtectRoomTask, CreateGoRemoteHaulPlan, CreateGoRemoteMinePlan } from "../../plans";

export function RespondToCombatThreats(room: Room): taskReturn {
    room.memory.flags.threatened = false;

    for (let pointer in Memory.global.defenseRequests) {
        let value = Memory.global.defenseRequests[pointer];


        if (value.creepsAllocated.length === 0)
            if (
                Game.time < value.lastReported + 300   &&
                getTrueDistance(new RoomPosition(25, 25, room.name), new RoomPosition(25, 25, pointer)) < 120
            ) {
                // TODO: Change above from a hardcoded value
                room.memory.flags.threatened = true;

                let creeplist = room.memory.creeps.defenders.all.filter(
                    (a) => !room.memory.creeps.defenders.closed.includes(a) && !Game.getObjectById(a).spawning
                );

                if (creeplist.length > 0) {
                    for (let creep of creeplist) {
                        if (Game.getObjectById(creep) !== undefined)
                            if (taskmaster.ContainsPlan(undefined, undefined, [creep]) === false) {
                                room.memory.creeps.defenders.closed.push(Game.getObjectById(creep).id);
                                taskmaster.AppendPlan(
                                    CreateGoProtectRoomTask(
                                        Game.spawns["Spawn1"].room.name,
                                        pointer,
                                        Game.getObjectById(creep)
                                    )
                                );
                            }
                    }
                }
            } else {
            }
    }

    return {
        status: "no errors",
        suceeded: true
    };
}
