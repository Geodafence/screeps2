import { StructureRampart } from "../../typings/structure";
import { Allies } from "../libs/allyLibs/allyConsts"
export function checkRampartPassing(room:Room) {
    let confirm = room.find(FIND_HOSTILE_CREEPS, {
        filter: function (creep: Creep) {
            return Allies.indexOf(creep.owner.username) !== -1
        }
    });
    let savedRamparts:StructureRampart[] = []
    for(let creep of confirm) {
        let nearbyRamparts:StructureRampart[] = creep.pos.findInRange(FIND_STRUCTURES,2,{filter:(a)=>a.structureType===STRUCTURE_RAMPART})
        if(nearbyRamparts.length>0) {
            savedRamparts = savedRamparts.concat(nearbyRamparts)
            for(let rampart of nearbyRamparts) gate(rampart)
        }
    }

    let ramparts:StructureRampart[] = room.find(FIND_MY_STRUCTURES,{filter: (a)=>a.structureType===STRUCTURE_RAMPART})
    for(let rampart of ramparts) {
        if(savedRamparts.indexOf(rampart)===-1) rampart.setPublic(false)
    }
}
export function gate(rampart: StructureRampart) {
    let confirm = rampart.pos.findInRange(FIND_HOSTILE_CREEPS,3, {
        filter: function (creep: Creep) {
            return Allies.indexOf(creep.owner.username) === -1
        }
    });
    console.log(confirm)
    if(confirm.length===0&&!rampart.isPublic) {
        console.log(rampart)
        rampart.setPublic(true)
    } else {
        rampart.setPublic(false)
    }
}
