import { partcost,getTrueDistance } from "./general.functions"
import { newid } from "../role.assign"
import { report } from "./roomReporting"
import { PathStep } from "../../typings/helpers"
StructureSpawn.prototype.queueCheck = function() {
    if(this.memory.queue === undefined) {
        this.memory.queue = []
    }
    var errorreg = null
    if(this.memory.queue.length > 0) {
        if(this.memory.queue[0] === null) {
            if(this.memory.queue[1] !== undefined) {
                this.memory.queue[0] = this.memory.queue[1]
            } else {
                this.memory.queue = []
            }
        }
        if(this.room.energyAvailable >= partcost(this.memory.queue[0].modules)) {

            if(this.spawning === null) {
                var test = newid()
                    errorreg = this.spawnCreep(
                        this.memory.queue[0].modules,
                        test,
                    )
                if(errorreg == OK) {
                    if(this.memory.queue[0].baseMemory !== null) {
                        for(let item in this.memory.queue[0].baseMemory) {
                            //@ts-ignore
                            Game.creeps[test].memory[item] = this.memory.queue[0].baseMemory[item]
                        }
                    }
                global.createdunit = 1
                if(this.memory.queue[0].is == "claimer") {
                    if(this.memory.queue[0].baseMemory.check===1) {
                        let index = Memory.longrangemining.indexOf(Memory.longrangemining.filter((a)=>a.room===this.memory.queue[0].baseMemory.reserving)[0]
                    )
                        Memory.longrangemining[index].claimer = test
                    } else {
                        Memory.claimers.push(test)
                    }
                }
                if(this.memory.queue[0].is == "LRB") {
                    Memory.longRangeBuilders.push(test)
                }
                if(this.memory.queue[0].is == "scout") {
                    Memory.scouts.push(test)
                }
                if(this.memory.queue[0].is == "basebreakattack") {
                    let index = Memory.trios.indexOf(Memory.trios.filter((a)=>a.id===this.memory.queue[0].baseMemory.reserving)[0])
                    report.formatImportant(this.room.name,"Trio attacker created")
                    Memory.trios[index].mainCreep = test
                }
                if(this.memory.queue[0].is == "basebreakheal") {
                    report.formatImportant(this.room.name,"Trio healer created")
                    let index = Memory.trios.indexOf(Memory.trios.filter((a)=>a.id===this.memory.queue[0].baseMemory.reserving)[0])
                    Memory.trios[index].healerCreeps.push(test)
                }
                report.formatBasic(this.room.name,"a creep type: "+this.memory.queue[0].is+" was created with error log: "+errorreg)
                this.memory.queue.splice(0,1)
            }
        }
    }
}
    return errorreg
}
StructureSpawn.prototype.queueAppend = function(moduleData,memoryData,creepType,listId=null) {
    this.memory.queue.push({modules: moduleData,baseMemory:memoryData,is:creepType,listid: listId})
    return this.memory.queue.length
}
/**
 * Creates a road via a serialized string
 * @param {String} path path array
 * @param {String} Suceedstorage defines where to store suceeded in memory
 * @returns {Boolean} if the road placement was completely true or false
**/
Creep.prototype.placeRoadByPath = function(path:string|PathStep[],Suceedstorage:string) {
    return
    //@ts-ignore
    if(typeof path!=="string") return
    //@ts-ignore
    if(this.memory["_"+Suceedstorage]){
        //@ts-ignore
        if(this.memory["_"+Suceedstorage].p==path&&this.memory["_"+Suceedstorage].s==true) {
            return true
        }
    }
    let t = true
    //@ts-ignore
    path = Room.deserializePath(path)
    if(path.length == 0) {
        return true
    }
    for(let I of path) {
        //@ts-ignore
        let x = I.x;let y = I.y;let r = this.room.name
            let a = Game.rooms[r].lookAt(x,y)
            let b = true
            for(let _1 in a) {
                if(a[_1].type=="structure") {
                    b=false
                }
            }
            if(b) {
                let s = Game.rooms[r].createConstructionSite(x,y,STRUCTURE_ROAD)
                if(s==ERR_FULL) return false
                if(s==ERR_INVALID_TARGET) t=false
            }
    }
    //@ts-ignore
    this.memory["_"+Suceedstorage]={p:path,s:t}
}
Room.prototype.isNearby = function(roomName) {
    let dist = Math.round(getTrueDistance(new RoomPosition(25,25,this.name),new RoomPosition(25,25,roomName))/50)
    if(dist<=1) return true; else return false;
}
Room.prototype.isSuitable = function(roomName) {
    if(Game.rooms[roomName]===undefined) return true
    if(Game.rooms[roomName].controller===undefined) return true
    if(Game.rooms[roomName].controller?.level===0||Game.rooms[roomName].controller?.level===undefined) return true
    return false
}
Room.prototype.getNearbyActive = function() {
    let retVal = []
    for(let roomT in Game.rooms) {
        let room = Game.rooms[roomT]
        let dist = Math.round(getTrueDistance(new RoomPosition(25,25,this.name),new RoomPosition(25,25,room.name))/50)
        if(dist<=1) {
            retVal.push(room)
        }
    }
    return retVal
}
//@ts-ignore
Room.prototype.getMasterSpawn = function() {
    if(this.memory.masterspawn !== undefined) {
        return Game.getObjectById(this.memory.masterspawn)
    }
    let spawns = this.find(FIND_MY_SPAWNS)
    if(spawns.length===0) {
        return null
    }
    for(let spawn in spawns) {
        if(spawns[spawn].memory.harvesters !== undefined) {
            this.memory.masterspawn = spawns[spawn].id
            return Game.getObjectById(this.memory.masterspawn)
        }
    }
    this.memory.masterspawn = spawns[0].id
    return Game.getObjectById(this.memory.masterspawn)
}
//@ts-ignores
Creep.prototype.dynamicReuse = function() {
    let re = 40
    if(this.pos.findInRange(FIND_CREEPS,2).length>0) re = 10
    if(this.pos.findInRange(FIND_CREEPS,2).length>2) re = 5
    return
}
