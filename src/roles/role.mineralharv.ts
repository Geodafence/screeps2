


    /** @param {Creep} creep **/
    export function run(creep:Creep) {
        var terminate = 0
        if(creep.memory.state === undefined) {
            creep.memory.state = "mining"
        }
        new RoomVisual(creep.room.name).text('Mineral Harvester, state: '+creep.memory.state, creep.pos.x, creep.pos.y+1, {align: 'center',font:0.3,color:'white',stroke:"white",strokeWidth:0.01});
	    if(creep.memory.state == "mining") {
            var mine = creep.room.find(FIND_MINERALS)[0]
            if(creep.harvest(mine) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mine,{reusePath:40})
            }
            if(creep.store.getFreeCapacity() == 0) creep.memory.state = "storing"
        } else {
            if(creep.store.getUsedCapacity() == 0) {
                creep.memory.state = "mining"
            }
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            var type = creep.room.find(FIND_MINERALS)[0].mineralType
            if(targets.length > 0) {
                if(creep.transfer(targets[0],type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {reusePath: 20,visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
         }
    }

