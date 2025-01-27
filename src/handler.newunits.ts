import { newid, hauler, combat } from "./role.assign";
import { remove } from "./libs/general.sourceregistering";
import { Lremove, partcost } from "./libs/general.functions";
import { Mineral } from "../typings/mineral";
import { report } from "./libs/roomReporting"
/**
 * @param {String} spawnname name of spawn to run with.
 *@deprecated this is no longer needed
 * A simple function that calls all base unit functions
 */
/*export function callunitfunctions(spawnname) {
    Game.spawns[spawnname].queueCheck()
    newunitcheck(spawnid);
    newbuildcheck(spawnid);
    newhaulercheck(spawnid);
    newcombatcheck(spawnid);

}*/
function b() {

}
/**
 *
 * @param {String} spawnname Name of spawn to run with
 * @param {Array} allmodulelevels A list of modules, sorted by spawn level. Starts at 0 extensions
 * @param {Object} milestones An object defining extension amounts to use higher level modules.
 * @param {Object} milestones.any Create by adding a pointer written like this: {(extensionamount): (moduleArray)}.
 * @param {Object} ifCalls a Object of conditions to see if it should spawn a unit
 * @param {Boolean} ifCalls.toplevel a conditional called before anything happens, helpful if you want to quickly terminate a unit creation call. Set to 0 if you want no toplevel call
 * @param {Boolean} ifCalls.unitcheck a conditional called to check if a creep should be spawned, on top of the basic checks to see if you have enough energy. Set to 1 if you have no need
 * @param {Boolean} ifCalls.deficitcheck a conditional called to check if the spawn should attempt to produce the lowest level unit avilable. Used to restart ecos if something happens. Set to 0 if you have no need for this
 * @param {String} unitType Type of unit, decides where to append it n stuff
 * @returns literally nothing lmao
 *
 * @example newunitcheck("Spawn1", [
 *  [MOVE,CARRY,WORK],
 *  [MOVE,MOVE,CARRY,WORK,WORK],
 *  [MOVE,MOVE,CARRY,CARRY,WORK,WORK],
 *  [MOVE,MOVE,MOVE,CARRY,WORK,WORK],
 *  [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK],
 *  [MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK]
 *  ],
 *  {25:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]},
 * {
 * toplevel: global.defenseNeeded >= 1 || global.createdunit == 1
 * unitcheck: neededharvs > Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length
 * deficitcheck: Game.spawns[spawnname].room.controller.level == 1 || (Memory.haulers.length < 2) || Game.spawns[spawnname].memory.harvesters.length < 2
 * }
 * )
 */
function a() {

}
/*export function newunitcheck(spawnname, allmodulelevels, milestones, ifCalls, unitType) {
    if(global.createdunit===1) {
        return
    }
    if(ifCalls.toplevel) {
        return
    }
    var allstores = Memory.storecache
    let allstorescheck = Memory.storecache
    var allmodules
    if(allmodulelevels.length-1 < allstores) {
        allstores = allmodulelevels.length-1
    }
    if(ifCalls.deficitcheck) {
        allstores = 0
        allstorescheck = allstores
    }
    if(global.inDeficit == 1) {
        allstores = global.deficitLevel
    }
    allmodules = allmodulelevels[allstores]
    if(unitType === "harvester") {
        if(!(checkharvwant(spawnname) > Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length)) {
            var endearly = 0
            for(const I in Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters) {
                if(!endearly) {
                    var I2 = Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters[I]
                    var data = Memory.creeps[I2]
                    data = {memory: data}
                    var actualcreep = Game.creeps[I2]
                    try {
                    if(data.memory.level < Memory.harvlevel) {
                            remove("usedsources",data)
                            Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters = Lremove(Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters,I2)
                            actualcreep.suicide()
                            endearly = 1
                    }
                } catch(e) {}
                }
            }
        }
    }
    for(let am in milestones) {
        if(Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
            allmodules = milestones[am]
        }
    }
    if(unitType==="harvester") Memory.harvlevel = allstores

}*/

