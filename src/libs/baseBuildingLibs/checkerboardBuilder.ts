import { ConstructionSite } from "../../../typings/construction-site"
import { Id } from "../../../typings/helpers"
import { report } from "../roomReporting"
import { generateName } from "../general.functions"
import { simpleAllies } from "../allyLibs/simpleAllies"
export function createAndUpdateCheckerSite(memBase: { [link: string]: any }, memLink: string, spawnname: string) {
    if (Game.cpu.bucket < 5000) {
        return
    }
    try {
        let test = new checkerBoard({
            RCL: 8,
            radius: 1,
            importantBuildRadius: 7,
            buildlimit: 10,
        })
        if (memBase[memLink].confirmed === false) {
            test.checkerCalculate(spawnname)

            memBase[memLink] = { builds: test.builds, sites: test.sites, built: [] }
            memBase[memLink].builds = test.builds
            if (memBase[memLink].sites.length === 0) {
                memBase[memLink].sites = test.sites
            }
            memBase[memLink].built = test.built
            memBase[memLink].confirmed = true
        }

        test.builds = memBase[memLink].builds
        test.sites = memBase[memLink].sites
        test.built = memBase[memLink].built
        report.formatBasic("debug", String(test.builds.length))
        test.updateSites(spawnname)
        memBase[memLink].builds = test.builds
        memBase[memLink].sites = test.sites
        memBase[memLink].built = test.built
        if (memBase[memLink].sites.length > 0&&Game.spawns[spawnname].room.storage!==undefined) {
            let val = Game.spawns[spawnname].room.storage?.store[RESOURCE_ENERGY]
            val = val===undefined ? 0 : val
            if(val<80000) {
                simpleAllies.requestResource({
                    resourceType: RESOURCE_ENERGY,
                    priority: 0.3,
                    roomName: Game.spawns[spawnname].room.name,
                    amount: 80000 - val
                })
            }
        }
    } catch (e) { console.log("build error " + e) }
}
function firstIUpper(str: string) {
    let start1 = "abcdefghijklmnopqrstuvwxyz".split('')
    let start2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
    let map: { [map: string]: string } = {}
    let iter = 0
    for (let start of start1) {
        map[start] = start2[iter]
        iter += 1
    }
    return map[str]
}
interface siteConst {
    x: number;
    y: number;
    type: StructureConstant;
}
export class checkerBoard {
    declare data: {
        RCL: number,
        radius: number,
        importantBuildRadius: number,
        buildlimit: number,
    }
    declare builds: siteConst[]
    declare sites: Id<ConstructionSite>[]
    declare built: siteConst[]
    constructor(opts: {
        RCL: number,
        radius: number,
        importantBuildRadius: number,
        buildlimit: number,
    }) {
        this.data = opts
    }
    updateSites(spawnName: string) {
        for (let build of this.builds) {
            if (this.builds.filter((a) => build.x === a.x && build.y === a.y).length > 1) {
                this.builds.splice(this.builds.indexOf(build), 1)
            }
        }
        var infoPak = this.data
        let spawn = Game.spawns[spawnName]

        if (this.sites.length <= infoPak.buildlimit && this.builds.length > 0) {
            let iter = 0
            this.builds.sort((a, b) =>
                (Number(a.type === STRUCTURE_ROAD) - Number(b.type === STRUCTURE_ROAD))
            );
            this.builds.sort((a, b) =>
                (Number(a.type === STRUCTURE_ROAD) - Number(b.type === STRUCTURE_ROAD)) ||
                (new RoomPosition(a.x, a.y, spawn.room.name).getRangeTo(spawn) -
                    new RoomPosition(b.x, b.y, spawn.room.name).getRangeTo(spawn)
                ));
            while (this.sites.length < infoPak.buildlimit && this.builds.length > 0) {

                if (iter > this.builds.length) {
                    break
                }

                let site = this.builds.shift()
                if (site === undefined) break;
                let pos = new RoomPosition(site.x, site.y, spawn.room.name)
                let confirm
                if (site.type === STRUCTURE_SPAWN) {
                    let spawnName = generateName()
                    let iter = 0
                    while (spawnName in Game.spawns) {
                        spawnName = generateName()
                        iter += 1
                        if (iter > 100) {
                            spawnName = "All names were taken :( " + String(Math.random())
                        }
                    }
                    confirm = pos.createConstructionSite(site.type, spawnName)
                } else if (site.type !== STRUCTURE_ROAD || (spawn.room.controller ?? { level: 0 }).level >= 7) {
                    //console.log(pos,site.type)
                    //@ts-ignore
                    confirm = pos.createConstructionSite(site.type)
                }
                if (confirm !== OK&&site!==undefined) {
                    let confirm = false
                    const look = pos.look()
                    look.forEach(function (lookObject) {
                        if (lookObject.type == LOOK_STRUCTURES &&
                            (lookObject.structure?.structureType === site?.type)) {
                            confirm = true
                        }
                    });
                    if (confirm) {
                        this.built.push(site)
                    } else {
                        this.builds.push(site)
                    }
                    //console.log("ERR "+confirm)
                } else {
                    console.log("built " + site.type)
                    this.built.push(site)
                    break;
                }
                iter += 1
            }
        }
        for (let S of this.builds) {
            if (this.built.filter((a) => S.x === a.x && S.y === a.y).length > 1) {
                //spawn.room.visual.text("Dupe!",new RoomPosition(S.x,S.y,spawn.room.name),{strokeWidth:0.05,stroke:"red"})

            } else {
                spawn.room.visual.text(firstIUpper(S.type[0]) + S.type[1], new RoomPosition(S.x, S.y, spawn.room.name), { strokeWidth: 0.05 })
            }
        }
        this.sites = []
        for (let id in Game.constructionSites) {
            if (this.built.some((a) => Game.constructionSites[id].pos.x === a.x && Game.constructionSites[id].pos.y === a.y)) {
                //@ts-ignore
                this.sites.push(id)
            }
        }
    }
    checkerCalculate(spawnName: string|RoomPosition):boolean {
        let spawn:StructureSpawn|{room:Room,pos:RoomPosition}
        if(spawnName instanceof RoomPosition) {
            //@ts-ignore
            spawn = {room:{name:spawnName.roomName},pos:spawnName}
        } else {
            spawn = Game.spawns[spawnName]
        }
        var infoPak = this.data
        let RCL = infoPak.RCL
        let radius = infoPak.radius
        let impbuildr = infoPak.importantBuildRadius
        let needed = 0
        for (let I in CONTROLLER_STRUCTURES) {
            if (I !== STRUCTURE_ROAD && I !== STRUCTURE_WALL && I !== STRUCTURE_RAMPART && I != STRUCTURE_LAB && I != STRUCTURE_EXTRACTOR && I !== STRUCTURE_CONTAINER) {
                //@ts-ignore
                let amt = CONTROLLER_STRUCTURES[I][RCL]
                if (I === STRUCTURE_LINK) amt = amt > 1 ? 1 : 0
                if (I === STRUCTURE_SPAWN) amt -= 1
                needed += amt
            }
        }
        needed += 6
        let allBuilds: siteConst[] = []
        let whereBuild: { x: number, y: number, type?: StructureConstant }[] = []
        let alreadyBuild = []
        let subDiamonds = []
        let allNext = [{ pos: { x: spawn.pos.x, y: spawn.pos.y + 1 }, dontappend: false }]
        let checkers = needed / Math.pow(radius, 2)
        while (whereBuild.length < needed) {
            if(allNext.length===0&&whereBuild.length < needed) {
                return false
            }
            if (Game.cpu.bucket < 5000) {
                return false
            }
            allNext = [...new Set(allNext)];
            let loc = allNext.shift()
            if (loc === undefined) {
                continue
            }
            //@ts-ignore
            if (alreadyBuild.filter((a) => a.x === loc.pos.x && a.y === loc.pos.y).length === 0 && ((loc.pos.x > 40 || loc.pos.x < 10 || loc.pos.y > 40 || loc.pos.y < 10) === false)) {
                alreadyBuild.push(loc.pos)
                let item = this.buildChecker(radius, loc.pos, spawn)
                if (loc.dontappend === false) {
                    allNext = allNext.concat(item.next)
                }
                whereBuild = whereBuild.concat(item.open)
                allBuilds = allBuilds.concat(item.builds)
                subDiamonds.push(item.subDiamonds)
            } else {
                //spawn.room.visual.circle(new RoomPosition(loc.pos.x, loc.pos.y, "sim"), { stroke: "red" })
            }
        }
        for (let I of whereBuild) {
            //spawn.room.visual.circle(new RoomPosition(I.x, I.y, spawn.room.name), { stroke: "orange" })
        }
        let importantStructs = [STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_SPAWN, STRUCTURE_LINK, STRUCTURE_FACTORY, STRUCTURE_TERMINAL, STRUCTURE_POWER_SPAWN, STRUCTURE_NUKER, STRUCTURE_OBSERVER]
        for (let I of importantStructs) {
            //@ts-ignore
            if (I !== STRUCTURE_ROAD && I !== STRUCTURE_WALL && I !== STRUCTURE_RAMPART && I != STRUCTURE_LAB && I != STRUCTURE_EXTRACTOR && I !== STRUCTURE_CONTAINER) {
                let amt
                if (CONTROLLER_STRUCTURES[I] === undefined) {
                    throw new Error("That structure " + I + " doesn't exist!")
                } else {
                    amt = CONTROLLER_STRUCTURES[I][RCL]
                }
                if (I === STRUCTURE_LINK) amt = amt > 1 ? 1 : 0
                if (I === STRUCTURE_SPAWN) amt -= 1
                if (whereBuild.length < amt) {
                    throw new Error("Invalid amount of locations! " + amt + "/" + whereBuild.length)
                }
                for (let iter = 0; iter < amt; iter++) {
                    if (importantStructs.indexOf(I) !== -1) {
                        //@ts-ignore
                        let possible = getSuitableWithinRange(impbuildr, spawn.pos, whereBuild.slice(0))

                        if (possible.length === 0) {
                            throw new Error("Invalid amount of important locations! Please expand the location radius")
                        }
                        let item = possible.shift()
                        if (item === undefined) {
                            continue
                        }
                        whereBuild.splice(whereBuild.indexOf(item), 1)
                        //spawn.room.visual.text("important", new RoomPosition(item.x, item.y, spawn.room.name), { stroke: "red", align: "center" })
                        allBuilds.push({ x: item.x, y: item.y, type: I });
                        //spawn.room.visual.circle(new RoomPosition(item.x, item.y, spawn.room.name), { stroke: "blue" })
                    }
                }
            }
        }
        for (let I in CONTROLLER_STRUCTURES) {
            if (Game.cpu.bucket < 5000) {
                return false
            }
            if (I !== STRUCTURE_ROAD && I !== STRUCTURE_WALL && I !== STRUCTURE_RAMPART && I != STRUCTURE_LAB && I != STRUCTURE_EXTRACTOR && I !== STRUCTURE_CONTAINER) {
                //@ts-ignore
                let amt: number = CONTROLLER_STRUCTURES[I][RCL]
                if (I === STRUCTURE_LINK) amt = amt > 1 ? 1 : 0
                if (whereBuild.length < amt) {
                    throw new Error("Invalid amount of locations! " + amt + "/" + whereBuild.length)
                }
                for (let iter = 0; iter < amt; iter++) {
                    //@ts-ignore
                    if (importantStructs.indexOf(I) === -1) {
                        whereBuild.sort((a, b) =>
                            new RoomPosition(a.x, a.y, spawn.room.name).getRangeTo(spawn) -
                            new RoomPosition(b.x, b.y, spawn.room.name).getRangeTo(spawn))
                        let item = whereBuild.shift()
                        if (item === undefined) {
                            continue
                        }
                        //spawn.room.visual.text("normal", new RoomPosition(item.x, item.y, spawn.room.name), { stroke: "red", align: "center" })
                        //@ts-ignore
                        allBuilds.push({ x: item.x, y: item.y, type: I });
                        //spawn.room.visual.circle(new RoomPosition(item.x, item.y, spawn.room.name), { stroke: "blue" })
                    }
                }
            }
        }
        this.builds = allBuilds
        this.sites = []
        this.built = []
        return true
    }
    buildChecker = function (radius: number, mid: { x: number, y: number }, spawn: {room:Room,pos:RoomPosition}) {
        let builds = []
        let open: { x: number, y: number }[] = []
        radius = radius
        let dirs = [{ x: radius, y: radius }, { x: radius * -1, y: radius }, { x: radius * -1, y: radius * -1 }, { x: radius, y: radius * -1 }]
        let start = { x: mid.x, y: mid.y - radius * 2 }
        let roads: { x: number, y: number }[] = []
        let next = []
        let iter = 0
        for (let road of dirs) {
            roads = roads.concat(basicline(start.x, start.y, start.x + road.x, start.y + road.y))
            for (let wall of roads) {
                if (new Room.Terrain(spawn.room.name).get(wall.x, wall.y) === 1) {
                    //spawn.room.visual.text("WALL", new RoomPosition(wall.x, wall.y, spawn.room.name), { stroke: "red", align: "center" })
                    return { builds: [], open: [], next: [], fail: 1 }
                }
                if ((wall.x < 5 || wall.x > 45) || (wall.y < 5 || wall.y > 45)) {
                    return { builds: [], open: [], next: [], fail: 1 }
                }
            }
            start.x = start.x + road.x
            start.y = start.y + road.y
            if (iter === 0) {
                let roomPos = { x: start.x + radius, y: start.y - radius }

                next.push({ pos: roomPos, dontappend: false })
                roomPos = { x: start.x, y: start.y }
                next.push({ pos: roomPos, dontappend: true })
                //spawn.room.visual.circle(new RoomPosition(roomPos.x, roomPos.y, spawn.room.name))
            }
            if (iter === 1) {
                let roomPos = { x: start.x, y: start.y + radius * 2 }
                next.push({ pos: roomPos, dontappend: false })
                roomPos = { x: start.x, y: start.y }
                next.push({ pos: roomPos, dontappend: true })
                //spawn.room.visual.circle(new RoomPosition(roomPos.x, roomPos.y, spawn.room.name))
            }
            if (iter === 2) {
                let roomPos = { x: start.x - radius, y: start.y - radius }
                next.push({ pos: roomPos, dontappend: false })
                roomPos = { x: start.x - radius * 4, y: start.y  }
                next.push({ pos: roomPos, dontappend: false })

                //spawn.room.visual.circle(new RoomPosition(roomPos.x, roomPos.y, spawn.room.name))
            }
            if (iter === 3) {
                let roomPos = { x: start.x, y: start.y }
                next.push({ pos: roomPos, dontappend: false })
                //spawn.room.visual.circle(new RoomPosition(roomPos.x, roomPos.y, spawn.room.name))
            }
            iter += 1
        }
        //spawn.room.visual.circle(new RoomPosition(mid.x, mid.y, spawn.room.name), { stroke: "yellow" })
        for (let fail of [{ x: mid.x, y: mid.y - 1 }, { x: mid.x + 1, y: mid.y - 2 }, { x: mid.x, y: mid.y - 2 }, { x: mid.x - 1, y: mid.y - 2 }, { x: mid.x, y: mid.y - 3 }]) {
            if (new Room.Terrain(spawn.room.name).get(fail.x, fail.y) === 1) {
                //spawn.room.visual.text("WALL", new RoomPosition(fail.x, fail.y, spawn.room.name), { stroke: "red", align: "center" })
                return { builds: [], open: [], next: [], fail: 1 }
            }
        }
        if (radius === 2) {
            open = open.concat([{ x: mid.x, y: mid.y - 1 }, { x: mid.x + 1, y: mid.y - 2 }, { x: mid.x, y: mid.y - 2 }, { x: mid.x - 1, y: mid.y - 2 }, { x: mid.x, y: mid.y - 3 }])
        } else {
            open.push(start)
        }
        start.y -= radius
        iter = 0
        for (let I in roads) {
            iter += 1
            if (iter > 20) {
                break;
            }
            builds.push({ x: roads[I].x, y: roads[I].y, type: STRUCTURE_ROAD });
        }
        for (let O of open) {
            if (O.x === spawn.pos.x && O.y === spawn.pos.y) {
                open.splice(open.indexOf(O), 1)
            }
        }
        return { builds: builds, open: open, next: next, subDiamonds: mid }
    }
}
function getSuitableWithinRange(range: number, pos: { x: number, y: number }, array: siteConst[]) {
    return array.filter(a => {
        const distance = Math.sqrt(Math.pow(a.x - pos.x, 2) + Math.pow(a.y - pos.y, 2));
        return distance <= range;
    });
}
function basicline(x: number, y: number, ex: number, ey: number) {
    //spawn.room.visual.line(new RoomPosition(x, y, "sim"), new RoomPosition(ex, ey, "sim"));
    let arr = [];
    let dx = ex - x;
    let dy = ey - y;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));
    let xStep = dx / steps || 0;
    let yStep = dy / steps || 0;
    for (let i = 0; i <= steps; i++) {
        arr.push({
            x: Math.round(x + xStep * i),
            y: Math.round(y + yStep * i)
        });
    }
    return arr;
}
