// Import necessary modules for various roles and functions
import { run as harvtick } from './roles/role.harvester';
import { newharvcheck, newbuildcheck, newhaulercheck, newcombatcheck, createqueen, createhauler } from "./handler.newunits";
import { run as buildertick } from "./roles/role.builder";
import { run as combattick } from "./roles/role.combat";
import { tick as harassertick } from "./roles/role.harasser"
import { remove } from "./libs/general.sourceregistering";
import { tick as LRBtick } from "./roles/role.longrangebuilder";
import { tick as remotetick } from "./roles/role.longrangeminer";
import { getTrueDistance, Lremove } from "./libs/general.functions";
import { tick as haulertick } from "./roles/role.hauler";
import { run as minharvtick } from "./roles/role.mineralharv";
import { tick as scouttick } from "./roles/role.scout"


import { tick as terminaltick } from "./libs/terminalCalculator";
import { tick as linktick } from "./structure.link";
import { checkRampartPassing } from "./structs/structure.rampart"

import "./libs/spawnUtils";
import { tick as queentick } from "./roles/role.queen";
import { any, isUndefined } from 'lodash';
import { run as refillTick } from './roles/role.buildrefill';
import { ErrorMapper } from "./libs/ErrorMapper";
import { report } from "./libs/roomReporting"
import { tick as triotick } from "./roles/role.trio"
import { run as allyTick} from "./libs/allyLibs/responseMain"
import { simpleAllies } from "./libs/allyLibs/simpleAllies"
import { strengthCalc } from "./libs/combatLibs/calcCreepPower"
import { buildRamparts } from "./libs/baseBuildingLibs/rampartCalc"
import { findSuitableRemotes } from "./libs/econLibs/findRemotes"
// Import typings
'../typings/creep';
import { Structure, StructureController, StructureLink, StructureTower } from '../typings/structure';
import { useRoadPlanner } from './libs/baseBuildingLibs/roadPlanner';
import { createAndUpdateCheckerSite } from './libs/baseBuildingLibs/checkerboardBuilder';
import { Allies } from './libs/allyLibs/allyConsts';

if ("harvesters" in Memory != true) {
    // Initialization of memory properties for the first loop
    console.log("first time loop is restarted");
    Memory.scoutedRooms = {}
    //@ts-ignore
    Memory.harvesters = []
    Memory.longRangeBuilders = new Array();
    Memory.claimers = new Array();
    Memory.LRMpaths = new Object();
    Memory.harassers = []
    Memory.fighters = new Array();
    Memory.defenserequests = new Array();
    Memory.trios = new Array();
    Memory.haulers = new Array();
    Memory.scouts = new Array();
    Memory.assignedids = 0;
    Memory.usedsources = new Array();
    Memory.buildersources = new Array();
    Memory.upgradersources = new Array();
    Memory.harass = new Array();
    Memory.wantToClaim = new Array();
    Memory.roomCache = new Object();
    Memory.builderlevel = 1;
}
if ("storedcreeps" in Memory != true) {
    // Initialization of memory properties for stored creeps and mining
    /*
    console.log("loading long range miners!");
    Memory.storedcreeps = new Array();
    Memory.segmentRequests = new Array();
    Memory.longrangemining = new Array();
    Memory.longrangeminingcreeps = new Array();
    */
}
let set = {
    triorequests: [],
        scoutedRooms: {},
        wantToClaim: {
        },
        defenserequests: [],
        structures: {},

        // Arrays
        harassers: [],
        trios: [],
        longRangeBuilders: [],
        claimers: {},
        scouts:[],
        fighters: [],
        haulers: [],
        usedsources: [],
        buildersources: [],
        upgradersources: [],
        storedcreeps: [],
        longrangemining: [],
        longrangeminingcreeps: [],
        miningrooms: [],

        // Objects
        LRMpaths: {},
        roomCache: {},

        // 0s
        haulerSatisfied: 0,
        assignedids: 0,
        builderlevel: 0,
        harvlevel: 0,
        haulerlevel: 0,
        combatlevel: 0,
        haulerneeded: 0,
        storecache: 0,
};
for(let I in set) {
    //@ts-ignore
    if(Memory[I]===undefined) {
        //@ts-ignore
        Memory[I] = set[I];
    }
}
// Setup mining rooms and global update lists.
Memory.miningrooms = [
    { room: "E8S33", usedSegment: 0 },
];
if(Memory.isswc!==undefined) {
    Memory.miningrooms = [

    ];
}
global.avgcpu = []
global.cputrend = [20]
global.cache = {}
global.needMins = 0


