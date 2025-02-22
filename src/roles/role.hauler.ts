

import { RoomObject } from "../../typings/room-object";

import { Structure } from "../../typings/structure";
import { isNull, isUndefined } from "lodash";
import { report } from "../libs/roomReporting";
import { Id } from "../../typings/helpers";

function flee(creep:Creep, goal:RoomObject,range:number=6) {
    //@ts-ignore
    let goals = { pos: goal.pos, range: range };
    let ret = PathFinder.search(creep.pos, goals, {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 10,
        flee: true,

        roomCallback: function (roomName) {
            let room = Game.rooms[roomName];
            // In this example `room` will always exist, but since
            // PathFinder supports searches which span multiple rooms
            // you should be careful!
            if (!room) return false;
            let costs = new PathFinder.CostMatrix();

            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (
                    struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
                ) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                }
            });

            // Avoid creeps in the room
            room.find(FIND_CREEPS).forEach(function (creep) {
                costs.set(creep.pos.x, creep.pos.y, 0xff);
            });

            return costs;
        }
    });
    let pos = ret.path[0];
    creep.move(creep.pos.getDirectionTo(pos));
    return ret;
}
export function locateMinerCreeps(creep:Creep) {
    return creep.room.find(FIND_MY_CREEPS, {
        filter: function (U) {
            return creep.memory.targetCreeps.includes(U.name);
        }
    });
}
/**
 *
 * @param {Creep} creep
 * @returns
 */
