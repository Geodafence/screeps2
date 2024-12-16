export function tick(creep) {
    if (creep === undefined) {
        return;
    }
    if (creep.memory.room !== undefined) {
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.state = "moving";
        }
        if (creep.memory.state == "moving" && creep.store.getFreeCapacity() == 0) {
            creep.memory.state = "building";
        }
        if (creep.memory.state == "building") {
            if (creep.memory.room !== creep.room.name) {
                let moveto = new RoomPosition(25, 25, creep.memory.room);
                creep.moveTo(moveto, { reusePath: 40 });
            } else {
                let find = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (find) {
                    if (creep.build(find[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(find[0]);
                    }
                }
            }
        } else {
            let debug = Game.getObjectById(creep.memory.spawnid).pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function (struct) {
                    return struct.structureType == STRUCTURE_STORAGE;
                }
            });
            if (creep.ticksToLive < 1000) Game.getObjectById(creep.memory.spawnid).renewCreep(creep);
            if (creep.ticksToLive < 400) {
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
