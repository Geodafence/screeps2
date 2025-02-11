import { register as _register, harvest, remove } from "./libs/general.sourceregistering";

import { AnyStructure } from "../typings/structure";

    /**
     *
     * @param {Creep} creep
     */
    export function run(creep:Creep) {
        if(creep.store.getFreeCapacity() != 0 && creep.memory.state != "moving") {
	        //register.register("upgradersources",creep);

            //they use too much from the storages
            var targets: Resource<ResourceConstant>[] | AnyStructure[]
			targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 100000) ||
                    (structure.structureType===STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY]===300&&structure.room.controller!==undefined&&structure.room.controller.level<4)
                }
        	});
            var targets2 = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (res) => {
                    return res.resourceType===RESOURCE_ENERGY
                }
        	});
            if(targets2.length>0&&targets.length===0) targets = targets2
			if(targets.length > 0) {
                if(targets[0] instanceof Resource) {
                    if(creep.pickup(targets[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0],{reusePath: 40})
                    }
                } else {
                    if(creep.withdraw(targets[0],RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0],{reusePath: 10})
                    }
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
           //@ts-ignore
           creep.moveTo(creep.room.controller,{reusePath: 40,visualizePathStyle: {stroke: '#f46f02'}});
           //@ts-ignore
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.memory.state = "moving"
            }
            if(creep.memory.state == "moving") {
                if(creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.state = 0
                }
            }
        }
    }
