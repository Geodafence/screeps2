import { GoHarvestConstructor, planConstructor } from "../../planConstructor";
import { taskReturn } from "../../taskdefs";
import { strengthCalc } from "../../../imports/StrengthCalculator";
import { flee } from "../../../functions/misc";
const StrCalc = new strengthCalc();
export function ProtectRoom(allocatedItems: Id<Creep>[], planState: planConstructor): taskReturn {
    let iter = 0;
    let confirm = true;
    for (let I of allocatedItems) {
        let creep = Game.getObjectById(I);
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1);
            if(allocatedItems.length === 0) {
                return {
                    suceeded: true,
                    status: "All creeps dead",
                    updatedItems: allocatedItems
                };
            }
            continue;
        }

        let attack = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (attack) {
            creep.memory.noAttackers = 0;
            combatCalc(creep, attack);
        } else {
            creep.memory.noAttackers = creep.memory.noAttackers || 0;
            creep.memory.noAttackers += 1;
            creep.moveTo(25, 25, { range: 12 });
            let reported = Memory.global.defenseRequests[creep.room.name] || { lastReported: 0 };
            if (Game.time > reported.lastReported && planState.roomName) {
                Memory.rooms[planState.roomName].creeps.defenders.closed.splice(
                    Memory.rooms[planState.roomName].creeps.defenders.closed.indexOf(creep.id),
                    1
                );
                return {
                    suceeded: true,
                    status: "no errors",
                    updatedItems: allocatedItems
                };
            }
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function combatCalc(creep: Creep, target: Creep | Structure, bescared = true) {
    if (creep.getActiveBodyparts(HEAL) > 0 && creep.saying !== "ATTACK") {
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        } else {
            let targetCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (a) => {
                    return (
                        (a.getActiveBodyparts(ATTACK) > 0 ||
                            a.getActiveBodyparts(RANGED_ATTACK) > 0 ||
                            a.getActiveBodyparts(HEAL) > 0) &&
                        a.hits < a.hitsMax
                    );
                }
            });
            if (targetCreep) {
                if (creep.heal(targetCreep) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetCreep);
                }
            }
        }
    }
    let knownPossible = true;
    //if (StrCalc.canWinRoom(creep.room) === false && bescared) {
        //if(creep.pos.x>=50||creep.pos.x<=0||creep.pos.y>=50||creep.pos.y<=0) {
        //creep.moveTo(new RoomPosition(25,25,creep.room.name))
        //return
        //}
    //    creep.moveByPath(flee(creep, target, 6));

    //    let alreadyrequested = -1;
    //    knownPossible = false;
    //}
    if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
        if (creep.pos.getRangeTo(target) < 3) {
            let hide = creep.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                filter: (structure: Structure) => {
                    return structure.structureType == STRUCTURE_RAMPART;
                }
            });
            if (hide.length > 0 && knownPossible) {
                creep.moveTo(hide[0]);
            } else if (creep.getActiveBodyparts(ATTACK) === 0 && knownPossible) {
                creep.moveByPath(flee(creep, target, 3));
            }
        }
        if (
            creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {
            }).length > 10
        ) {
            creep.rangedMassAttack();
        } else creep.rangedAttack(target);
        if (creep.pos.getRangeTo(target) > 3 && knownPossible) {
            creep.moveTo(target);
        }
        creep.say("RANGED_ATTACK");
    }
    if (creep.getActiveBodyparts(ATTACK) > 0) {
        if (creep.attack(target) == ERR_NOT_IN_RANGE && knownPossible) {
            creep.moveTo(target);
            creep.say("ATTACK");
        }
    }
}