export function tick(creep:Creep) {
    try {
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.moving = false;
        }
        if (creep.store[RESOURCE_OXYGEN] >= 0) {
            creep.drop(RESOURCE_OXYGEN);
        }
        if(creep.memory.endearly === undefined) creep.memory.endearly = 0
        if (creep.memory.patrolling === undefined) {
            let LRMnew = Memory.longrangemining.filter((LRM)=>LRM.room!==undefined)
            LRMnew.sort((a,b)=>Math.random()-Math.random())
            var targetCreep:Id<Creep>|string[] = LRMnew[0].creeps
            var targetRoom = {room: LRMnew[0].room}

            creep.memory.wait = 0;
            creep.memory.endearly = 0;
            creep.memory.cachTarget = undefined;
            creep.memory.cachsource = undefined;
            creep.memory.targetCreeps = targetCreep;
            creep.memory.patrolling = targetRoom;

        }

        new RoomVisual(creep.room.name).text(
            "Hauler, grabbing from room: " + creep.memory.patrolling.room,
            creep.pos.x,
            creep.pos.y + 1,
            { align: "center", font: 0.3, color: "red", stroke: "white", strokeWidth: 0.01 }
        );

        if (
            creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {
                filter: function (creep:Creep) {
                    return creep.owner.username !== "chungus3095" &&
                    (creep.getActiveBodyparts(ATTACK)||creep.getActiveBodyparts(RANGED_ATTACK)||creep.getActiveBodyparts(HEAL))
                }
            }).length > 0 &&
            creep.room.find(FIND_MY_CREEPS, {
                filter: function (creep:Creep) {
                    (creep.getActiveBodyparts(ATTACK)||creep.getActiveBodyparts(RANGED_ATTACK)||creep.getActiveBodyparts(HEAL))
                }
            }).length === 0
        ) {
            let goals:Creep|null = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,  {
                filter: function (creep:Creep) {
                    return creep.owner.username !== "chungus3095" &&
                    (creep.getActiveBodyparts(ATTACK)||creep.getActiveBodyparts(RANGED_ATTACK)||creep.getActiveBodyparts(HEAL))
                }
            })
            if(goals!==null) flee(
                creep,
                goals
            );
            let alreadyrequested = -1;
            for (let temp in Memory.defenserequests) {
                if (Memory.defenserequests[temp].room == creep.room.name) {
                    alreadyrequested = 1;
                }
            }
            if (alreadyrequested == -1) {
                Memory.defenserequests.push({ x: creep.pos.x, y: creep.pos.y, room: creep.room.name });
            }
            creep.memory.endearly += 1;
            global.defenseNeeded = 40;
            return;
        }

        if (creep.memory.targetCreeps.length > 0 && creep.memory.targetCreeps[0] in Game.creeps) {
            let end = Game.creeps[creep.memory.targetCreeps[0]].pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if (!end) {
                report.formatBasic(creep.room.name,"no resources inside this room!")
                creep.memory.endearly += 5;
            }
        }

        if (creep.memory.targetCreeps.length == 0) {
            if(creep.room.name===creep.memory.patrolling.room) {
                let end = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if(!end) {
                    report.formatBasic(creep.room.name,"no resources inside this room (no creeps edition)!")
                    creep.memory.endearly += 5;
                }
            }
        }
        if (creep.memory.patrolling.room !== creep.room.name && creep.memory.moving == false) {

            let move = new RoomPosition(25, 25, creep.memory.patrolling.room);
            Game.map.visual.line(creep.pos,move);
            Game.map.visual.circle(creep.pos,{stroke:"#66BB6A",fill:"#66BB6A",radius:1})
            //@ts-ignore
            creep.moveTo(move, { reusePath: 40, stroke: "white" });
        } else if (creep.memory.moving == false) {
            //@ts-ignore
            if (creep.memory.cachTarget === undefined || !Game.getObjectById(creep.memory.cachTarget)) {
                let nullcheck = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (structure:Resource) => {
                        return (
                            structure.amount >= creep.store.getCapacity() && structure.resourceType === RESOURCE_ENERGY
                        );
                    }
                });
                if (nullcheck !== null) {
                    report.formatBasic("*","reason4?")
                    creep.memory.cachTarget = nullcheck.id;
                } else {
                    creep.memory.cachTarget = nullcheck;
                }
            }
            if (creep.memory.cachTarget === null) {
                report.formatBasic(creep.room.name,"no cachetarget!")
                creep.memory.endearly += 5;
            }
            //@ts-ignore
            if (Game.getObjectById(creep.memory.cachTarget)) {
                //@ts-ignore
                Game.map.visual.line(creep.pos,Game.getObjectById(creep.memory.cachTarget).pos);
                Game.map.visual.circle(creep.pos,{stroke:"#66BB6A",fill:"#66BB6A",radius:1})
                //@ts-ignore
                if (creep.pickup(Game.getObjectById(creep.memory.cachTarget)) == ERR_NOT_IN_RANGE) {
                    //@ts-ignore
                    creep.moveTo(Game.getObjectById(creep.memory.cachTarget), {
                        reusePath: creep.dynamicReuse(),
                        visualizePathStyle: { stroke: "#ffffff" }
                    });
                }
            } else {
                creep.memory.endearly += 1;
            }

            if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
                creep.memory.moving = true;
            }
        } else {
            if (creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.moving = false;
                creep.memory.patrolling = undefined;
            }
            if (
                //@ts-ignore
                Game.getObjectById(creep.memory.spawnid).room.storage &&
                //@ts-ignore
                Game.getObjectById(creep.memory.spawnid).memory.queen !== undefined
            ) {
                //@ts-ignore
                const leepicstorage = Game.getObjectById(creep.memory.spawnid).room.storage;
                if (leepicstorage.id !== undefined) {

                    creep.memory.cachsource = leepicstorage.id;
                } else {
                    creep.say("bad storage");
                }
            }

            if (
                creep.memory.cachsource === undefined ||
                creep.memory.cachsource === null ||
                //@ts-ignore
                (Game.getObjectById(creep.memory.cachsource).store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
                    Game.getObjectById(creep.memory.cachsource))
            ) {
                //@ts-ignore
                let temp = Game.getObjectById(creep.memory.spawnid)
                //@ts-ignore
                    .room.find(FIND_MY_STRUCTURES, {
                        filter: (structure:Structure) => {
                            return (
                                (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN ||
                                    (structure.structureType == STRUCTURE_STORAGE) ||
                                    (structure.structureType == STRUCTURE_TOWER) ||
                                    (structure.structureType == STRUCTURE_CONTAINER)) &&
                                //@ts-ignore
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                            );
                        }
                    })

                    if(temp.length>0) {
                        temp.sort(
                            (a:Structure, b:Structure) =>
                                Number((a.structureType == STRUCTURE_STORAGE || a.structureType == STRUCTURE_TOWER)) -
                                Number((b.structureType == STRUCTURE_STORAGE || b.structureType == STRUCTURE_TOWER))
                        );
                    }
                if (temp.length == 0) {
                    try {
                        //@ts-ignore
                        flee(creep,Game.getObjectById(creep.memory.spawnid),4)
                    } catch(e) {console.log(e)}
                } else {
                    if (temp[0].id !== undefined && temp[0] !== undefined) {
                        creep.memory.cachsource = temp[0].id;
                    } else {
                        creep.say("bad source");
                    }
                }
            }
            //@ts-ignore
            let check = Game.getObjectById(creep.memory.spawnid).room.find(FIND_HOSTILE_CREEPS, {
                filter: function (creep:Creep) {
                    return creep.owner.username !== "chungus3095" &&
                    (creep.getActiveBodyparts(ATTACK)||creep.getActiveBodyparts(RANGED_ATTACK)||creep.getActiveBodyparts(HEAL))
                }
            });
            let oh = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (struct:Structure) => {
                    return struct.structureType == STRUCTURE_TOWER;
                }
            });
            if (check.length > 0&&oh) {
                //@ts-ignore

                if(oh) creep.memory.cachsource = oh.id
            } else {
                //@ts-ignore
                if(!Game.getObjectById(creep.memory.cachsource)) {
                    creep.memory.cachsource = undefined;
                    //@ts-ignore
                } else if (Game.getObjectById(creep.memory.cachsource).structureType == STRUCTURE_TOWER&&check.length>1) {
                    creep.memory.cachsource = undefined;
                }
            }
            if (creep.memory.cachsource) {
                //@ts-ignore
                Game.map.visual.line(creep.pos,Game.getObjectById(creep.memory.cachsource).pos);
                Game.map.visual.circle(creep.pos,{stroke:"#66BB6A",fill:"#66BB6A",radius:1})
                //@ts-ignore
                if (creep.transfer(Game.getObjectById(creep.memory.cachsource), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //@ts-ignore
                    if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.cachsource), 7)) {

                            //@ts-ignore
                            creep.moveTo(Game.getObjectById(creep.memory.cachsource), {
                                reusePath: 10,
                                visualizePathStyle: { stroke: "#ffffff" },
                                maxOps: 250
                            });

                    } else {

                        //@ts-ignore
                        creep.moveTo(Game.getObjectById(creep.memory.cachsource), {
                            reusePath: 90,
                            visualizePathStyle: { stroke: "#ffffff" }
                        });
                    }
                }
            }
        }

        try {
            if (creep.memory.targetCreeps === undefined || creep.memory.endearly > 10) {
                creep.memory.patrolling = undefined;
            }
            if (creep.memory.patrolling.room === undefined) {
                creep.memory.patrolling = undefined;
            }
        } catch {}
    } catch (err) {
        report.formatBasic(creep.room.name,"hauler " + creep.name + " errored with error " + err);
    }
}
