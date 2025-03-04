import { Id } from "../../typings/helpers";
import { Structure } from "../../typings/structure";
import { getTrueDistance } from "../libs/general.functions";
import { report } from "../libs/roomReporting"
import { Allies } from "../libs/allyLibs/allyConsts"
import { strengthCalc } from "../libs/combatLibs/calcCreepPower"
import { simpleAllies } from "../libs/allyLibs/simpleAllies"
export function tick(trio: trioMemory): trioMemory | null {
    let calc = new strengthCalc()
    if (trio.state === "moving") {
        if (Game.creeps[trio.mainCreep] === undefined) {
            return null
        }
        if (trio.isSkrimisher) {
            trio = healAttacker(trio)

            if (getTrueDistance(Game.creeps[trio.healerCreeps[0]].pos, Game.creeps[trio.mainCreep].pos) > 2 && Game.creeps[trio.healerCreeps[0]].room.name === Game.creeps[trio.mainCreep].room.name) {
                //Game.creeps[trio.mainCreep].moveTo(Game.creeps[trio.healerCreeps[0]])
                return trio
            }
            if (attackCreeps(trio)) {
                report.formatBasic("*", "test")
                return trio
            }
            let attacker: Creep = Game.creeps[trio.mainCreep]
            attacker.moveTo(new RoomPosition(25, 25, trio.room), { reusePath: 20 })
            if (attacker.room.name === trio.room) {
                trio.state = "attacking"
            }
            if (!Game.creeps[trio.mainCreep]) {
                trio.state = "retreating"
            }
        } else {
            trio = healAttacker(trio)

            if (getTrueDistance(Game.creeps[trio.healerCreeps[0]].pos, Game.creeps[trio.mainCreep].pos) > 2 && Game.creeps[trio.healerCreeps[0]].room.name === Game.creeps[trio.mainCreep].room.name) {
                //Game.creeps[trio.mainCreep].moveTo(Game.creeps[trio.healerCreeps[0]])
                return trio
            }
            if (attackCreeps(trio)) {
                report.formatBasic("*", "test")
                return trio
            }
            let attacker: Creep = Game.creeps[trio.mainCreep]
            attacker.moveTo(new RoomPosition(25, 25, trio.room), { reusePath: 20 })
            if (attacker.room.name === trio.room) {
                trio.plan = createPlan(attacker, [STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_EXTENSION])
                trio.state = "attacking"
            }
            if (!Game.creeps[trio.mainCreep]) {
                trio.state = "retreating"
            }
        }
    }
    if (trio.state === "attacking") {
        if (Game.creeps[trio.mainCreep] === undefined) {
            return null
        }
        if (trio.isSkrimisher) {


            trio = healAttacker(trio)

            if (getTrueDistance(Game.creeps[trio.healerCreeps[0]].pos, Game.creeps[trio.mainCreep].pos) > 2 && Game.creeps[trio.healerCreeps[0]].room.name === Game.creeps[trio.mainCreep].room.name) {
                //Game.creeps[trio.mainCreep].moveTo(Game.creeps[trio.healerCreeps[0]])
                return trio
            }
            if (attackCreeps(trio, 50)) {
                report.formatBasic("*", "test")
                return trio
            }
            let attacker: Creep = Game.creeps[trio.mainCreep]
            attacker.moveTo(new RoomPosition(25, 25, trio.room), { reusePath: 20 })

            if (attacker.room.name === trio.room) {
                trio.state = "attacking"
            }
            if (!Game.creeps[trio.mainCreep]) {
                trio.state = "retreating"
            } else {
                if(!calc.canWinRoom(attacker.room)) {
                    if((attacker.room.controller??{level:0}).level>=3) {
                        simpleAllies.requestDefense({roomName:attacker.room.name,priority:0.7})
                    } else {
                        simpleAllies.requestDefense({roomName:attacker.room.name,priority:0.2})
                    }
                }
            }
        } else {
            trio = healAttacker(trio)

            if (getTrueDistance(Game.creeps[trio.healerCreeps[0]].pos, Game.creeps[trio.mainCreep].pos) > 2 && Game.creeps[trio.healerCreeps[0]].room.name === Game.creeps[trio.mainCreep].room.name) {
                //Game.creeps[trio.mainCreep].moveTo(Game.creeps[trio.healerCreeps[0]])
                return trio
            }
            if (attackCreeps(trio)) {
                return trio
            }
            if (trio.plan.length > 0) {
                trio = attackPlanned(trio)
            } else {
                //Game.creeps[trio.mainCreep].suicide();
                for (let h of trio.healerCreeps) {
                    let healer: Creep = Game.creeps[h];
                    //healer.suicide();
                }
                return null
            }
            if (!Game.creeps[trio.mainCreep]) {
                trio.state = "retreating"
            }
        }
    }
    if (trio.state === "creating") {
        for (let h of trio.healerCreeps) {
            let healer: Creep = Game.creeps[h];
            if (!healer) {
                trio.healerCreeps.splice(trio.healerCreeps.indexOf(h), 1)
                continue
            }
        }
        if (Game.creeps[trio.mainCreep] && trio.healerCreeps.length >= 1) {
            trio.state = "moving"
        }

    }
    if (trio.state === "retreating") {
        return null
    }

    return trio
}

