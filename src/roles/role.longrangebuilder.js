export function tick(creep) {
    if (creep === undefined) {
        return;
    }
    if (creep.memory.room !== undefined) {
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.state = "moving";
            if(creep.memory.didDetour===1) creep.memory.didDetour=undefined
        }
        if (creep.memory.state == "moving" && creep.store.getFreeCapacity() == 0) {
            creep.memory.state = "building";
            if(creep.memory.didDetour===20) creep.memory.didDetour=undefined
        }
        if (creep.memory.state == "building") {
            if(creep.memory.room==="E5S31") {
                if(creep.memory.didDetour!==1) {
                    creep.memory.room="E5S33"
                }
            }
            if(creep.memory.room==="E5S33") {
                if(creep.room.name===creep.memory.room) {
                    creep.memory.room="E5S31"
                    creep.memory.didDetour=1
                }
            }
        }
        if(creep.memory.didDetour===undefined) creep.memory.didDetour=0
        if (creep.memory.state == "building") {
            if (creep.memory.room !== creep.room.name) {
                let moveto = new RoomPosition(25, 25, creep.memory.room);
                creep.moveTo(moveto, { reusePath: 40 });
            } else {
                let find = creep.room.find(FIND_CONSTRUCTION_SITES);
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax*0.50&&object.structureType!==STRUCTURE_WALL&&object.structureType!==STRUCTURE_RAMPART
                });
                const targets2 = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax*0.30&&object.structureType!==STRUCTURE_WALL&&object.structureType!==STRUCTURE_RAMPART
                });
                if (find&&targets2.length===0) {
                    find.sort((a,b) => (b.structureType === STRUCTURE_SPAWN)-(a.structureType === STRUCTURE_SPAWN))
                    if (creep.build(find[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(find[0]);
                    }
                } else {
                    if(targets2.length>0) {
                        if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                        }
                    }
                }
            }
        } else {
            if(Game.getObjectById(creep.memory.spawnid).room.name==="E7S33"&&creep.memory.room==="E5S31") {
                if(creep.memory.didDetour<=20) {
                    creep.moveTo(new RoomPosition(25,25,"E5S33"))
                    if(creep.room.name==="E5S33") creep.memory.didDetour += 2
                    return
                }
            }
            let debug = Game.getObjectById(creep.memory.spawnid).pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function (struct) {
                    return struct.structureType == STRUCTURE_STORAGE;
                }
            });
            if (creep.ticksToLive < 1000) Game.getObjectById(creep.memory.spawnid).renewCreep(creep);

            if (creep.ticksToLive < 0) {
                creep.moveTo(Game.getObjectById(creep.memory.spawnid));
            } else {
                if (creep.withdraw(debug, RESOURCE_ENERGY) !== OK) {
                    creep.moveTo(debug, { reusePath: 40 });
                }
            }

        }
    } else {
        creep.say("need room");
    }
}
