import {run as upgrading } from "../allocation.upgrading";
import { run as general } from "../allocation.building";
import { remove } from "../libs/general.sourceregistering";
function swcCalc(spawnname:string,creep:Creep) {
        //@ts-ignore
    if((Game.spawns[spawnname].room.controller??{level:0}).level>=7) {
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 1 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.general < 4 && creep.memory.task == undefined) {
            creep.memory.task = 'general'
            Game.spawns[spawnname].memory.builderallocations.general += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 3 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }

            //@ts-ignore
    } else if((Game.spawns[spawnname].room.controller??{level:0}).level>=4 ){
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 1 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.general < 2 && creep.memory.task == undefined) {
            creep.memory.task = 'general'
            Game.spawns[spawnname].memory.builderallocations.general += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 2 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }

    } else {
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 1 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.general < 4 && creep.memory.task == undefined) {
            creep.memory.task = 'general'
            Game.spawns[spawnname].memory.builderallocations.general += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 10 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }
    }
}


    /** @param {Creep} creep **/
    export function run(creep:Creep, spawnname:string) {

        if(Memory.isswc) {
            swcCalc(spawnname,creep)
        } else if((Game.spawns[spawnname].room.controller??{level:0})!==undefined&&(Game.spawns[spawnname].room.controller??{level:0}).level>4) {
            if((Game.spawns[spawnname].room.controller??{level:0}).level>=7) {
                if(Game.spawns[spawnname].memory.builderallocations.upgrade < 1 && creep.memory.task == undefined) {
                    creep.memory.task = 'upgrade'
                    Game.spawns[spawnname].memory.builderallocations.upgrade += 1
                }
                if(Game.spawns[spawnname].memory.builderallocations.general < 1 && creep.memory.task == undefined) {
                    creep.memory.task = 'general'
                    Game.spawns[spawnname].memory.builderallocations.general += 1
                }
            } else {
                if(Game.spawns[spawnname].memory.builderallocations.upgrade < 1 && creep.memory.task == undefined) {
                    creep.memory.task = 'upgrade'
                    Game.spawns[spawnname].memory.builderallocations.upgrade += 1
                }
                if(Game.spawns[spawnname].memory.builderallocations.general < 3 && creep.memory.task == undefined) {
                    creep.memory.task = 'general'
                    Game.spawns[spawnname].memory.builderallocations.general += 1
                }
            }
        } else {
            if(Game.spawns[spawnname].memory.builderallocations.upgrade < 4 && creep.memory.task == undefined) {
                creep.memory.task = 'upgrade'
                Game.spawns[spawnname].memory.builderallocations.upgrade += 1
            }
            if(Game.spawns[spawnname].memory.builderallocations.general < 4 && creep.memory.task == undefined) {
                creep.memory.task = 'general'
                Game.spawns[spawnname].memory.builderallocations.general += 1
            }
        }
        new RoomVisual(creep.room.name).text('Builder, task: '+creep.memory.task, creep.pos.x, creep.pos.y+1, {align: 'center',font:0.3,color:'orange',stroke:"white",strokeWidth:0.01});
        if(creep.room.name!==Game.spawns[spawnname].room.name||
            (creep.pos.x===50||creep.pos.x===0||creep.pos.y===50||creep.pos.y===0)
        ) {

            //creep.moveTo(Game.spawns[spawnname])
            //return
        }
        if(creep.memory.task == 'upgrade') {
            upgrading(creep,Game.spawns[spawnname])
	    }
        if(creep.memory.task == 'general') {
            general(creep,Game.spawns[spawnname])
	    }
    }
