import {run as upgrading } from "../allocation.upgrading";
import { run as general } from "../allocation.building";
import { remove } from "../libs/general.sourceregistering";
function swcCalc(spawnname:string,creep:Creep) {
    if(Game.spawns[spawnname].room.controller.level>=7) {
        if(Game.spawns[spawnname].memory.builderallocations.upgrade < 2 && creep.memory.task == undefined) {
            creep.memory.task = 'upgrade'
            Game.spawns[spawnname].memory.builderallocations.upgrade += 1
        }
        if(Game.spawns[spawnname].memory.builderallocations.general < 2 && creep.memory.task == undefined) {
            creep.memory.task = 'general'
            Game.spawns[spawnname].memory.builderallocations.general += 1
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
}


    /** @param {Creep} creep **/
    export function run(creep:Creep, spawnname:string) {

        if(Memory.isswc) {
            swcCalc(spawnname,creep)
        } else if(Game.spawns[spawnname].room.controller!==undefined&&Game.spawns[spawnname].room.controller.level>4) {
            if(Game.spawns[spawnname].room.controller.level>=7) {
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
        if(creep.memory.level!==undefined&&creep.memory.level < Memory.builderlevel) {
            if(creep.memory.task != undefined) {
                //@ts-ignore
                Game.spawns[spawnname].memory.builderallocations[creep.memory.task] -= 1
                if(creep.memory.task == 'general') {
                    remove("buildersources",creep)
                }
                if(creep.memory.task == 'upgrade') {
                    remove("upgradersources",creep);
                }
                creep.memory.task = undefined
            }
                creep.suicide()
        }
        if(creep.room.name!==Game.spawns[spawnname].room.name) {
            creep.moveTo(Game.spawns[spawnname])
            return
        }
        if(creep.memory.task == 'upgrade') {
            upgrading(creep)
	    }
        if(creep.memory.task == 'general') {
            general(creep)
	    }
    }
