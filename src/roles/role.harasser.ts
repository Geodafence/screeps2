import { combatCalc } from "./role.combat"
export function tick(creep:Creep) {
    if(creep.room.name!==creep.memory.room&&creep.memory.room!==undefined) {
        let targetCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter:(a)=>{
            return (a.getActiveBodyparts(ATTACK)>0||a.getActiveBodyparts(RANGED_ATTACK)>0||a.getActiveBodyparts(HEAL)>0)
        }})
        if(targetCreep) {
            combatCalc(creep,targetCreep,false)
            return
        } else {
            if(creep.getActiveBodyparts(HEAL) > 0&&creep.saying !== "ATTACK"&&creep.hits<creep.hitsMax)  {
                creep.heal(creep)
            }
        }
        creep.moveTo(new RoomPosition(25,25,creep.memory.room),{reusePath:50})
    } else if(creep.memory.room!==undefined) {
        let enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if(enemy) {
            combatCalc(creep,enemy,false)
        } else {
            if(creep.getActiveBodyparts(HEAL) > 0&&creep.saying !== "ATTACK"&&creep.hits<creep.hitsMax)  {
                creep.heal(creep)
            }
            creep.moveTo(new RoomPosition(25,25,creep.memory.room),{reusePath:50})
        }
    }
}
