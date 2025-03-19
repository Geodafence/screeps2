import { Id } from "../../typings/helpers"
import { StructureRampart, StructureWall } from "../../typings/structure"
import { Allies } from "../libs/allyLibs/allyConsts"

export function tick(creep: Creep) {
    let hostiles = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: function (creep: Creep) {
            return Allies.indexOf(creep.owner.username) === -1
        }
    })
    hostiles.sort(() => Math.random() - Math.random())
    if (hostiles.length === 0) {
        creep.suicide()
    }

    if (creep.memory.state === undefined) {
        creep.memory.state = "mining"
    }


    if (creep.memory.targetStructure === undefined) {
        let setRampart: Id<StructureRampart> | Id<StructureWall> | undefined = undefined
        let hp: number = 99999999999999
        for (let hostile of hostiles) {
            let ramparts = hostile.pos.findInRange(FIND_STRUCTURES, 6, { filter: (a) => a.structureType === STRUCTURE_RAMPART || a.structureType === STRUCTURE_WALL })
            for (let rampart of ramparts) {
                if (rampart.hits < hp) {
                    setRampart = rampart.id
                    hp = rampart.hits
                }
            }
        }
        if (setRampart !== undefined) {
            creep.memory.targetStructure = setRampart
        }
    } else {
        if (creep.memory.state === "mining") {
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY)===0) {
                creep.memory.state = "repairing"
            }
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0)
                }
            });
            if (targets.length > 0) {
                let trytest = creep.withdraw(targets[0], RESOURCE_ENERGY)
                if (trytest == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { reusePath: 10 })
                }
            } else {
                let targets = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (res) => {
                        return res.resourceType === RESOURCE_ENERGY
                    }
                });
                if (targets) {
                    let trytest = creep.pickup(targets)
                    if (trytest == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets, { reusePath: 10 })
                    }
                } else {
                    creep.say("room dry!",true)
                }
            }
        } else {
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY)===0) {
                creep.memory.state = "mining"
            }
            //@ts-ignore
            let struct:StructureRampart|StructureWall = Game.getObjectById(creep.memory.targetStructure)
            if(struct.prototype.structureType === STRUCTURE_RAMPART) {
                if(creep.pos!==struct.pos) {
                    creep.moveTo(struct)
                    creep.repair(struct)
                }
            }
        }
    }
}
