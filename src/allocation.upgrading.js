import { register as _register, harvest, remove } from "./libs/general.sourceregistering";
    export function run(creep) {
        if(creep.store.getFreeCapacity() != 0 && creep.memory.state != "moving") {
	        //register.register("upgradersources",creep);
            //register.harvest(creep)
            //if(creep.withdraw(Game.getObjectById("67374ee88353ed00121a6e84"),RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            //    creep.moveTo(Game.getObjectById("67374ee88353ed00121a6e84"))
            //}

            //they use too much from the storages
			var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > 100000;
                }
        	});
			if(targets.length > 0) {
            	if(creep.withdraw(targets[0],RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                	creep.moveTo(targets[0],{reusePath: 40})
                }
			} else {
				// Register the creep to a source if not already registered
				if(creep.memory.registeredsource == undefined || creep.memory.registeredsource == 0) {
				    _register("upgradersources", creep);
				}
				// Harvest energy from the assigned source
				harvest(creep);
			}
        } else {
	       remove("upgradersources",creep);
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller,{reusePath: 40,visualizePathStyle: {stroke: '#f46f02'}});
                creep.memory.state = "moving"
            }
            if(creep.memory.state == "moving") {
                if(creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.state = 0
                }
            }
        }
    }
