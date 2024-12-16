import { fufillrequest, getrequest } from "../libs/item-request-lib"
import { getTrueDistance } from "../libs/general.functions"
/**
 *
 * @param {*} masterSpawn
 * @returns {StructureLink}
 */
function getMasterLink(masterSpawn) {
    let links = masterSpawn.room.find(FIND_MY_STRUCTURES,{filter: function(structure) {
        return structure.structureType === STRUCTURE_LINK
    }})
    let link = 0
    let range = 999999
    for(let I in links) {
        if(getTrueDistance(links[I].pos,masterSpawn.pos)<range) {
            range = getTrueDistance(links[I].pos,masterSpawn.pos)
            link = links[I]
        }
    }
    return link
}
    /**
     *
     * @param {Creep} creep
     * @param {*} queenType
     */
    export function tick(creep,queenType) {
        if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()&&creep.memory.fufilling===undefined) {
            creep.memory.state = "moving"
        }
        if(creep.store[RESOURCE_ENERGY] == 0 || creep.memory.state === undefined) {
            creep.memory.state = "grabbing"
        }
        if(creep.memory.state == "grabbing") {
            try {
                fufillrequest(creep)
            } catch(e) {}
        }
        if(creep.memory.fufilling===undefined||creep.memory.state == "moving") {
        if(creep.memory.state == "grabbing") {
            var target = Game.getObjectById(creep.memory.spawnid).room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                }
            })
            if(target) {
                let amog = getMasterLink(creep.room.getMasterSpawn())
                if(amog) {
                    if(amog.store[RESOURCE_ENERGY]>creep.store.getCapacity()) {
                        target = [getMasterLink(creep.room.getMasterSpawn())]
                    }
                }
                    target = target[0]
                    if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target,{reusePath: 20})
                    }
                    if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES) {
                        getrequest(creep)
                    }
            }
        } else {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            })
            if(creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < 2000&&object.structureType===STRUCTURE_RAMPART
            }).length>0) {
                console.log("emergancy rampart repair online for "+Game.getObjectById(creep.memory.spawnid).name)
                var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                })
            }
            if(target) {
            } else {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500;
                    }
                })
                if(!target) {
                    getrequest(creep)
                }

            }
            let check = creep.room.find(FIND_HOSTILE_CREEPS,{filter: function(creep) {
                return creep.owner.username !== "chungus3095"
            }});
            if(check.length > 0) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER&&structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500;
                }
            })
            }
            if(target) {
                if(creep.transfer(target,RESOURCE_ENERGY) !== OK) {
                    creep.moveTo(target,{reusePath: 10})
                }
            }
        }
    }
    }
