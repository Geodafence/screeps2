/* Harvester, nicknamed "Eco Poker" */

import { register as _register, harvest, remove } from "../libs/general.sourceregistering";
import { filter } from "lodash";
import { Structure } from "../../typings/structure";
import { Allies } from "../libs/allyLibs/allyConsts"

    /** @param {Creep} creep **/
    export function run(creep:Creep) {
        var terminate = 0
        if(creep.memory.state === undefined) {
            creep.memory.state = "mining"
        }
        new RoomVisual(creep.room.name).text('Harvester, state: '+creep.memory.state, creep.pos.x, creep.pos.y+1, {align: 'center',font:0.3,color:'yellow',stroke:"white",strokeWidth:0.01});
	    if(creep.memory.state == "mining") {
            //if(creep.memory.registeredsource === undefined || creep.memory.registeredsource == 0) {
                //creep.moveTo(9,5,{reusePath: 200})
            //}
            _register("usedsources", creep)
            let err = harvest(creep)
            if(err == ERR_NOT_ENOUGH_RESOURCES) {
                creep.moveTo(9,5,{reusePath: 200})
            }
            if(creep.memory.registeredsource===undefined) {
                creep.moveTo(9,5,{reusePath: 200})
            }
            if(creep.store.getFreeCapacity() == 0) creep.memory.state = "storing"
        } else {
            if(creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.state = "mining"
            }
            remove("usedsources", creep)
            if(Memory.longrangemining.length>0) {
                var targets = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||  (Memory.longrangemining[Memory.longrangemining.length-1].creeps.length > 0 && structure.structureType == STRUCTURE_STORAGE)|| (Memory.longrangemining[Memory.longrangemining.length-1].creeps.length > 0 && structure.structureType == STRUCTURE_TOWER)) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        }
                });
            } else {
                var targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||  (structure.structureType == STRUCTURE_STORAGE)|| (structure.structureType == STRUCTURE_TOWER)) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }
            });
            }
            targets.sort((a:Structure, b:Structure) => Number((a.structureType == STRUCTURE_STORAGE || a.structureType == STRUCTURE_TOWER)) - Number((b.structureType == STRUCTURE_STORAGE || b.structureType == STRUCTURE_TOWER)));
            if(creep.room.find(FIND_HOSTILE_CREEPS,{filter: function(creep) {
                return Allies.indexOf(creep.owner.username) === -1
            }}).length > 0) {
                let set = creep.room.find(FIND_MY_STRUCTURES, {filter: function(struct) {
                    return struct.structureType == STRUCTURE_TOWER
                }})
                if(set.length > 0) {
                    targets = set
                }
            }
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {reusePath: 20,visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
         }
         if (
            creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: function (creep:Creep) {
                    return Allies.indexOf(creep.owner.username) === -1
                }
            }).length > 0 &&
            creep.room.find(FIND_MY_CREEPS, {
                filter: function (creep:Creep) {
                    (creep.getActiveBodyparts(ATTACK)||creep.getActiveBodyparts(RANGED_ATTACK)||creep.getActiveBodyparts(HEAL))
                }
            }).length === 0
        ) {
            console.log("harvester enemy detection")
            let alreadyrequested = -1;
            for (let temp in Memory.defenserequests) {
                if (Memory.defenserequests[temp].room == creep.room.name) {
                    alreadyrequested = 1;
                }
            }
            if (alreadyrequested == -1) {
                Memory.defenserequests.push({ x: creep.pos.x, y: creep.pos.y, room: creep.room.name });
            }
            global.defenseNeeded = 40;
            return;
        }
    }
