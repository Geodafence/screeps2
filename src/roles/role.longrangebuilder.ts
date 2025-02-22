import { ConstructionSite } from "../../typings/construction-site";
import { report } from "../libs/roomReporting"
import { Structure, StructureStorage } from "../../typings/structure";

export function tick(creep: Creep) {
    if (creep === undefined) {
        return;
    }
    if (creep.memory.room !== undefined) {
        if (creep.memory.state === undefined) {
            creep.memory.state = "moving";
        }
        if (creep.memory.state == "moving" && creep.store.getFreeCapacity() == 0) {
            creep.memory.state = "building";
            creep.memory.didDetour = 1
        }
        if (creep.memory.didDetour === undefined) creep.memory.didDetour = 0
        if (creep.memory.state == "building") {
            if (creep.memory.room !== creep.room.name) {
                let moveto = new RoomPosition(25, 25, creep.memory.room);
                creep.moveTo(moveto, {
                    reusePath: 40,
                    plainCost: 2,
                    swampCost: 5,
                    //@ts-ignore
                    /*costCallback(roomName, costMatrix) {
                        if(Memory.scoutedRooms[roomName].controller.owned!==undefined&&Memory.scoutedRooms[roomName].controller.owned!==creep.owner.username) {
                            for(let y = 0; y < 50; y++) {
                                for(let x = 0; x < 50; x++) {
                                    costMatrix.set(x, y, 255);
                                }
                            }
                            return costMatrix
                        }
                    }*/

                })
            } else {
                if (creep.store.getUsedCapacity() === 0) {
                    creep.memory.state = "moving";
                }
                if((creep.room.controller?.level??2)<2) {
                    if(creep.room.controller) {
                        creep.moveTo(creep.room.controller)
                        creep.upgradeController(creep.room.controller)
                    }
                    return
                }
                let find: ConstructionSite[] = creep.room.find(FIND_CONSTRUCTION_SITES);
                let targets:Structure[]|Structure|null = creep.room.find(FIND_STRUCTURES, {
                    filter: (object: Structure) => object.hits < object.hitsMax * 0.50 && (object.structureType !== STRUCTURE_RAMPART||(object.structureType===STRUCTURE_RAMPART&&object.hits<3000))
                    && (object.structureType !== STRUCTURE_WALL||(object.structureType===STRUCTURE_WALL&&object.hits<3000))
                });
                const targets2 = creep.room.find(FIND_STRUCTURES, {
                    filter: (object: Structure) => object.hits < object.hitsMax * 0.30 && (object.structureType !== STRUCTURE_RAMPART||(object.structureType===STRUCTURE_RAMPART&&object.hits<2000))
                    && (object.structureType !== STRUCTURE_WALL||(object.structureType===STRUCTURE_WALL&&object.hits<2000))
                });
                if (find.length > 0 && targets2.length === 0 && creep.memory.extratask!==1) {
                    find.sort((a: ConstructionSite, b: ConstructionSite) => Number((b.structureType === STRUCTURE_SPAWN)) - Number((a.structureType === STRUCTURE_SPAWN)))
                    if (creep.build(find[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(find[0]);
                    }
                } else if ((targets2.length > 0)||creep.memory.extratask===1) {

                    if(targets.length>0) {
                        targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (object: Structure) => object.hits < object.hitsMax * 0.50 && (object.structureType !== STRUCTURE_RAMPART||(object.structureType===STRUCTURE_RAMPART&&object.hits<3000))
                            && (object.structureType !== STRUCTURE_WALL||(object.structureType===STRUCTURE_WALL&&object.hits<3000))
                        });
                        //@ts-ignore
                        if(targets&&targets.length===undefined) {
                            creep.memory.extratask = 1
                            //@ts-ignore
                            if (creep.repair(targets) == ERR_NOT_IN_RANGE) {
                                //@ts-ignore
                                creep.moveTo(targets);
                            }
                        }
                    } else {
                        creep.memory.extratask = 0
                    }
                } else {
                    if (creep.room.controller !== undefined) {
                        let fill = creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||  (Memory.longrangemining[Memory.longrangemining.length-1].creeps.length > 0 && structure.structureType == STRUCTURE_STORAGE)|| (Memory.longrangemining[Memory.longrangemining.length-1].creeps.length > 0 && structure.structureType == STRUCTURE_TOWER)) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                            }
                        });
                        fill.sort((a:Structure, b:Structure) => Number((a.structureType == STRUCTURE_STORAGE || a.structureType == STRUCTURE_TOWER)) - Number((b.structureType == STRUCTURE_STORAGE || b.structureType == STRUCTURE_TOWER)));
                        if(fill.length > 0) {
                            if(creep.transfer(fill[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(fill[0], {reusePath: 20,visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    }
                }
            }
        } else {
            if (creep.memory.didDetour !== 1) {
                //@ts-ignore
                let debug = Game.getObjectById(creep.memory.spawnid).pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: function (struct: Structure) {
                        return struct.structureType == STRUCTURE_STORAGE;
                    }
                });
                //@ts-ignore
                if (creep.ticksToLive < 1000) Game.getObjectById(creep.memory.spawnid).renewCreep(creep);

                if (creep.ticksToLive !== undefined && creep.ticksToLive < 0) {
                    //@ts-ignore
                    creep.moveTo(Game.getObjectById(creep.memory.spawnid));
                } else {
                    if (creep.withdraw(debug, RESOURCE_ENERGY) !== OK) {
                        creep.moveTo(debug, { reusePath: 40 });
                    }
                }
            } else {
                if (creep.store.getFreeCapacity() > 0) {
                    if (creep.memory.registeredsource === undefined) {
                        let source = creep.room.find(FIND_SOURCES)
                        creep.memory.registeredsource = source[Math.floor(source.length * Math.random())].id
                    } else {
                        //@ts-ignore
                        if (creep.harvest(Game.getObjectById(creep.memory.registeredsource)) !== OK) creep.moveTo(Game.getObjectById(creep.memory.registeredsource))
                    }
                    return
                } else {
                    creep.memory.didDetour = 1
                    creep.memory.state = "building";
                }
            }
        }
    } else {
        creep.say("need room");
    }
}