if (global.fixticks === undefined) {
    global.fixticks = 0
}
global.methods = {}
global.methods["createqueen"] = createqueen
global.methods["createhauler"] = createhauler
global.defenseNeeded = 0
global.updatecache = 100;
Memory.isswc = 1
console.log("restarting loop");
//var ramparttest = require("rampartcalc")
//console.log(ramparttest.findOptimalRamparts(Game.rooms["E52S18"]))
export const loop = ErrorMapper.wrapLoop(() => {
    let cpuNonIntents = new Date().getTime()
    if (Game.cpu.bucket < 500) {
        console.log("extremely low cpu bucket, terminating")
        return
    }
    if(Memory.harassers === undefined) Memory.harassers = []
    if (global.updatecache >= 101) {
        global.updatecache = 0
        console.log("resetting cache")
    }
    global.updatecache += 1
    RawMemory.setActiveSegments([1]);
    Memory.haulerlevel = 0
    global.fixticks += 1
    if (global.defenseNeeded >= 20) {
        report.formatImportant("*", "defense required")
    }
    //Gather info on which spawn for haulers to focus on
    let grab = 0
    let info = 1000000000000
    let keyfix = Game.spawns
    let spawnamount = 0
    for (let a in Game.spawns) {
        Game.map.visual.circle(Game.spawns[a].pos, { fill: "#1E88E5", radius: 1, stroke: "#0D47A1" })
        spawnamount += 1
    }
    global.LRBmake = 0
    global.LRBroom = 0
    let refreshMiningRooms = false
    if(Memory.isswc) {
        if(Game.time%100===0||Memory.miningrooms.length===0) {
            Memory.miningrooms = []
            refreshMiningRooms = true
        }
    }
    for (let temp in Game.rooms) {
        let room = Game.rooms[temp]
        if (!room.controller || room.controller.my === false) {
            continue
        }
        if (room.controller.level <= 4&&room.controller.level > 0) {
            global.LRBmake = 1
            global.LRBroom = room.name
        }
        let currentspawn = room.getMasterSpawn()
        if (currentspawn === undefined || currentspawn === null) {
            continue
        }
        if(refreshMiningRooms) {
            console.log("Refreshing mining rooms for "+room.name)
            Memory.miningrooms = Memory.miningrooms.concat(findSuitableRemotes(room))
        }
    }
    if (global.LRBroom !== undefined) {
        //Game.map.visual.text("LRB site",new RoomPosition(25,25,global.LRBroom),{stroke:"#0065ff"})
        //Game.map.visual.rect(new RoomPosition(0,0,global.LRBroom),50,50,{fill:"transparent",stroke:"#0065ff",strokeWidth:2})
    }
    let cpuTest = Game.cpu.getUsed()
    // Loop through each spawn and manage units and tasks
    for (let roomid in Game.rooms) {
        Memory.harvlevel = 0
        Memory.builderlevel = 0
        Memory.haulerlevel = 0
        Memory.combatlevel = 0
        let room = Game.rooms[roomid]
        global.createdunit = 0
        let currentspawn = room.getMasterSpawn()
        if (!room.controller || room.controller.my === false || currentspawn === undefined || currentspawn === null) {
            continue
        }
        global.miningroomsReset = Memory.miningrooms
        let replace = []
        for (let R of Memory.miningrooms) {
            if(room.name==="E8S34") {
                if((room.isNearby(R.room)&&R.room!=="E7S33")&&(R.linkedroom===room.name||R.linkedroom===undefined)) replace.push(R)
            }
            else if(room.name==="E7S33") {
                if((room.isNearby(R.room)&&R.room!=="E8S34"&&R.room!=="E8S33")&&(R.linkedroom===room.name||R.linkedroom===undefined)) replace.push(R)
            }
            else if(room.name==="E4S9"&&Memory.isswc) {
                if((room.isNearby(R.room)||R.room==="E6S9")&&(R.linkedroom===room.name||R.linkedroom===undefined)) replace.push(R)
            }
            else if (room.isNearby(R.room)) replace.push(R)
        }
        Memory.miningrooms = replace
        if (currentspawn.memory.harvesters === undefined) {
            currentspawn.memory = {
                harvesters: [],
                builders: [],
                itemrequests: [],
                queue: [],
                builderallocations: { upgrade: 0, buildRoad: 0, general: 0 },
                upgradeRefill: []
            }
            room.memory.LRMdata = []
            room.memory.haulers = []
        }
        if (room.memory.haulers === undefined) {
            room.memory.haulers = Memory.haulers
            room.memory.LRMdata = Memory.longrangemining
            Memory.longrangemining = []
            Memory.haulers = []
        }
        if (room.memory.spawnCooldown === undefined) {
            room.memory.spawnCooldown = 0
        }
        if (room.memory.spawnCooldown > 20) {
            room.memory.spawnCooldown = 0
        }
        room.memory.spawnCooldown = room.memory.spawnCooldown > 0 ? room.memory.spawnCooldown -= 1 : 0
        if (room.memory.storedcreep === undefined) room.memory.storedcreep = []
        Memory.storedcreeps = room.memory.storedcreep
        Memory.longrangemining = room.memory.LRMdata
        report.formatHeader(room.name)

        if (global.updatecache > 100 || room.memory.haulercache === undefined) {
            let full = 0
            for (const T in Memory.longrangemining) {
                let I = Memory.longrangemining[T]
                for (const name in I.creeps) {
                    let creep = Game.creeps[I.creeps[name]]
                    if (creep !== undefined) {

                        if (creep.memory.linktomine===undefined) {
                            let dist = getTrueDistance(new RoomPosition(currentspawn.pos.x, currentspawn.pos.y, currentspawn.room.name), new RoomPosition(creep.pos.x, creep.pos.y, creep.room.name))
                            if (creep.room.controller && creep.room.controller.reservation) dist = dist * 1.8
                            if(creep.getActiveBodyparts(WORK)<5) dist = dist*(creep.getActiveBodyparts(WORK)/6)
                            full += dist
                        }
                    }
                }
            }
            let multi = 0
            report.formatBasic(room.name,"room "+room.name+"'s cache has been upated, it now needs "+full+" hauler parts")
            room.memory.haulercache = (Math.round((full) / 2.5))

        }
        Memory.haulerneeded = room.memory.haulercache
        global.haulercreations = 0
        for (let temp in Memory.longrangemining) {
            global.haulercreations += Memory.longrangemining[temp].creeps.length
        }

        Memory.haulers = room.memory.haulers

        //Note that this is called here to prevent issues with no mining rooms
        // Run the miner code for long-range mining logic
        remotetick(room);

        let test = room.find(FIND_STRUCTURES, {
            filter: (structure:Structure) => {
                return (structure.structureType == STRUCTURE_EXTRACTOR)
            }
        })
        if (test.length > 0) {
            global.isextractor = test[0].id;
        } else global.isextractor = undefined
        // Cache the number of extensions in the spawn's room
        Memory.storecache = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION)
            }
        }).length;
        let towers: StructureTower[] = room.find(FIND_STRUCTURES, {
            filter: (structure:Structure) => {
                return (structure.structureType == STRUCTURE_TOWER)
            }
        });
        let towerdata = { attackedhealer: 0 }
        if (Game.cpu.bucket < 2000) {
            report.formatImportant("*", "low bucket, disabling non-needed codebases")
        }

        checkRampartPassing(room)
        for (let towerold in towers) {
            let tower: StructureTower = towers[towerold]

            let spawns = tower.room.find(FIND_MY_SPAWNS)
            for(let spawn of spawns) if(spawn.hits<spawn.hitsMax) tower.repair(spawn);

            let attackers: Creep[] = tower.room.find(FIND_HOSTILE_CREEPS, {
                filter: function (creep: Creep) {
                    return Allies.indexOf(creep.owner.username) === -1
                }
            }).sort((a: Creep, b: Creep) => a.hits - b.hits)
            if (attackers.length > 0) {
                let healers = tower.room.find(FIND_HOSTILE_CREEPS, {
                    filter: function (creep: Creep) {
                        return Allies.indexOf(creep.owner.username) === -1 && creep.getActiveBodyparts(HEAL) > 0
                    }
                })
                if (towerdata.attackedhealer === 1) {
                    attackers = tower.room.find(FIND_HOSTILE_CREEPS, {
                        filter: function (creep: Creep) {
                            return Allies.indexOf(creep.owner.username) === -1
                        }
                    }).sort((a: Creep, b: Creep) => a.getActiveBodyparts(HEAL) - b.getActiveBodyparts(HEAL))
                }
                if (healers.length > 0 && towerdata.attackedhealer == 0) {
                    attackers = healers
                    towerdata.attackedhealer = 1
                }
                let strCalc = new strengthCalc()
                tower.attack(attackers[0])
                if(strCalc.getEnemyRoomPower(tower.room).estimatedPower>=250) {
                    simpleAllies.requestDefense({roomName:tower.room.name,priority:0.7})
                }
                if(tower.room.storage) {
                    if(tower.room.storage.store[RESOURCE_ENERGY]<50000) {
                        simpleAllies.requestResource({
                            resourceType:RESOURCE_ENERGY,
                            priority:0.7,
                            roomName:tower.room.name,
                            amount:70000-tower.room.storage.store[RESOURCE_ENERGY]
                        })
                    }
                }

            } else {
                let confirm = tower.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < 2000 && object.hits<object.hitsMax
                }).length === 0
                if(confirm&&tower.store[RESOURCE_ENERGY]<=550) {
                    continue
                }
                let objHits = 2000000
                    //@ts-ignore
                if(tower.room.controller.level<=7) {
                    objHits = 1000000
                }
                    //@ts-ignore
                if(tower.room.controller.level<=5) {
                    objHits = 500000
                }
                    //@ts-ignore
                if(tower.room.controller.level<=3) {
                    objHits = 250000
                }
                let targets = tower.room.find(FIND_STRUCTURES, {
                    filter: (object: Structure) => object.hits < object.hitsMax * 0.75 && object.hits < objHits
                });

                // Sort by damage level (most damaged first)
                targets.sort((a: Structure, b: Structure) => a.hits - b.hits);

                // If damaged structures are found, repair the closest one
                if (targets.length > 0) {
                    tower.repair(targets[0])
                }
            }

        }
        let alllinks: StructureLink[] = room.find(FIND_MY_STRUCTURES, {
            filter: function (structure:Structure) {
                return structure.structureType === STRUCTURE_LINK
            }
        })
        for (let I in alllinks) {
            linktick(alllinks[I]);
        }
        // Set cache to 0 if the controller level is 1
        if (room.controller.level == 1) {
            Memory.storecache = 0;
        }
        global.kill = 0
        if (Game.cpu.bucket >= 2000) {
            if (room.controller.level > 2) {
                let add = 0
                for (let temp in Memory.miningrooms) {
                    let I = Memory.miningrooms[temp]
                    if (I.room == room.name) {
                        add = 1
                    }
                }
                if (add == 0) {
                    global.miningroomsReset.push({ room: room.name, usedSegment: 0 })
                }
            }
        }
        // Check for new harvester, builder, and combat units
        currentspawn.queueCheck()
        let allspawns = room.find(FIND_MY_SPAWNS)
        if (!global.cache) {
            global.cache = {}
        }
        global.defenseNeeded -= 1
        for (let spawn of allspawns) {
            if(spawn.hits<spawn.hitsMax) {
                spawn.room.controller?.activateSafeMode()
            }
            let nearby = []
            newhaulercheck(spawn.name);
            if (spawn.spawning === null && nearby.length <= 0 && spawn.room.controller && room.memory.spawnCooldown <= 0) {
                if (room.energyAvailable >= room.energyCapacityAvailable / 2 || spawn.room.getMasterSpawn().memory.harvesters.length < 3 ||
                    (spawn.room.getMasterSpawn().memory.queen === undefined && spawn.room.getMasterSpawn().memory.queen2 === undefined && spawn.room.controller.level > 3)) {
                    try {
                        console.log(room.name,"trying to spawn")
                        if ((spawn.room.getMasterSpawn().memory.queen === undefined && spawn.room.getMasterSpawn().memory.queen2 === undefined && spawn.room.controller.level > 3)) {

                            newharvcheck(spawn.name);
                            newbuildcheck(spawn.name);
                            newcombatcheck(spawn.name);

                        } else {

                            newharvcheck(spawn.name);
                            newbuildcheck(spawn.name);
                            newcombatcheck(spawn.name);

                        }
                    } catch (err) {
                        console.log(room.name, "spawn " + spawn + " errored spawning with " + err)
                    }
                    if (global.createdunit === 1) room.memory.spawnCooldown = 10
                }
            }
        }
        /*if(Memory.isswc&&room.controller.level >= 4) {
            let iter = 0
            report.formatBasic(room.name,"AMONG")
            for(let I of Memory.longrangemining) {
                if(I.creeps.length>0) {
                    let check = Game.creeps[I.creeps[0]]
                    report.formatBasic(room.name,"check")
                    if(check===undefined) continue
                    report.formatBasic(room.name,"work?")
                    if(I.claimer===undefined) {
                        report.formatBasic(room.name,"this is a huge test")
                        if(Memory.wantToClaim.filter((a)=>a.room==check.room.name).length===0) {
                            Memory.wantToClaim.push({room:check.room.name,override:true,LRMstate:iter})
                        }
                    }
                }
                iter+=1
            }
        }*/
       if(Memory.isswc) {
            if(currentspawn.memory.queue.length < 1&&Memory.scouts.length<5) {
                report.formatBasic("*","scout made")
                currentspawn.queueAppend(
                    [MOVE],
                    { spawnid: currentspawn.id},
                    "scout"
                )
            }
            if(currentspawn.memory.queue.length < 1&& room.controller.level >= 6 && Memory.longrangemining[Memory.longrangemining.length - 1].creeps.length !== 0&&(Memory.triorequests.length>0||Game.flags.basebreak !== undefined)&&(room.storage?.store[RESOURCE_ENERGY]??0)>50000) {
                if(Memory.trios.length<3) {
                    let id = String(Math.random())
                    let item

                    if(Memory.triorequests.length>0) {
                        item = Memory.triorequests.shift()
                        //@ts-ignore
                        Memory.trios.push({mainCreep:undefined,healerCreeps:[],mainCreepType:"attack",state:"creating",plan:[],room:item?.roomName,id:id,isSkrimisher:true})
                    } else {
                        //@ts-ignore
                        Memory.trios.push({mainCreep:undefined,healerCreeps:[],mainCreepType:"attack",state:"creating",plan:[],room:Game.flags.basebreak.pos.roomName,id:id,isSkrimisher:false})
                    }

                    currentspawn.queueAppend(
                        [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
                        { spawnid: currentspawn.id, reserving: id},
                        "basebreakattack"
                    )
                    currentspawn.queueAppend(
                        [TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],
                        { spawnid: currentspawn.id, reserving: id},
                        "basebreakheal"
                    )
                    console.log("room "+room.name+" is queueing a basebreaker")
                }
            }
        }
        if(Memory.isswc) {
            for(let I of Memory.longrangemining) {
                if(I.claimer===undefined&&(I.room!==undefined&&I.room!==room.name)&&currentspawn.memory.queue.length < 1&& room.controller.level >= 3 && Memory.longrangemining[Memory.longrangemining.length - 1].creeps.length !== 0) {
                    if((global.defenseNeeded < 20 || Memory.fighters.length >= 4)&&Memory.storecache>=20) {
                        currentspawn.queueAppend(
                            (room.controller??{level:0}).level===3?[MOVE,CLAIM]:[MOVE,MOVE,CLAIM,CLAIM],
                            { spawnid: currentspawn.id, reserving: I.room,check:1,state:0},
                            "claimer"
                        )
                    }
                    break;
                }
            }
        }
        if(Memory.wantToClaim.length>0&&currentspawn.memory.queue.length < 1&& room.controller.level >= 5 && Memory.longrangemining[Memory.longrangemining.length - 1].creeps.length !== 0) {
            if(getTrueDistance(new RoomPosition(25,25,Memory.wantToClaim[0].room), new RoomPosition(25,25,room.name))<=580&&(global.defenseNeeded < 20 && Memory.fighters.length >= 4)) {
                if(Memory.wantToClaim[0].override) {
                } else {
                    currentspawn.queueAppend(
                        [MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM],
                        { spawnid: currentspawn.id, reserving: Memory.wantToClaim[0].room},
                        "claimer"
                    )
                }
                console.log("room "+room.name+" is queueing a claimer")
                Memory.wantToClaim.shift()
            }
        }
        if (Memory.longrangemining[Memory.longrangemining.length - 1] !== undefined && global.createdunit === 0) {
            let LRBspawnin = 2
            if(Memory.isswc) LRBspawnin = 5
            if (global.LRBmake === 1 &&typeof global.LRBroom === "string" && Memory.longRangeBuilders.length < LRBspawnin && currentspawn.memory.queue.length < 1 && room.controller.level >= 5 && Memory.longrangemining[Memory.longrangemining.length - 1].creeps.length !== 0) {
                if(getTrueDistance(new RoomPosition(25,25,global.LRBroom), new RoomPosition(25,25,room.name))/50<=7&&(global.defenseNeeded < 20 && Memory.fighters.length >= 4)) {
                    report.formatBasic(room.name, "An LRB was added to the queue")
                    currentspawn.queueAppend(
                        [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
                        { spawnid: currentspawn.id, room: global.LRBroom },
                        "LRB"
                    )
                }
            }
        }
        if(Memory.isswc) {

            if(room.memory.buildState===undefined) {
                if(room.controller.level<=3) {
                    room.memory.buildState = {
                        autoBuildOn: true,
                        plannedRoads: false,
                        plannedRamparts: false
                    }
                }

            } else {

                if(room.memory.buildState.autoBuildOn) {
                    if(room.memory.buildState.plannedRoads===false) {
                        let S = room.find(FIND_SOURCES)
                        let goals:RoomPosition[] = []
                        goals.push(room.controller?.pos)
                        //@ts-ignore
                        for(let I of S) goals.push(I.pos)
                        let ret = useRoadPlanner(room.getMasterSpawn().pos,goals,false,true)
                        if(typeof ret !== "string"||ret==="too many roads!") {
                            room.memory.buildState.plannedRoads = true
                        }
                    }
                    if(room.memory.buildState.buildInfo===undefined) {
                        room.memory.buildState.buildInfo={
                            builds: [],
                            built: [],
                            sites: [],
                            confirmed:false
                        }
                    }
                    if(room.memory.buildState.plannedRamparts===false&&room.controller.level>=3) {
                        buildRamparts(currentspawn)
                        room.memory.buildState.plannedRamparts = true
                    }
                    if(Game.time%100===0&&room.memory.buildState.buildInfo.sites.length===0) {
                        room.memory.buildState.buildInfo.builds = []
                        room.memory.buildState.buildInfo.confirmed = false
                        room.memory.buildState.buildInfo.built = []
                    }
                    if(Game.time%10===0) {
                        createAndUpdateCheckerSite(room.memory.buildState,"buildInfo",currentspawn.name)
                    }
                }
            }

        }

        // Waste of cpu
        /*
        try {
            for(let I in Memory.haulers) {
                if(Game.creeps[Memory.haulers[I]].ticksToLive<1000) {
                    currentspawn.renewCreep(Game.creeps[Memory.haulers[I]])
                }
            }
        } catch(e) {}
        */
        // ||||||||||||||||||||||
        // run for each unit type
        // ||||||||||||||||||||||
        if (currentspawn.memory.harvesters.length > 0) {
            currentspawn.memory.harvesters.forEach(item => harvesterforeach(item, currentspawn.name));
        }
        // Run through each builder in memory and execute its tasks
        if (currentspawn.memory.builders.length > 0) {
            currentspawn.memory.builders.forEach(item => builderforeach(item, currentspawn.name));
        }
        if (Game.cpu.bucket >= 2000) {
            if (currentspawn.memory.minharvs) {
                currentspawn.memory.minharvs.forEach(item => minharvsforeach(item, currentspawn.name));
            }
        }
        if (currentspawn.memory.upgradeRefill !== undefined&&typeof currentspawn.memory.upgradeRefill === "object") {
            for(let refill of currentspawn.memory.upgradeRefill)
            if (refill in Game.creeps) {
                refillTick(Game.creeps[refill])
            } else {
                currentspawn.memory.upgradeRefill.splice(currentspawn.memory.upgradeRefill.indexOf(refill),1)
            }
        }
        if (currentspawn.memory.queen !== undefined) {
            if (currentspawn.memory.queen in Game.creeps) {
                queentick(Game.creeps[currentspawn.memory.queen], "queen1")
            } else {
                currentspawn.memory.queen = undefined
            }
        }
        if (Memory.haulers.length > 0) {
            Memory.haulers.forEach(item => haulerforeach(item));
        }

        if (Game.cpu.bucket >= 2000) {
            if (currentspawn.memory.queen2 !== undefined) {
                if (currentspawn.memory.queen2 in Game.creeps) {
                    queentick(Game.creeps[currentspawn.memory.queen2], "queen2")
                } else {
                    currentspawn.memory.queen2 = undefined
                }
            }
            if (room.terminal !== undefined) {
                // too much usage rn
                //terminaltick(room.terminal)
            }
        }

        allyTick(room)

        report.formatBasic(room.name, "LRM sites: " + room.memory.LRMdata.length)
        report.formatBasic(room.name, "haulers: " + Memory.haulers.length + "/" + Memory.haulerSatisfied)
        report.formatBasic(room.name, "used CPU " + String(Game.cpu.getUsed()-cpuTest) + "/" + Game.cpu.limit)

        cpuTest = Game.cpu.getUsed()
        room.memory.storedcreep = Memory.storedcreeps
        Memory.longrangemining = room.memory.LRMdata
        Memory.haulers = room.memory.haulers
        Memory.miningrooms = global.miningroomsReset
    }
    if (Game.cpu.bucket >= 2000) {
        let iter = 0
        if(Memory.harass.length>5) Memory.harass.shift()
        for(let creep of Memory.harassers) {
            if (Game.creeps[creep] === undefined) {
                Memory.harassers.splice(Memory.harassers.indexOf(creep),1)
                break;
            }
            harassertick(Game.creeps[creep])
        }
        for (let temp in Memory.claimers) {
            let claimer = Game.creeps[Memory.claimers[temp]]
            if (claimer === undefined) {
                Memory.claimers.splice(temp,1)
                break;
            }
            if (claimer.memory.reserving !== undefined) {
                if (claimer.room.name !== claimer.memory.reserving) {
                    claimer.moveTo(new RoomPosition(25, 25, claimer.memory.reserving), { reusePath: 40 })
                } else {
                    let check: StructureController[] = claimer.room.find(FIND_STRUCTURES, {
                        filter: function (structure:Structure) {
                            return structure.structureType == STRUCTURE_CONTROLLER
                        }
                    })
                    if (check) {
                        if (claimer.claimController(check[0]) == ERR_NOT_IN_RANGE) claimer.moveTo(check[0],{reusePath:40})
                    }
                }
            } else {
                claimer.say("roomless")
                report.formatBasic("*", "claimer " + claimer.name + " is roomless!")
            }
        }
        if(Memory.isswc) {
            for(let trio of Memory.trios) {
                let updated = triotick(trio)
                if(updated===null) {
                    Memory.trios.splice(Memory.trios.indexOf(trio),1)
                    break
                } else {
                    Memory.trios[iter] = updated
                }
                iter+=1
            }
            for(let scout of Memory.scouts) {
                let creep = Game.creeps[scout]
                if (scout in Game.creeps) {
                    scouttick(creep)
                } else {
                    const index = Memory.scouts.indexOf(scout);
                    if (index > -1) {
                        Memory.scouts.splice(index, 1);
                        break;
                    }
                }
            }
        }
        for (let temp in Memory.longRangeBuilders) {
            let Lbuilder = Memory.longRangeBuilders[temp]
            if (Lbuilder in Game.creeps) {
                LRBtick(Game.creeps[Lbuilder])
            } else {
                const index = Memory.longRangeBuilders.indexOf(Lbuilder);
                if (index > -1) {
                    Memory.longRangeBuilders.splice(index, 1);
                    break;
                }
            }
        }
    }
    // ||||||||||||||||||||||
    //  Unit type running end
    // ||||||||||||||||||||||
    // Clear stored creeps if the first stored creep is undefined
    if (Game.creeps[Memory.storedcreeps[0]] === undefined) {
        Memory.storedcreeps = [];
    } else {
        Game.creeps[Memory.storedcreeps[0]].moveTo(9, 5, { reusePath: 40 })
    }

    // Cleanup memory for creeps that no longer exist
    for (let curcreep in Memory.creeps) {
        if ((curcreep in Game.creeps)===false) {
            delete Memory.creeps[curcreep]
        }
    }


    if (global.fixticks > 1000) {
        Memory.usedsources = new Array();
        Memory.buildersources = new Array();
        Memory.upgradersources = new Array();
        report.formatBasic("*", "forcefully resetting source allocations, to fix any issues that arise while offline")
        global.fixticks = 0
    }

    // Run through each fighter in memory and execute its tasks
    if (Memory.fighters.length > 0) {
        Memory.fighters.forEach(item => combatforeach(item));
    }
    // Log CPU usage with different warnings based on usage level
    let ecolevel = 3
    if (Memory.haulers.length < 4) {
        ecolevel = 1
    }
    if (Memory.haulers.length < 1) {
        ecolevel = 0
    }
    global.avgcpu.push(Game.cpu.getUsed())
    global.cputrend.push(Game.cpu.getUsed())
    let avg = (array: any[]) => array.reduce((a, b) => a + b) / array.length;
    let stringify = {
        cpuUsage: avg(global.avgcpu),
        bucket: Game.cpu.bucket,
        ecoStatus: ecolevel
    }
    global.printQueue.push({headerdata:{roomname:"*",isglobal:true},msg:"----------------------"})
    report.formatImportant("*","harassing rooms "+Memory.harass)
    if (global.avgcpu.length > 14) {
        global.avgcpu.splice(0, 1)
    }
    if (global.cputrend.length > 3000) {
        global.cputrend.splice(0, 1)
    }
    RawMemory.segments[1] = JSON.stringify(stringify)
    if (Game.cpu.getUsed() < 16) {
        for (let T in Game.creeps) {
            let creep = Game.creeps[T]
            if (creep.memory._move !== undefined) {
                let poly = [new RoomPosition(creep.pos.x, creep.pos.y, creep.room.name)]
                for (let path of Room.deserializePath(creep.memory._move.path)) {
                    poly.push(new RoomPosition(path.x, path.y, creep.room.name))
                }
                Game.map.visual.poly(poly, { stroke: '#ffffff', strokeWidth: .8, opacity: .2, lineStyle: 'dashed' })
            }
        }
    }
    if (Game.cpu.getUsed() >= 20) {
        report.formatImportant("*", "tf are you doing, you're at the max cpu! (" + Game.cpu.getUsed() + ")");
    }
    report.flush()
    //console.log("used "+String(new Date().getTime()-cpuNonIntents)+" cpu not including intents")
});

