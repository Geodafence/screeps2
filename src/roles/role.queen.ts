import { fufillrequest, getrequest } from "../libs/item-request-lib"
import { getTrueDistance } from "../libs/general.functions"
import { report } from "../libs/roomReporting"
import { Allies } from "../libs/allyLibs/allyConsts"
import { AnyStoreStructure, AnyStructure, Structure, StructureLink, StructureStorage } from "../../typings/structure"
/**
 *
 * @param {StructureSpawn} masterSpawn
 * @returns {StructureLink}
 */
function getMasterLink(masterSpawn: StructureSpawn) {
    let links: StructureLink[] = masterSpawn.room.find(FIND_MY_STRUCTURES, {
        filter: function (structure: Structure) {
            return structure.structureType === STRUCTURE_LINK
        }
    })
    let link: StructureLink | undefined
    link = undefined
    let range = 999999
    for (let I in links) {
        if (getTrueDistance(links[I].pos, masterSpawn.pos) < range) {
            range = getTrueDistance(links[I].pos, masterSpawn.pos)
            link = links[I]
        }
    }
    return link

}
/**
 *
 * @param {Creep} creep
 * @param {*} queenType
 */
export function tick(creep: Creep, queenType: string) {
    if (creep.store[RESOURCE_ENERGY] == creep.store.getCapacity() && creep.memory.fufilling === undefined) {
        creep.memory.state = "moving"
    }
    if (creep.store[RESOURCE_ENERGY] == 0 || creep.memory.state === undefined) {
        creep.memory.state = "grabbing"
    }
    if (creep.memory.state == "grabbing") {
        try {
            fufillrequest(creep)
        } catch (e) { }
    }
    if (creep.memory.fufilling === undefined || creep.memory.state == "moving") {
        if (creep.memory.state == "grabbing" && creep.memory.spawnid !== undefined) {
            //@ts-ignore
            let target: Resource[] | AnyStoreStructure[]
                = Game.getObjectById(creep.memory.spawnid).room.find(FIND_MY_STRUCTURES, {
                    //@ts-ignore
                    filter: (structure: AnyStoreStructure) => {
                        return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > creep.store.getCapacity(RESOURCE_ENERGY))
                    }
                })

            if (target.length === 0) {
                target = Game.getObjectById(creep.memory.spawnid).room.find(FIND_DROPPED_RESOURCES, {
                    filter: (res) => {
                        return (res.resourceType === RESOURCE_ENERGY)
                    }
                }).sort((a, b) =>
                    (new RoomPosition(a.pos.x, a.pos.y, creep.room.name).getRangeTo(creep) -
                    new RoomPosition(b.pos.x, b.pos.y, creep.room.name).getRangeTo(creep)
                ));

            }

            if (target.length>0) {
                let amog = getMasterLink(creep.room.getMasterSpawn())
                if (amog) {
                    let grab = creep.store.getCapacity()
                    if (creep.store.getCapacity() > 750) {
                        grab = 750
                    }
                    if (amog.store[RESOURCE_ENERGY] >= grab) {
                        target = [amog] //yo future geo don't remove the [], it needs to be a array
                    }
                }
                let target2: Resource | AnyStoreStructure = target[0]
                //@ts-ignore
                if (target2.resourceType !== undefined) {
                    //@ts-ignore
                    if (creep.pickup(target2) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target2, { reusePath: 20 })
                    }
                } else {
                    //@ts-ignore
                    if (creep.withdraw(target2, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target2, { reusePath: 20 })
                    }
                    //@ts-ignore
                    if (creep.withdraw(target2, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES) {
                        getrequest(creep)
                    }
                }
            }
        } else {
            let target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            })
            let towers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500;
                }
            })
            if ((creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < 2000 && object.structureType === STRUCTURE_RAMPART
            }).length > 0||towers.length>0) && creep.memory.spawnid !== undefined) {
                //@ts-ignore
                report.formatBasic(creep.room.name, "emergancy rampart repair online for " + Game.getObjectById(creep.memory.spawnid).name)
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                })
            }
            if (target) {
            } else {
                target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||
                            (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400&&(creep.room.storage??{store:{"energy":0}}).store[RESOURCE_ENERGY]>100000)) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }
                })
                if (!target) {
                    getrequest(creep)
                    try {
                        fufillrequest(creep)
                    } catch (e) {
                        report.formatBasic(creep.room.name, "Error: " + e)
                    }
                }

            }
            let check = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: function (creep) {
                    return Allies.indexOf(creep.owner.username) === -1
                }
            });
            if (check.length > 0) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500;
                    }
                })
            }
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) !== OK) {
                    creep.moveTo(target, { reusePath: 10 })
                }
            }
        }
    }
}