function healAttacker(trio: trioMemory): trioMemory {
    let attacker: Creep = Game.creeps[trio.mainCreep]

    for (let h of trio.healerCreeps) {
        let healer: Creep = Game.creeps[h];
        if (!healer) {
            trio.healerCreeps.splice(trio.healerCreeps.indexOf(h), 1)
            trio.state = "retreating"
            continue
        }
        healer.moveTo(attacker)

        if (healer.hits < healer.hitsMax && attacker.hits > attacker.hitsMax * 0.50) {
            healer.heal(healer)
        } else if (attacker.hits <= attacker.hitsMax * 0.50) {
            if (healer.pos.inRangeTo(attacker, 3) && healer.heal(attacker) === ERR_NOT_IN_RANGE) {
                healer.rangedHeal(attacker)
            }
        } else {
            if (healer.pos.inRangeTo(attacker, 3) && healer.heal(attacker) === ERR_NOT_IN_RANGE) {
                healer.rangedHeal(attacker)
            }
        }
    }
    return trio
}
function attackCreeps(trio: trioMemory, range: number = 5): boolean {
    let attacker: Creep = Game.creeps[trio.mainCreep]
    if (trio.mainCreepType === "attack") {
        let enemyCreeps = attacker.pos.findInRange(FIND_HOSTILE_CREEPS, range, {
            filter: (a) => (a.getActiveBodyparts(ATTACK) > 0 || a.getActiveBodyparts(RANGED_ATTACK) > 0 || a.getActiveBodyparts(HEAL) > 0)
            &&Allies.indexOf(a.owner.username) === -1
        })

        if (enemyCreeps.length > 0) {
            let path = attacker.room.findPath(attacker.pos, enemyCreeps[0].pos)
            if (path[path.length - 1].x === enemyCreeps[0].pos.x && path[path.length - 1].y === enemyCreeps[0].pos.y) {
                if (attacker.attack(enemyCreeps[0])) {
                    attacker.moveTo(enemyCreeps[0])
                }
                return true
            }
        }
    }
    return false
}
function attackPlanned(trio: trioMemory): trioMemory {
    let attacker: Creep = Game.creeps[trio.mainCreep]
    if (trio.mainCreepType === "attack") {
        let struct: Structure = Game.getObjectById(trio.plan[0])
        if (struct) {
            if (attacker.attack(struct) !== OK) {
                attacker.moveTo(struct)
            }
        } else {
            trio.plan.shift()
        }
    }
    return trio
}
export function createPlan(start: Creep, importantStructures: StructureConstant[]): Id<Structure>[] {
    let attack = []
    let destroyed: { x: number, y: number }[] = []
    if (importantStructures.includes(STRUCTURE_TOWER) === false) {
        importantStructures.unshift(STRUCTURE_TOWER)
    }
    let fromPath = start.pos
    for (let struct of importantStructures) {
        let all = start.room.find(FIND_STRUCTURES, { filter: (a) => a.structureType === struct })
        for (let i of all) {
            let items = PathFinder.search(fromPath, { pos: i.pos, range: 1 }, {
                plainCost: 2,
                swampCost: 5,
                roomCallback: function (roomName) {

                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since
                    // PathFinder supports searches which span multiple rooms
                    // you should be careful!
                    let costs = new PathFinder.CostMatrix;
                    if (!room) return costs;
                    room.find(FIND_STRUCTURES).forEach(function (struct) {
                        if (struct.structureType === STRUCTURE_ROAD || destroyed.some((a) => a.x == struct.pos.x && a.y === struct.pos.y)) {
                            // Favor roads over plain tiles
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (
                            (struct.structureType === STRUCTURE_RAMPART &&
                                !struct.my)) {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 100);
                        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART ||
                                !struct.my)) {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });

                    // Avoid creeps in the room
                    room.find(FIND_HOSTILE_CREEPS).forEach(function (creep) {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });

                    return costs;
                },
            }).path
            for (let item of items) {
                Game.map.visual.circle(new RoomPosition(item.x, item.y, start.room.name))
                const look = start.room.lookAt(item.x, item.y);
                look.forEach(function (lookObject) {
                    if (lookObject.type == LOOK_STRUCTURES &&
                        //@ts-ignore
                        (lookObject[LOOK_STRUCTURES].structureType === STRUCTURE_WALL || lookObject[LOOK_STRUCTURES].structureType === STRUCTURE_RAMPART)) {
                        attack.push(lookObject.structure.id)
                        destroyed.push({ x: lookObject.structure.pos.x, y: lookObject.structure.pos.y })
                        Game.map.visual.circle(new RoomPosition(item.x, item.y, start.room.name), { stroke: "red" })
                    }
                });
            }
            //fromPath = new RoomPosition(items[items.length-1].x,items[items.length-1].y,start.room.name)
            Game.map.visual.circle(new RoomPosition(i.pos.x, i.pos.y, start.room.name), { stroke: "red" })
            attack.push(i.id)
        }
    }
    return attack
}