// Function to handle tasks for each harvester
function harvesterforeach(item: string, spawntype: string) {
    if (item in Game.creeps) {
        if (Game.creeps[item].room == Game.spawns[spawntype].room) {
            // Renew harvester if it's near the end of its lifespan
            //@ts-ignore
            if (Game.creeps[item].ticksToLive < 1000) {
                Game.spawns[spawntype].renewCreep(Game.creeps[item]);
            }
            // Execute harvester tasks
            if (global.kill == 1) {
                remove("usedsources", Game.creeps[item])
                Game.creeps[item].suicide()
            } else {
                harvtick(Game.creeps[item]);
            }
        }
    } else {
        // Remove harvester from memory if it no longer exists
        const index = Game.spawns[spawntype].memory.harvesters.indexOf(item);
        if (index > -1) {
            Game.spawns[spawntype].memory.harvesters.splice(index, 1);
        }
    }
}

// Function to handle tasks for each hauler
function haulerforeach(item: string) {
    if (item in Game.creeps) {
        // Renew hauler if it's near the end of its lifespan
        // Execute hauler tasks
        haulertick(Game.creeps[item]);
    } else {
        // Remove harvester from memory if it no longer exists
        const index = Memory.haulers.indexOf(item);
        if (index > -1) {
            Memory.haulers.splice(index, 1);
        }
    }
}

