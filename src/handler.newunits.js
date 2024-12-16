import { newid, hauler, combat } from "./role.assign";
import { remove } from "./libs/general.sourceregistering";
import { Lremove, partcost } from "./libs/general.functions";
    export function checkharvwant(ref) {
        return Game.spawns[ref].room.find(FIND_SOURCES).length+1;
    }
    export function newharvcheck(spawnname) {
        if(global.defenseNeeded >= 1 || global.createdunit == 1) {
            return
        }
        var neededharvs = checkharvwant(spawnname)
        var allstores = Memory.storecache
        let allstorescheck = Memory.storecache
        var allmodules
        var buildercost
        var allmodulelevels = [
            [MOVE,CARRY,WORK],
            [MOVE,MOVE,CARRY,WORK,WORK],
            [MOVE,MOVE,CARRY,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK],
        ]
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1 || (Memory.haulers.length < 2) || Game.spawns[spawnname].memory.harvesters.length < 2) {
            allstores = 0
            allstorescheck = allstores
        }
        if(global.inDeficit == 1) {
            allstores = global.deficitLevel
        }

        allmodules = allmodulelevels[allstores]
        buildercost = 200+(50*allstores)
        if(allstores >= 4) {
            buildercost = 300+(50*allstores)
        }
        Memory.harvlevel = allstores
        if(!(neededharvs > Memory.spawns[spawnname].harvesters.length)) {
            var endearly = 0
            for(const I in Memory.spawns[spawnname].harvesters) {
                if(!endearly) {
                    var I2 = Memory.spawns[spawnname].harvesters[I]
                    var data = Memory.creeps[I2]
                    data = {memory: data}
                    var actualcreep = Game.creeps[I2]
                    try {
                    if(data.memory.level < Memory.harvlevel) {
                            remove("usedsources",data)
                            Memory.spawns[spawnname].harvesters = Lremove(Memory.spawns[spawnname].harvesters,I2)
                            actualcreep.suicide()
                            endearly = 1
                    }
                } catch(e) {

                }
                }
            }
        }
        if(neededharvs > Memory.spawns[spawnname].harvesters.length) {
            if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                if(Game.spawns[spawnname].spawning === null) {
                    console.log("ok harvester time")
                    if(createharv(allmodules, spawnname) == 0) {
                        global.createdunit = 1
                        return
                    }
                }
            }
        }
        allmodulelevels = [
            [MOVE,CARRY,WORK],
            [MOVE,MOVE,CARRY,WORK,WORK],
            [MOVE,MOVE,CARRY,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK],
            [MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK],
        ]
        var milestones = {25:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}
        allmodules = allmodulelevels[allstores]
        buildercost = partcost(allmodules)
        for(let am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        if(global.isextractor) {
            if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                if(Memory.spawns[spawnname].minharvs === undefined) {
                    Memory.spawns[spawnname].minharvs = []
                }
                let minerals = Game.spawns[spawnname].room.find(FIND_MINERALS,{filter: function(a) {
                    return a.mineralAmount > 0
                }})
                if(Memory.spawns[spawnname].minharvs && (Memory.haulers.length >= global.haulercreations && Memory.longrangemining[4].creeps.length !== 0)&&(Memory.spawns[spawnname].queen2&&Memory.spawns[spawnname].queen)&&minerals.length>0) {
                    if(Memory.spawns[spawnname].minharvs.length < 1) {
                        if(Game.spawns[spawnname].spawning === null) {
                            global.createdunit = 1
                            createminharv(allmodules, spawnname)
                            return
                        }
                    }
                }
            }
        }
        allstores = Memory.storecache
        if(global.inDeficit == 1) {
            allstores = global.deficitLevel
        }
        allstorescheck = Memory.storecache
        allmodulelevels = [
            [MOVE,MOVE,WORK,WORK],
            [MOVE,WORK,WORK,WORK],
            [MOVE,MOVE,WORK,WORK,WORK],
            [MOVE,MOVE,MOVE,WORK,WORK,WORK],
            [MOVE,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK],
            [MOVE,WORK,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],
            [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],
        ]
        milestones = {20:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,WORK,WORK,WORK,WORK,WORK,WORK]}
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1 || Memory.haulers.length < 2) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = 300+(50*allstores)
        for(let am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        if(Memory.storedcreeps.length == 0 && Game.spawns[spawnname].memory.builderallocations.upgrade == 2 && (Memory.haulers.length >= global.haulercreations)) {
            if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
                if(Game.spawns[spawnname].spawning === null) {
                    console.log("I require miner")
                    global.createdunit = 1
                    createminer(allmodules, spawnname)
                    return
                }
            }
        }
    }
    export function createminharv(modules, spawnname) {
        var test = newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(modules, test, {
            memory: {level: Memory.harvlevel}
        })
        if(errorreg == 0) {
            if(Memory.spawns[spawnname].minharvs === undefined) {
                Memory.spawns[spawnname].minharvs = []
            }
            Memory.spawns[spawnname].minharvs.push(test)
        }
        return errorreg
    }
    export function createharv(modules, spawnname) {
        var test = newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(modules, test, {
            memory: {level: Memory.harvlevel}
        })
        if(errorreg == 0) {
            Memory.spawns[spawnname].harvesters.push(test)
        }
        return errorreg
    }
    export function createminer(modules, spawnname) {
        var test = newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(modules, test)
        if(errorreg == 0) {
            Memory.storedcreeps[0] = test
        }
    }
    export function checkbuildwant(ref) {
        return Game.spawns[ref].room.find(FIND_SOURCES).length*2+1
    }
    export function newbuildcheck(spawnname) {
        if(global.createdunit == 1 || global.defenseNeeded >= 1) {
            return
        }
        var allstores = Memory.storecache
        var allstorescheck = Memory.storecache
        var allmodules
        var buildercost
        var allmodulelevels = [
            [WORK, WORK, CARRY, MOVE],
            [WORK, WORK, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY,CARRY,MOVE, MOVE, MOVE],
            [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK],
            [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK],
        ]
        var milestones = {
            //30:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        }
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = 300+(50*allstores)
        for(let am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                allstores = allstorescheck
                buildercost = partcost(allmodules)
            }
        }
        Memory.builderlevel = allstores
        if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
            if(checkbuildwant(spawnname) > Memory.spawns[spawnname].builders.length) {
                if((checkharvwant(spawnname) <= Memory.spawns[spawnname].harvesters.length) ||(Game.spawns[spawnname].memory.builderallocations.upgrade == 0 && Memory.spawns[spawnname].harvesters.length != 0)) {
                    if(Game.spawns[spawnname].spawning == null) {
                        global.createdunit = 1
                        createbuild(spawnname, allmodules)
                        return
                    }
                }
            }
        }
        if(Memory.haulers.length >= global.haulercreations && Memory.storecache >= 40) {
            allmodules=[MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM]
            let need = 0
            for(let AAA in Memory.claimers) {
                need+=1
            }
            if(need<Memory.miningrooms.length&&Game.spawns[spawnname].room.energyAvailable >= 1950) {
                if(Game.spawns[spawnname].spawning == null) {
                    global.createdunit = 1
                    createclaimer(spawnname, allmodules)
                }
            }
        }
    }
    export function newhaulercheck(spawnname) {
        if(global.createdunit == 1 || global.defenseNeeded >= 1) {
            return
        }
        var allstores = Memory.storecache
        var allmodules
        var buildercost
        let allstorescheck = Memory.storecache
        var allmodulelevels = [
            [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        ]
        var milestones = {
            20:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
            //after testing again, return on investment is absolutely not worthwhile at this point in time
            //30:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        }
        if(global.inDeficit == 1) {
            allstores = global.deficitLevel
        }
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1
        }
        if(Game.spawns[spawnname].room.controller.level == 1|| (Memory.haulers.length < 4)) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = allmodules.length*50
        for(let am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allstores=am
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        if(Game.spawns[spawnname].room.energyAvailable >= buildercost) {
            if(((Memory.spawns[spawnname].queen === undefined&&Memory.haulers.length>3) || (Memory.spawns[spawnname].queen2 === undefined&&global.restartEco===undefined))&& Game.spawns[spawnname].room.controller.level > 3&&Game.spawns[spawnname].room.storage) {
                    if(Game.spawns[spawnname].spawning == null) {
                        global.createdunit = 1
                        createqueen(spawnname, allmodules)
                        return
                    }
                }
        }
        if(Memory.haulerlevel <= Memory.storecache) {
            if((Math.ceil((Memory.haulerneeded+(allmodules.length/2))/(allmodules.length/2)/3)) >= Memory.haulers.length) {
                global.restartEco = spawnname
            } else {
                global.restartEco = undefined
            }

            Memory.haulerlevel = Memory.storecache

            if(Game.spawns[spawnname].room.energyAvailable >= buildercost && Memory.haulers.length < Math.ceil((Memory.haulerneeded+(allmodules.length/2))/(allmodules.length/2))) {
            if(checkbuildwant(spawnname) <= Memory.spawns[spawnname].builders.length &&(Memory.haulers.length < 3 || (Memory.spawns[spawnname].queen !== undefined||Game.spawns[spawnname].room.controller.level <= 3))) {
                if((checkharvwant(spawnname) <= Memory.spawns[spawnname].harvesters.length)) {
                    if(Game.spawns[spawnname].spawning == null) {
                            global.createdunit = 1
                            createhauler(spawnname, allmodules)
                            return
                        }
                    }
                }
            }
        }
    }
    export function newcombatcheck(spawnname) {
        if((global.createdunit == 1|| global.defenseNeeded < 1)&&Game.flags.attack === undefined) {
            return
        }
        var allstores = Memory.storecache
        var allmodules
        var buildercost
        let allstorescheck = Memory.storecache
        var allmodulelevels = [
        [TOUGH, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH,MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH, MOVE, MOVE, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH,MOVE, MOVE, MOVE, TOUGH, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK],
        [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,RANGED_ATTACK]
        ]
        var milestones = {
            20:[TOUGH,TOUGH,TOUGH,TOUGH,MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,MOVE,HEAL],
            30:[TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL],
            40:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL]
        }
        if(allmodulelevels.length-1 < allstores) {
            allstores = allmodulelevels.length-1

        }
        if(Game.spawns[spawnname].room.controller.level == 1) {
            allstores = 0
            allstorescheck = allstores
        }
        allmodules = allmodulelevels[allstores]
        buildercost = partcost(allmodules)
        for(let am in milestones) {
            if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        Memory.combatlevel = allstores
        if((Game.spawns[spawnname].room.energyAvailable >= buildercost) && (Memory.storedcreeps.length >= 1|| global.defenseNeeded >= 1)) {
            if((checkbuildwant(spawnname)<= Memory.spawns[spawnname].builders.length && Memory.fighters.length < 12)|| global.defenseNeeded >= 1) {
                if((checkharvwant(spawnname) <= Memory.spawns[spawnname].harvesters.length)|| global.defenseNeeded >= 1) {
                    if(Game.spawns[spawnname].spawning == null) {
                        global.createdunit = 1
                        console.log(createcombat(spawnname, allmodules))
                    }
                }
            }
        }
    }
    export function createclaimer(spawnname, moduledata) {
        let regas = -1
        for(let I in Memory.miningrooms) {
            if(Game.rooms[Memory.miningrooms[I].room]) {
                if(I in Memory.claimers === false&&(Game.rooms[Memory.miningrooms[I].room].controller!==undefined)) {
                    if(Game.rooms[Memory.miningrooms[I].room].controller.level===0) {
                        regas = I
                        break
                    }
                } else if(I in Memory.claimers === false&&(Game.rooms[Memory.miningrooms[I].room].controller===undefined)) {
                    regas = I
                    break
                }
            }
        }
        if(regas!==-1) {
            var test = newid()
            console.log("attemping to create a claimer with id: "+ test)
            var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
                memory: {spawnid: Game.spawns[spawnname].id}
            })
            console.log("errorlog: "+errorreg)
            if(errorreg == 0) {
                Memory.claimers[regas]=test
            }
        } else {
            global.createdunit = 0
        }
    }
    export function createqueen(spawnname, moduledata) {
        var test = newid()
        console.log("attemping to create a creep with id: "+ test)
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {spawnid: Game.spawns[spawnname].id}
        })
        console.log("errorlog: "+errorreg)
        if(errorreg == 0) {
            if(Memory.spawns[spawnname].queen === undefined) {
                Memory.spawns[spawnname].queen = test
            } else if(Memory.spawns[spawnname].queen2 === undefined) {
                Memory.spawns[spawnname].queen2 = test
            }
        }
    }
    export function createhauler(spawnname, moduledata) {
        var test = newid()
        console.log("attemping to create a creep with id: "+ test)
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {level: Memory.haulerlevel,spawnid: Game.spawns[spawnname].id}
        })
        console.log("errorlog: "+errorreg)
        if(errorreg == OK) {
            hauler(test);
        }
    }
    export function createbuild(spawnname, moduledata) {
        var test = newid()
        console.log("attemping to create a creep with id: "+ test)
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {level: Memory.builderlevel}
        })
        console.log("errorlog: "+errorreg)
        if(errorreg == 0) {
            Memory.spawns[spawnname].builders.push(test)
        }
    }
    export function createcombat(spawnname, moduledata) {
        var test = newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: {level: Memory.combatlevel}
        })
        if(errorreg == 0) {
        combat(test);
        }
        return errorreg
    }
