function flee(creep, goal) {
    let goals = { pos: goal.pos, range: 6 };
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
            if (!room) return;
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
import { getseed } from "../libs/general.functions";
import { isNull, isUndefined } from "lodash";
export function locateMinerCreeps(creep) {
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
export function tick(creep, focuson) {
    try {
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.moving = false;
        }
        if (creep.store[RESOURCE_OXYGEN] >= 0) {
            creep.drop(RESOURCE_OXYGEN);
        }
        if (creep.memory.patrolling === undefined) {
            var targetRoom;
            var targetCreep;
            var roomyoink;
            var grab;
            do {
                grab = Math.round(Math.random() * Memory.miningrooms.length);
                roomyoink = Memory.longrangemining[grab];
                creep.memory.lastRoom = targetRoom;
                targetCreep = roomyoink.creeps;
                targetRoom = Memory.miningrooms[grab];
            } while (targetRoom == Memory.lastRoom && targetCreep.length == 0);
            creep.memory.targetCreeps = targetCreep;
            creep.memory.patrolling = targetRoom;
            creep.memory.lastRoom = targetRoom;
            creep.memory.wait = 0;
            creep.memory.endearly = 0;
            creep.memory.cachTarget = undefined;
            creep.memory.cachsource = undefined;
            creep.memory.spawnid = undefined;

            creep.memory.seed = getseed();
        }
        if (creep.memory.endearly === undefined) {
            creep.memory.endearly = 0;
        }
        if (
            isNull(Game.getObjectById(creep.memory.spawnid)) ||
            isUndefined(creep.memory.spawnid) ||
            creep.memory.spawnid === 0
        ) {
            /*
            new focus system allows for active balancing rather than randomizing
            let keys = []
            for (var key in Game.spawns) {
                keys.push(key);
            }
            let val= Game.spawns[keys[Math.floor(Math.random()*keys.length)]].id
            if(val==="Spawn2") {
                val= Game.spawns[keys[Math.floor(Math.random()*keys.length)]].id
            }
            */
            let val = focuson;
            if(Game.spawns[val]) {
                creep.memory.spawnid = Game.spawns[val].id;
            } else {
                creep.say("bad spawn")
            }
        }
        new RoomVisual(creep.room.name).text(
            "Hauler, grabbing from room: " + creep.memory.patrolling.room,
            creep.pos.x,
            creep.pos.y + 1,
            { align: "center", font: 0.3, color: "red", stroke: "white", strokeWidth: 0.01 }
        );
        if (
            creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {
                filter: function (creep) {
                    return creep.owner.username !== "chungus3095";
                }
            }).length > 0
        ) {
            flee(
                creep,
                creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, 5, {
                    filter: function (creep) {
                        return creep.owner.username !== "chungus3095";
                    }
                })
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
                creep.memory.endearly += 5;
            }
        }

        if (creep.memory.targetCreeps.length == 0) {
            creep.memory.endearly += 5;
        }
        if (global.restartEco !== undefined) {
            creep.memory.spawnid = restartEco.id;
        }
        if (creep.memory.patrolling.room !== creep.room.name && creep.memory.moving == false) {
            //if(creep.memory.targetCreeps.length > 0) {
            //    if(creep.memory.targetCreeps[0] in Memory.LRMpaths) {
            //        creep.moveByPath(Memory.LRMpaths[creep.memory.targetCreeps[0]])
            //    }
            //} else {
            let move = new RoomPosition(25, 25, creep.memory.patrolling.room);
            creep.moveTo(move, { reusePath: 40, stroke: "white" });
            // }
        } else if (creep.memory.moving == false) {
            if (creep.memory.cachTarget === undefined || !Game.getObjectById(creep.memory.cachTarget)) {
                let nullcheck = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: structure => {
                        return (
                            structure.amount >= creep.store.getCapacity() && structure.resourceType === RESOURCE_ENERGY
                        );
                    }
                });
                if (nullcheck !== null) {
                    creep.memory.cachTarget = nullcheck.id;
                } else {
                    creep.memory.cachTarget = nullcheck;
                }
            }
            if (creep.memory.cachTarget === null) {
                creep.memory.endearly += 5;
            }
            if (Game.getObjectById(creep.memory.cachTarget)) {
                if (creep.pickup(Game.getObjectById(creep.memory.cachTarget)) == ERR_NOT_IN_RANGE) {
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
            //var targets = Game.getObjectById(creep.memory.spawnid).room.find(FIND_STRUCTURES, {
            //        filter: (structure) => {
            //            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || (Memory.longrangemining[1].creeps.length > 0 && structure.structureType == STRUCTURE_CONTAINER)|| (Memory.longrangemining[1].creeps.length > 0 && structure.structureType == STRUCTURE_TOWER)) &&
            //                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            //        }
            //});
            //targets = seededshuffle(targets,creep.memory.seed)
            //if(targets.length > 0) {
            //    if(creep.transfer(targets[0], RESOURCE_ENERGY) !== OK) {
            //        creep.moveTo(targets[0], {reusePath: 10,visualizePathStyle: {stroke: '#ffffff'}});
            //    }
            //}
            let leepicstorage = Game.getObjectById(creep.memory.spawnid).room.find(FIND_STRUCTURES, {
                filter: structure => {
                    return structure.structureType == STRUCTURE_STORAGE;
                }
            });

            if (leepicstorage && Game.getObjectById(creep.memory.spawnid).memory.queen !== undefined) {
                leepicstorage = leepicstorage[0];
                creep.memory.cachsource = leepicstorage.id;
            }

            if (
                creep.memory.cachsource === undefined ||
                creep.memory.cachsource === null ||
                (Game.getObjectById(creep.memory.cachsource).store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
                    Game.getObjectById(creep.memory.cachsource))
            ) {
                let temp = Game.getObjectById(creep.memory.spawnid)
                    .room.find(FIND_MY_STRUCTURES, {
                        filter: structure => {
                            return (
                                (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN ||
                                    (Memory.haulers.length > 6 && structure.structureType == STRUCTURE_STORAGE) ||
                                    (Memory.haulers.length > 6 && structure.structureType == STRUCTURE_TOWER)) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0&&structure.isActive()
                            );
                        }
                    })
                    .sort(
                        (a, b) =>
                            (a.structureType == STRUCTURE_STORAGE || a.structureType == STRUCTURE_TOWER) -
                            (b.structureType == STRUCTURE_STORAGE || b.structureType == STRUCTURE_TOWER)
                    );
                if (temp.length == 0) {
                    creep.memory.spawnid = 0;
                } else {
                    creep.memory.cachsource = temp[0].id;
                }
            }
            let check = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: function (creep) {
                    return creep.owner.username !== "chungus3095";
                }
            });
            if (check.length > 0) {
                creep.memory.cachsource = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: structure => {
                        return structure.structureType == STRUCTURE_TOWER;
                    }
                }).id;
            } else {
                if (Game.getObjectById(creep.memory.cachsource).structureType == STRUCTURE_TOWER) {
                    creep.memory.cachsource = undefined;
                }
            }
            if (creep.memory.cachsource) {
                if (creep.transfer(Game.getObjectById(creep.memory.cachsource), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.cachsource), 7)) {
                        creep.moveTo(Game.getObjectById(creep.memory.cachsource), {
                            reusePath: 10,
                            visualizePathStyle: { stroke: "#ffffff" },
                            maxOps:250
                        });
                    } else {
                        creep.moveTo(Game.getObjectById(creep.memory.cachsource), {
                            reusePath: 90,
                            visualizePathStyle: { stroke: "#ffffff" },
                        });
                    }
                }
            }
            // if(creep.transfer(Game.getObjectById(creep.memory.spawnid),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //     console.log(Game.getObjectById(creep.memory.spawnid))
            //      creep.moveTo(Game.getObjectById(creep.memory.spawnid), {reusePath:40, stroke: 'white'});
            // }
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
        console.log("hauler " + creep.name + " errored with error " + err);
    }
}