// Function to handle tasks for each builder
function builderforeach(item: string, spawntype: string) {
    if (item in Game.creeps) {
        // Renew builder if it's near the end of its lifespan
        //if(Game.creeps[item].ticksToLive < 1000) {
        //Game.spawns[spawntype].renewCreep(Game.creeps[item]);
        //}
        // Execute builder tasks
        buildertick(Game.creeps[item], spawntype);
    } else {
        // Manage memory cleanup and task allocations if builder no longer exists
        const index = Game.spawns[spawntype].memory.builders.indexOf(item);
        let d = Memory.creeps[item];
        //TS really hates this part
        //@ts-ignore
        let data: { memory: CreepMemory } = { memory: d };
        //@ts-ignore
        if (data.memory != undefined) {
            //@ts-ignore
            if (data.memory.task != undefined) {
                //@ts-ignore
                Game.spawns[spawntype].memory.builderallocations[data.memory.task] -= 1;
                //@ts-ignore
                if (data.memory.task == 'general') {
                    remove("buildersources", data);
                }
                //@ts-ignore
                if (data.memory.task == 'upgrade') {
                    remove("upgradersources", data);
                }
                //@ts-ignore
                data.memory.task = undefined;
            }
        }
        if (index > -1) {
            Game.spawns[spawntype].memory.builders.splice(index, 1);
        }
    }
}

// Function to handle tasks for each combat unit
function combatforeach(item: string) {
    if (item in Game.creeps) {
        // Renew combat unit if it's near the end of its lifespan
        // Execute combat unit tasks
        combattick(Game.creeps[item]);
    } else {
        // Remove combat unit from memory if it no longer exists
        const index = Memory.fighters.indexOf(item);
        if (index > -1) {
            Memory.fighters.splice(index, 1);
        }
    }
}
function minharvsforeach(item: string, spawntype: string) {
    if (item in Game.creeps) {
        // Renew hauler if it's near the end of its lifespan
        // Execute hauler tasks
        minharvtick(Game.creeps[item]);
    } else {
        // Remove harvester from memory if it no longer exists
        //@ts-ignore
        const index = Game.spawns[spawntype].memory.minharvs.indexOf(item);
        if (index > -1) {
            //@ts-ignore
            Game.spawns[spawntype].memory.minharvs.splice(index, 1);
        }
    }
}