export function checkharvwant(ref: string | number) {
    return Game.spawns[ref].room.find(FIND_SOURCES).length + 1;
}
export function newharvcheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if (global.defenseNeeded >= 20 || global.createdunit == 1 || Game.spawns[spawnname].room.controller === undefined) {
        return
    }
    let type = "harv"
    var neededharvs = checkharvwant(spawnname)
    var allstores = Memory.storecache
    let allstorescheck = Memory.storecache
    //@ts-ignore
    if ((Game.spawns[spawnname].room.controller.level === 1 || Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length < 2)) {
        allstores = 0
        allstorescheck = allstores
    }
    var allmodules
    var buildercost
    if (global.cache[spawnname + "Ucache" + type] === undefined || global.cache[spawnname + "Ucache" + type].extensions !== allstores) {
        var allmodulelevels = [
            [MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK, WORK],
            [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
            [MOVE, MOVE, MOVE, CARRY, WORK, WORK],
            [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK],
            [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
        ]
        if (allmodulelevels.length - 1 < allstores) {
            allstores = allmodulelevels.length - 1
        }

        if (global.inDeficit == 1) {
            allstores = global.deficitLevel
        }

        allmodules = allmodulelevels[allstores]
        buildercost = 200 + (50 * allstores)
        if (allstores >= 4) {
            buildercost = 300 + (50 * allstores)
        }
        allstores = allstorescheck
        global.cache[spawnname + "Ucache" + type] = { cost: buildercost, modules: allmodules, extensions: allstores }
    } else {
        allmodules = global.cache[spawnname + "Ucache" + type].modules
        buildercost = global.cache[spawnname + "Ucache" + type].cost
    }
    Memory.harvlevel = allstores
    if (neededharvs > Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length) {
        if (Game.spawns[spawnname].room.energyAvailable >= buildercost) {
            if (Game.spawns[spawnname].spawning === null) {
                if (createharv(allmodules, spawnname) == 0) {
                    global.createdunit = 1
                    return
                }
            }
        }
    }

    allstores = Memory.storecache
    allstorescheck = Memory.storecache
    type = "LRM"
    //@ts-ignore
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1)) {
        allstores = 0
        allstorescheck = allstores
    }
    if (global.cache[spawnname + "Ucache" + type] === undefined || global.cache[spawnname + "Ucache" + type].extensions !== allstores) {

        if (global.inDeficit == 1) {
            allstores = global.deficitLevel
        }
        allmodulelevels = [
            [MOVE, MOVE, WORK, WORK],
            [MOVE, WORK, WORK, WORK],
            [MOVE, MOVE, WORK, WORK, WORK],
            [MOVE, MOVE, MOVE, WORK, WORK, WORK],
            [MOVE, WORK, WORK, WORK, WORK],
            [MOVE, MOVE, WORK, WORK, WORK, WORK],
            [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK],
            [MOVE, WORK, WORK, WORK, WORK, WORK],
            [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
            [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK],
        ]
        milestones = {
            20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
            30: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY]
        }
        if (allmodulelevels.length - 1 < allstores) {
            allstores = allmodulelevels.length - 1
        }
        allmodules = allmodulelevels[allstores]
        buildercost = 300 + (50 * allstores)
        for (let am in milestones) {
            //@ts-ignore
            if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am)) {
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        allstores = allstorescheck
        global.cache[spawnname + "Ucache" + type] = { cost: buildercost, modules: allmodules, extensions: allstores }
    } else {
        allmodules = global.cache[spawnname + "Ucache" + type].modules
        buildercost = global.cache[spawnname + "Ucache" + type].cost
    }
    if (Memory.storedcreeps.length == 0) {
        if (Game.spawns[spawnname].room.energyAvailable >= buildercost) {
            if (Game.spawns[spawnname].spawning === null&& Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade >= 1) {

                global.createdunit = 1
                createminer(allmodules, spawnname)
                return
            }
        }
    }

    allstores = Memory.storecache
    allstorescheck = Memory.storecache
    type = "minharv"

    if (global.cache[spawnname + "Ucache" + type] === undefined || global.cache[spawnname + "Ucache" + type].extensions !== allstores) {
        allmodulelevels = [
            [MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK, WORK],
            [MOVE, MOVE, CARRY, CARRY, WORK, WORK],
            [MOVE, MOVE, MOVE, CARRY, WORK, WORK],
            [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK],
            [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
        ]

        milestones = { 25: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY] }
        allmodules = allmodulelevels[allstores]
        buildercost = partcost(allmodules)
        for (let am in milestones) {
            //@ts-ignore
            if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am)) {
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        allstores = allstorescheck
        global.cache[spawnname + "Ucache" + type] = { cost: buildercost, modules: allmodules, extensions: allstores }
    } else {
        allmodules = global.cache[spawnname + "Ucache" + type].modules
        buildercost = global.cache[spawnname + "Ucache" + type].cost
    }
    //@ts-ignore
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1 || Memory.haulers.length < 2 || global.restartEco !== undefined)) {
        allstores = 0
        allstorescheck = allstores
    }

    if (global.isextractor) {
        //Don't need mins rn
        if (global.needMins === 0) {
            return
        }
        if (Game.spawns[spawnname].room.energyAvailable >= buildercost) {
            if (Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs === undefined) {
                Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs = []
            }
            let minerals = Game.spawns[spawnname].room.find(FIND_MINERALS, {
                filter: function (a:Mineral) {
                    return a.mineralAmount > 0
                }
            })
            if (Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs && (Memory.haulers.length >= global.haulercreations && Memory.longrangemining[Memory.longrangemining.length - 1].creeps.length !== 0) && (Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 && Game.spawns[spawnname].room.getMasterSpawn().memory.queen) && minerals.length > 0) {
                //@ts-ignore
                if (Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs.length < 1) {
                    if (Game.spawns[spawnname].spawning === null) {
                        global.createdunit = 1
                        createminharv(allmodules, spawnname)
                        return
                    }
                }
            }
        }
    }
}
export function createminharv(modules: BodyPartConstant[], spawnname: string | number) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(modules, test, {
        memory: { level: Memory.harvlevel }
    })
    if (errorreg == 0) {
        if (Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs === undefined) {
            Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs = []
        }
        //@ts-ignore
        Game.spawns[spawnname].room.getMasterSpawn().memory.minharvs.push(test)
    }
    return errorreg
}
export function createharv(modules: BodyPartConstant[], spawnname: string | number) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(modules, test, {
        memory: { level: Memory.harvlevel }
    })
    if (errorreg == 0) {
        Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.push(test)
    }
    return errorreg
}
export function createminer(modules: BodyPartConstant[], spawnname: string | number) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(modules, test)
    if (errorreg == 0) {
        Memory.storedcreeps[0] = test
    }
}
export function checkbuildwant(ref: string | number) {
    //@ts-ignore
    if (Game.spawns[ref].room.controller !== undefined && (Game.spawns[ref].room.controller.level > 4)) {
        return 4
    } else {
        return Game.spawns[ref].room.find(FIND_SOURCES).length * 2 + 4
    }
}
export function newbuildcheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if (global.createdunit == 1 || global.defenseNeeded >= 20) {
        return
    }
    var type = "builder"
    var allstores = Memory.storecache
    var allstorescheck = Memory.storecache
    var allmodules
    var buildercost
    //@ts-ignore
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1)) {
        allstores = 0
        allstorescheck = allstores
    }
    if (global.cache[spawnname + "Ucache" + type] === undefined || global.cache[spawnname + "Ucache" + type].extensions !== allstores) {
        var allmodulelevels = [
            [WORK, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
            [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK],
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
        ]
        //@ts-ignore
        if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level > 4)) {
            milestones = {
                20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
                //30:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            }
        } else {
            milestones = {
                //20:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                //30:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            }
        }
        if (allmodulelevels.length - 1 < allstores) {
            allstores = allmodulelevels.length - 1
        }

        allmodules = allmodulelevels[allstores]
        buildercost = 300 + (50 * allstores)
        for (let am in milestones) {
            //@ts-ignore
            if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am)) {
                allmodules = milestones[am]

                buildercost = partcost(allmodules)
            }
        }
        allstores = allstorescheck
        global.cache[spawnname + "Ucache" + type] = { cost: buildercost, modules: allmodules, extensions: allstores }
    } else {
        allmodules = global.cache[spawnname + "Ucache" + type].modules
        buildercost = global.cache[spawnname + "Ucache" + type].cost
    }
    Memory.builderlevel = allstores
    if (Game.spawns[spawnname].room.energyAvailable >= buildercost) {
        if (checkbuildwant(spawnname) > Game.spawns[spawnname].room.getMasterSpawn().memory.builders.length) {
            if ((checkharvwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length) || (Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade == 0 && Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length != 0)) {
                if (Game.spawns[spawnname].spawning == null) {
                    global.createdunit = 1
                    createbuild(spawnname, allmodules)
                    return
                }
            }
        }
    }
    /*
    if(Memory.haulers.length >= global.haulercreations && Memory.storecache >= 40) {
        allmodules=[MOVE,MOVE,MOVE,CLAIM,CLAIM]
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
    */
}
export function newhaulercheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if (global.createdunit == 1 || global.defenseNeeded >= 20) {
        return
    }
    var type = "hauler"
    var allstores = Memory.storecache
    var allmodules
    var buildercost
    let allstorescheck = Memory.storecache
    //@ts-ignore
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1 ||
        (Memory.haulers.length < 1 && Memory.haulerneeded > 0) ||
        (Game.spawns[spawnname].room.storage && Game.spawns[spawnname].room.getMasterSpawn().memory.queen === undefined && Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 === undefined)
    )) {
        allstores = 0
        allstorescheck = allstores
    }
    if (global.cache[spawnname + "Ucache" + type] === undefined || global.cache[spawnname + "Ucache" + type].extensions !== allstores) {
        var allmodulelevels = [
            [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        ]
        milestones = {
            20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
            //after testing again, return on investment is absolutely not worthwhile at this point in time
            //EDIT: due to cpu costs, I need to use this
            //EDIT EDIT: this kills eco, why??????
            //EDIT EDIT EDIT: ima try this again, fuck you past Geo
            //30:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        }
        if (global.inDeficit == 1) {
            allstores = global.deficitLevel
        }
        if (allmodulelevels.length - 1 < allstores) {
            allstores = allmodulelevels.length - 1
        }
        allmodules = allmodulelevels[allstores]
        buildercost = allmodules.length * 50
        for (let am in milestones) {
            //@ts-ignore
            if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am)) {
                allmodules = milestones[am]
                buildercost = partcost(allmodules)
            }
        }
        allstores = allstorescheck
        global.cache[spawnname + "Ucache" + type] = { cost: buildercost, modules: allmodules, extensions: allstores }
    } else {
        allmodules = global.cache[spawnname + "Ucache" + type].modules
        buildercost = global.cache[spawnname + "Ucache" + type].cost
    }
    if (Game.spawns[spawnname].room.energyAvailable >= buildercost) {
        //@ts-ignore
        if (((Game.spawns[spawnname].room.getMasterSpawn().memory.queen === undefined) || (Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 === undefined && global.restartEco === undefined)) && (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level > 3) && Game.spawns[spawnname].room.storage) {
            if (Game.spawns[spawnname].spawning == null) {
                global.createdunit = 1
                createqueen(spawnname, allmodules)
                return
            }
        }
    }
    //@ts-ignore
    if ((Math.ceil((Memory.haulerneeded + (allmodules.length / 2)) / (allmodules.length / 2) / 3)) >= Memory.haulers.length && (Game.spawns[spawnname].room.controller && Game.spawns[spawnname].room.controller.level >= 4)) {
        global.restartEco = Game.spawns[spawnname]
    } else {
        global.restartEco = undefined
    }

    Memory.haulerlevel = allstores
    Memory.haulerSatisfied = Math.ceil((Memory.haulerneeded) / (allmodules.length / 2))
    if (Memory.haulerneeded > 0 && Game.spawns[spawnname].room.energyAvailable >= buildercost && Memory.haulers.length < Math.ceil((Memory.haulerneeded) / (allmodules.length / 2))) {
        if (Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade >= 1 ||
            //@ts-ignore
            (Memory.haulers.length < 3 || (Game.spawns[spawnname].room.getMasterSpawn().memory.queen !== undefined || (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level <= 3)))) {
            if ((checkharvwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length)) {
                if (Game.spawns[spawnname].spawning == null) {
                    global.createdunit = 1
                    createhauler(spawnname, allmodules)
                    return
                }
            }
        }
    }
    //@ts-ignore
    if (Game.spawns[spawnname].room.energyAvailable >= buildercost && (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level >= 4)) {
        if (Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill === undefined && checkbuildwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.builders.length) {
            if (Game.spawns[spawnname].spawning == null) {
                global.createdunit = 1
                createUpgradeRefill(spawnname, allmodules)
            }
        }
    }
}
export function newcombatcheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if ((global.createdunit == 1 || global.defenseNeeded < 20) && Game.flags.attack === undefined) {
        return
    }
    var allstores = Memory.storecache
    var allmodules
    var buildercost
    let allstorescheck = Memory.storecache
    var allmodulelevels = [
        [TOUGH, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH, MOVE, MOVE, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH, MOVE, MOVE, MOVE, TOUGH, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, RANGED_ATTACK],
        [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, RANGED_ATTACK]
    ]
    milestones = {
        20: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, HEAL],
        30: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL],
        40: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL]
    }
    if (allmodulelevels.length - 1 < allstores) {
        allstores = allmodulelevels.length - 1

    }
    //@ts-ignore
    if (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level == 1) {
        allstores = 0
        allstorescheck = allstores
    }
    allmodules = allmodulelevels[allstores]
    buildercost = partcost(allmodules)
    for (let am in milestones) {
        //@ts-ignore
        if (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level != 1 && allstorescheck >= am) {
            allmodules = milestones[am]
            buildercost = partcost(allmodules)
        }
    }
    Memory.combatlevel = allstores
    if ((Game.spawns[spawnname].room.energyAvailable >= buildercost) && (Memory.storedcreeps.length >= 1 || global.defenseNeeded >= 20)) {
        if ((Memory.fighters.length < 4)) {
            if ((checkharvwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length)) {
                if (Game.spawns[spawnname].spawning == null) {
                    global.createdunit = 1
                    let returnCode = createcombat(spawnname, allmodules)
                }
            }
        }
    }
}
export function createclaimer(spawnname: string | number, moduledata: BodyPartConstant[]) {
    let regas: number | string
    regas = -1
    for (let I in Memory.miningrooms) {
        if (Game.rooms[Memory.miningrooms[I].room]) {
            if (I in Memory.claimers === false && (Game.rooms[Memory.miningrooms[I].room].controller !== undefined)) {
                //@ts-ignore
                if (Game.rooms[Memory.miningrooms[I].room].controller.level === 0) {
                    regas = I
                    break
                }
            } else if (I in Memory.claimers === false && (Game.rooms[Memory.miningrooms[I].room].controller === undefined)) {
                regas = I
                break
            }
        }
    }
    if (regas !== -1) {
        var test = newid()
        var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
            memory: { spawnid: Game.spawns[spawnname].id }
        })
        report.formatBasic(Game.spawns[spawnname].room.name,"a claimer was created with error log: "+errorreg)
        if (errorreg == 0) {
            Memory.claimers[regas] = test
        }
    } else {
        global.createdunit = 0
    }
}
export function createqueen(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()

    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { spawnid: Game.spawns[spawnname].id }
    })
    report.formatBasic(Game.spawns[spawnname].room.name,"a queen was created with error log: "+errorreg)
    if (errorreg == 0) {
        if (Game.spawns[spawnname].room.getMasterSpawn().memory.queen === undefined) {
            Game.spawns[spawnname].room.getMasterSpawn().memory.queen = test
        } else if (Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 === undefined) {
            Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 = test
        }
    }
}
export function createUpgradeRefill(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()

    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.haulerlevel, spawnid: Game.spawns[spawnname].id }
    })
    report.formatBasic(Game.spawns[spawnname].room.name,"an upgrade refiller was created with error log: "+errorreg)
    if (errorreg == OK) {
        Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill = test
    }
}
export function createhauler(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.haulerlevel, spawnid: Game.spawns[spawnname].id }
    })
    report.formatBasic(Game.spawns[spawnname].room.name,"a hauler was created with error log: "+errorreg)
    if (errorreg == OK) {
        hauler(test);
    }
}
export function createbuild(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.builderlevel }
    })
    report.formatBasic(Game.spawns[spawnname].room.name,"a builder was created with error log: "+errorreg)
    if (errorreg == 0) {
        Game.spawns[spawnname].room.getMasterSpawn().memory.builders.push(test)
    }
}
export function createcombat(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.combatlevel }
    })
    report.formatBasic(Game.spawns[spawnname].room.name,"a combat creep was created with error log: "+errorreg)
    if (errorreg == 0) {
        combat(test);
    }
    return errorreg
}
