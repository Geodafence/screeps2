import { newid, hauler, combat } from "./role.assign";
import { remove } from "./libs/general.sourceregistering";
import { Lremove, partcost } from "./libs/general.functions";
import { Mineral } from "../typings/mineral";
import { report } from "./libs/roomReporting"
import { OwnedStructure } from "../typings/structure";
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
        //@ts-ignore
    if (Game.spawns[ref].room.controller.level < 7) {
        return Game.spawns[ref].room.find(FIND_SOURCES).length + 1;
    } else {
        return 1
    }
}
export function newharvcheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if ((global.defenseNeeded >= 20 && Memory.fighters.length < 4) || global.createdunit == 1 || Game.spawns[spawnname].room.controller === undefined) {
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
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1 || (Memory.longrangemining[0].creeps.length === 0 && Memory.longrangemining.length > 0))) {
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
            30: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY]
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
        //report.formatBasic("debug","1")
        if (Game.spawns[spawnname].room.energyAvailable >= buildercost) {
            //report.formatBasic("debug","2")
            if (Game.spawns[spawnname].spawning === null && Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade >= 1) {
                //report.formatBasic("debug","3")
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
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1 || Memory.haulers.length < 2)) {
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
                filter: function (a: Mineral) {
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
        global.createdunit = 1
        Memory.storedcreeps[0] = test
    }
}
export function checkbuildwant(ref: string | number) {
    if (Memory.isswc) {
        //@ts-ignore
        if (Game.spawns[ref].room.controller !== undefined && (Game.spawns[ref].room.controller.level >= 7)) {
            return 4
        //@ts-ignore
        } else if ((Game.spawns[ref].room.controller.level >= 4)) {
            return 7
        } else {
            return 14
        }
    } else {
        //@ts-ignore
        if (Game.spawns[ref].room.controller !== undefined && (Game.spawns[ref].room.controller.level > 4)) {
            //@ts-ignore
            if ((Game.spawns[ref].room.controller.level >= 7)) {
                return 2
            } else {
                return 4
            }
        } else {
            return Game.spawns[ref].room.find(FIND_SOURCES).length * 2 + 4
        }
    }
}
export function newbuildcheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if (global.createdunit == 1 || (global.defenseNeeded >= 20 && Memory.fighters.length < 4)) {
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
        if (Memory.isswc) {
            milestones = {
                20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                30: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                //50: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            }
        } else {
            //@ts-ignore
            if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level > 4)) {
                milestones = {
                    20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY],
                    50: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                };
            } else {
                milestones = {
                    //20:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                    //30:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
                }
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
    report.formatBasic("debug2", String(Memory.haulerSatisfied))
    Memory.builderlevel = allstores
    let mSpawn: StructureSpawn = Game.spawns[spawnname].room.getMasterSpawn()
    //@ts-ignore
    let buildNeedBool = Game.spawns[spawnname].room.controller.level < 4 ? checkbuildwant(spawnname) > Game.spawns[spawnname].room.getMasterSpawn().memory.builders.length :
        (checkbuildwant(spawnname) > Game.spawns[spawnname].room.getMasterSpawn().memory.builders.length || Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade === 0) && mSpawn.memory.queen !== undefined && mSpawn.memory.queen2 !== undefined
    if (Game.spawns[spawnname].room.energyAvailable >= buildercost && (Memory.haulers.length>=Memory.haulerSatisfied || Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade === 0)) {
        if (buildNeedBool) {
            if ((checkharvwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length) || (Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade == 0 && Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length != 0)) {
                if (Game.spawns[spawnname].spawning == null) {
                    createbuild(spawnname, allmodules)
                    return
                }
            }
        }
    }
}
export function newhaulercheck(spawnname: string) {
        //@ts-ignore
    let build = (Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.general >= 1 || Game.spawns[spawnname].room.controller.level < 5 || !Memory.isswc)
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    if (global.createdunit == 1 || (global.defenseNeeded >= 20 && Memory.fighters.length < 4)) {
        report.formatBasic("debug", "?!")
        return
    }
    var type = "hauler"
    var allstores = Memory.storecache
    var allmodules
    var buildercost
    let allstorescheck = Memory.storecache
    //@ts-ignore
    if (Game.spawns[spawnname].room.controller !== undefined && (Game.spawns[spawnname].room.controller.level == 1 ||
        (((Memory.haulers.length < 1) && Memory.haulerneeded > 0) || (Memory.isswc && Memory.haulers.length <= global.haulercreations / 2)) ||
        //@ts-ignore
        (Game.spawns[spawnname].room.storage && Game.spawns[spawnname].room.getMasterSpawn().memory.queen === undefined && Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 === undefined && Game.spawns[spawnname].room.controller.level < 7)
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
        if (Memory.isswc) {
            milestones = {
                20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                50: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
            }
        } else {
            milestones = {
                20: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                //after testing again, return on investment is absolutely not worthwhile at this point in time
                //EDIT: due to cpu costs, I need to use this
                //EDIT EDIT: this kills eco, why??????
                //EDIT EDIT EDIT: ima try this again, fuck you past Geo
                //EDIT EDIT EDIT EDIT: i'm using this at 50 extensions to support the significant reduction of creeps after reaching rcl 7
                50: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
            }
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
        let queenCheck = (Game.spawns[spawnname].room.getMasterSpawn().memory.queen === undefined) ||
            //@ts-ignore
            (Game.spawns[spawnname].room.getMasterSpawn().memory.queen2 === undefined && (Memory.isswc || Game.spawns[spawnname].room.controller.level < 7))
            //@ts-ignore
        let controllerCheck = (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level > 3)
        //@ts-ignore
        if (queenCheck && controllerCheck && Game.spawns[spawnname].room.storage) {

            if (Game.spawns[spawnname].spawning == null) {

                createqueen(spawnname, allmodules)
                return
            }
        }
    }

    Memory.haulerlevel = allstores
    //console.log(Memory.haulerneeded)
    Memory.haulerSatisfied = Math.ceil((Memory.haulerneeded) / (allmodules.length / 2))
    report.formatBasic("debug", String(Memory.haulerSatisfied))

    //if(Memory.isswc) if(Memory.haulerSatisfied>4&&Game.cpu.getUsed()>Game.cpu.limit*0.75) Memory.haulerSatisfied = 4
    if (Memory.isswc) {
            //@ts-ignore
        if (Memory.haulerSatisfied > 7 && Game.spawns[spawnname].room.controller.level >= 4 && Game.spawns[spawnname].room.controller.level < 7) Memory.haulerSatisfied = 7
    }
    //if(Game.spawns[spawnname].room.controller.level<3&&Memory.haulerSatisfied>10) Memory.haulerSatisfied = 10

    if (
        Memory.haulerneeded > 0 &&
        Game.spawns[spawnname].room.energyAvailable >= buildercost &&
        Memory.haulers.length < Memory.haulerSatisfied &&
        Memory.longrangemining[0].creeps.length > 0 &&
        build
    ) {
        const hasUpgradeAllocation = Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.upgrade >= 1;
        // @ts-ignore
        const hasQueenOrLowController = Game.spawns[spawnname].room.getMasterSpawn().memory.queen !== undefined ||
            (Game.spawns[spawnname].room.controller?.level ?? 0) <= 3;
        const hasFewHaulers = Memory.haulers.length < 3;

        if (hasUpgradeAllocation || hasQueenOrLowController) {

            const requiredHarvesters = checkharvwant(spawnname);
            const currentHarvesters = Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length;

            if (requiredHarvesters <= currentHarvesters) {
                if (!Game.spawns[spawnname].spawning) {

                    createhauler(spawnname, allmodules);
                    return;
                }
            }
        }
    }
    let upgrade = 2
        //@ts-ignore
    if(Game.spawns[spawnname].room.controller.level>=7) upgrade = 2
    //@ts-ignore
    if (Game.spawns[spawnname].room.energyAvailable >= buildercost && (Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level >= 4)) {
        if ((Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill.length < 1
            || (Memory.isswc && Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill.length < upgrade))
            && (checkbuildwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.builders.length || Memory.isswc)&&
            Game.spawns[spawnname].room.getMasterSpawn().memory.builderallocations.general >= 1) {
            if (Game.spawns[spawnname].spawning == null) {
                global.createdunit = 1
                createUpgradeRefill(spawnname, allmodules)
            }
        }
    }
}
export function newcombatcheck(spawnname: string) {
    var milestones: { [extensionAmount: number]: BodyPartConstant[] }
    console.log(Game.spawns[spawnname].room.name, "test")
    if ((global.createdunit == 1 || (global.defenseNeeded < 20 && (Memory.harass.length === 0||Memory.haulers.length>=Memory.haulerSatisfied))) && Game.flags.attack === undefined) {
        return
    }
    var allstores = Memory.storecache
    var allmodules
    var buildercost
    let allstorescheck = Memory.storecache
    var allmodulelevels = [
        [TOUGH, MOVE, MOVE, RANGED_ATTACK],
        [TOUGH, MOVE, MOVE, RANGED_ATTACK],
        [TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE],
        [TOUGH, TOUGH, MOVE, MOVE, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH, MOVE, MOVE, MOVE, TOUGH, ATTACK, RANGED_ATTACK, MOVE],
        [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, RANGED_ATTACK],
        [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, RANGED_ATTACK]
    ]
    milestones = {
        20: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, HEAL],
        30: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL],
        40: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL],
        50: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL]
    }
    if (allmodulelevels.length - 1 < allstores) {
        allstores = allmodulelevels.length - 1

    }
    //@ts-ignore
    if ((Game.spawns[spawnname].room.controller !== undefined && Game.spawns[spawnname].room.controller.level == 1)) {
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
    let spawn = Game.spawns[spawnname]

    let bool = true
    if(spawn.room.storage) {
        bool = spawn.room.storage.store[RESOURCE_ENERGY] > 100000 || global.defenseNeeded >= 20
    }
    console.log(Game.spawns[spawnname].room.name, "Combat check")
    if ((Game.spawns[spawnname].room.energyAvailable >= buildercost && global.createdunit !== 1) && (bool)) {
        if ((Memory.fighters.length < 4) || Memory.harass.length > 0) {
            if ((checkharvwant(spawnname) <= Game.spawns[spawnname].room.getMasterSpawn().memory.harvesters.length)) {
                if (Game.spawns[spawnname].spawning == null) {
                    if ((global.defenseNeeded >= 20 || Game.flags.attack !== undefined) && Memory.fighters.length < 4) {
                        let returnCode = createcombat(spawnname, allmodules)
                    } else {
                        let returnCode = createharasser(spawnname, allmodules)
                    }
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
        report.formatBasic(Game.spawns[spawnname].room.name, "a claimer was created with error log: " + errorreg)
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
    report.formatBasic(Game.spawns[spawnname].room.name, "a queen was created with error log: " + errorreg)
    if (errorreg == 0) {
        global.createdunit = 1
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
    report.formatBasic(Game.spawns[spawnname].room.name, "an upgrade refiller was created with error log: " + errorreg)
    if (errorreg == OK) {
        if (typeof Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill === "undefined"
            || typeof Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill === "string") {
            Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill = []
        }
        Game.spawns[spawnname].room.getMasterSpawn().memory.upgradeRefill.push(test)
    }
}
export function createhauler(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.haulerlevel, spawnid: Game.spawns[spawnname].id }
    })
    report.formatBasic(Game.spawns[spawnname].room.name, "a hauler was created with error log: " + errorreg)
    if (errorreg == OK) {
        global.createdunit = 1
        hauler(test);
    }
}
export function createbuild(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.builderlevel }
    })
    report.formatBasic(Game.spawns[spawnname].room.name, "a builder was created with error log: " + errorreg)
    if (errorreg == 0) {
        global.createdunit = 1
        Game.spawns[spawnname].room.getMasterSpawn().memory.builders.push(test)
    }
}
export function createharasser(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.combatlevel, room: Memory.harass.shift() }
    })
    Memory.harass.splice(0, 1)
    report.formatBasic(Game.spawns[spawnname].room.name, "a harasser creep was created with error log: " + errorreg)
    if (errorreg == 0) {
        global.createdunit = 1
        Memory.harassers.push(test)
    }
    return errorreg
}

export function createcombat(spawnname: string | number, moduledata: BodyPartConstant[]) {
    var test = newid()
    var errorreg = Game.spawns[spawnname].spawnCreep(moduledata, test, {
        memory: { level: Memory.combatlevel }
    })
    report.formatBasic(Game.spawns[spawnname].room.name, "a combat creep was created with error log: " + errorreg)
    if (errorreg == 0) {
        global.createdunit = 1
        combat(test);
    }
    return errorreg
}
