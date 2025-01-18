import { partcost,getTrueDistance } from "../libs/general.functions"
import { newid } from "../role.assign"
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
                console.log("queue opened, attempting to use")
                if(errorreg == OK) {
                    if(this.memory.queue[0].baseMemory !== null) {
                        for(let item in this.memory.queue[0].baseMemory) {
                            Game.creeps[test].memory[item] = this.memory.queue[0].baseMemory[item]
                        }
                    }
                    console.log("dryrun worked, creating fr")
                global.createdunit = 1
                if(this.memory.queue[0].is == "claimer") {
                    Memory.claimers[String(Math.random)] = test
                }
                if(this.memory.queue[0].is == "LRB") {
                    Memory.longRangeBuilders.push(test)
                }
                delete this.memory.queue[0]
                if(this.memory.queue[1] !== undefined) {
                    this.memory.queue[0] = this.memory.queue[1]
                } else {
                    this.memory.queue = []
                }
            } else {
                console.log("ok nvm the dryrun failed with error: "+errorreg)
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
Creep.prototype.placeRoadByPath = function(path,Suceedstorage) {
    return
    if(this.memory["_"+Suceedstorage]){
        if(this.memory["_"+Suceedstorage].p==path&&this.memory["_"+Suceedstorage].s==true) {
            return true
        }
    }
    let t = true
    path = Room.deserializePath(path)
    if(path.length == 0) {
        return true
    }
    for(I in path) {
        let x = path[I].x;let y = path[I].y;let r = this.room.name
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
    this.memory["_"+Suceedstorage]={p:path,s:t}
}
Room.prototype.isNearby = function(roomName) {
    let dist = Math.round(getTrueDistance(new RoomPosition(25,25,this.name),new RoomPosition(25,25,roomName))/50)
    if(dist<=1) return true; else return false;
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
Creep.prototype.dynamicReuse = function() {
    let re = 40
    if(this.pos.findInRange(FIND_CREEPS,2).length>0) re = 10
    if(this.pos.findInRange(FIND_CREEPS,2).length>2) re = 5
    return
}
