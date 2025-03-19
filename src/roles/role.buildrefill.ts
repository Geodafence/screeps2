/**Build refiller, nicknamed "Feeder" */

import { Structure, StructureContainer, StructureStorage } from "../../typings/structure";


/**
 *
 * @param {Creep} creep
 */
export function run(creep:Creep) {
    if(creep.memory.state === undefined) creep.memory.state = "grabbing";
    if(creep.memory.state === "grabbing") {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 100000) ||
                    (structure.structureType === STRUCTURE_SPAWN &&
                        structure.store[RESOURCE_ENERGY] === 300 &&
                        structure.room.controller!==undefined&&structure.room.controller.level < 4)
                );
            }
        });
        if(targets.length > 0)
            if(creep.withdraw(targets[0], RESOURCE_ENERGY)===ERR_NOT_IN_RANGE)
                creep.moveTo(targets[0]);
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY)===0) creep.memory.state="refilling"
    }
    if(creep.memory.state==="refilling"&&creep.room.controller!==undefined) {
        let targets:StructureContainer[] = creep.room.controller.pos.findInRange(FIND_STRUCTURES,5,{filter:(a)=>a.structureType===STRUCTURE_CONTAINER})
        //.sort((a:Creep,b:Creep)=>a.store[RESOURCE_ENERGY]-b.store[RESOURCE_ENERGY])
        if(targets.length>0)
            if(creep.transfer(targets[0],RESOURCE_ENERGY)===ERR_NOT_IN_RANGE)
                creep.moveTo(targets[0])
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY)===0) creep.memory.state = "grabbing";
    }
}
