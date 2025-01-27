
import { _HasId, Id } from "../../typings/helpers";
import { Structure } from "../../typings/structure";

export function containsRequest(spawn: StructureSpawn, buildId: _HasId, type = null, amount = null) {
    let ret = false
    for (let I in spawn.memory.itemrequests) {
        let request = spawn.memory.itemrequests[I]
        let istrue = false
        if (request.id === buildId) {
            istrue = true
        }
        if (type) if (request.type === type) istrue = true; else istrue = false;
        if (amount) if (request.amount === amount) istrue = true; else istrue = false;
        if (istrue) ret = true
    }
    return ret
}
/**
 * @param {Creep} creep
**/
export function getrequest(creep: Creep) {
    if (creep.room.getMasterSpawn().memory.itemrequests === undefined) {
        creep.room.getMasterSpawn().memory.itemrequests = []
    }
    if (creep.room.getMasterSpawn().memory.itemrequests.length > 0) {
        if (creep.memory.fufilling === undefined) {
            creep.memory.fufilling = creep.room.getMasterSpawn().memory.itemrequests.pop()
        }

        //@ts-ignore
        if ((creep.memory.type === "grab" && Game.getObjectById(creep.memory.fufilling.storage).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount) || (creep.memory.type === "take" && Game.getObjectById(creep.memory.fufilling.id).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount)) {
            creep.room.getMasterSpawn().memory.itemrequests.push(creep.memory.fufilling)
            creep.memory.fufilling = undefined
        }
    }
}
/**
 * @param {Creep} creep
**/
export function fufillrequest(creep: Creep) {
    if (creep.memory.fufilling !== undefined) {

        if (Game.getObjectById(creep.memory.fufilling.id)) {

        } else {
            creep.memory.fufilling = undefined
            return
        }
        if (creep.memory.fufilling.type === "grab") {
            //@ts-ignore
            if (Game.getObjectById(creep.memory.fufilling.storage).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount) {
                creep.memory.fufilling = undefined
                return
            }
            if (creep.store[RESOURCE_ENERGY] > 0 && creep.memory.fufilling.request !== RESOURCE_ENERGY) {
                creep.drop(RESOURCE_ENERGY, creep.store[RESOURCE_ENERGY])
            }
            if (creep.store[creep.memory.fufilling.request] < creep.store.getCapacity()) {
                if (creep.memory.fufillStatus == "giving") {
                    creep.memory.fufilling.amount -= creep.store.getCapacity()
                }
                creep.memory.fufillStatus = "grabbing"
                //@ts-ignore
                if (creep.withdraw(Game.getObjectById(creep.memory.fufilling.storage), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                    //@ts-ignore
                    creep.moveTo(Game.getObjectById(creep.memory.fufilling.storage))
                }
            } else {
                if (creep.memory.fufillStatus == "grabbing") {
                    creep.memory.fufillStatus = "giving"
                }
                if (creep.transfer(Game.getObjectById(creep.memory.fufilling.id), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                    //@ts-ignore
                    creep.moveTo(Game.getObjectById(creep.memory.fufilling.id))
                }
            }
            if (creep.memory.fufilling.amount <= 0) {
                creep.memory.fufilling = undefined
            }
        }
        if (creep.memory.fufilling !== undefined&&creep.memory.fufilling.type === "take") {
            //@ts-ignore
            if (Game.getObjectById(creep.memory.fufilling.id).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount) {
                creep.memory.fufilling = undefined
                return
            }
            if (creep.store[creep.memory.fufilling.request] < creep.store.getCapacity() && creep.store[creep.memory.fufilling.request] < creep.memory.fufilling.amount) {
                if (creep.memory.fufillStatus == "giving") {
                    creep.memory.fufilling.amount -= creep.store.getCapacity()
                }
                creep.memory.fufillStatus = "grabbing"
                //@ts-ignore
                if (creep.withdraw(Game.getObjectById(creep.memory.fufilling.id), creep.memory.fufilling.request) !== OK) {
                    //@ts-ignore
                    creep.moveTo(Game.getObjectById(creep.memory.fufilling.id))
                }
            } else {
                if (creep.memory.fufillStatus == "grabbing") {
                    creep.memory.fufillStatus = "giving"
                }
                if (creep.transfer(Game.getObjectById(creep.memory.fufilling.storage), creep.memory.fufilling.request) !== OK) {
                    //@ts-ignore
                    creep.moveTo(Game.getObjectById(creep.memory.fufilling.storage))
                }
            }
            if (creep.memory.fufilling.amount <= 0) {
                creep.memory.fufilling = undefined
            }
        }
    } else {
        if (creep.store[RESOURCE_OXYGEN] > 0) {
            creep.drop(RESOURCE_OXYGEN)
        }
    }

}
/**
 * Creates a request fufilled by the queens of the room's main spawn
 * @param {Structure} building Building to deliver/remove
 * @param {Number} am amount of item to request
 * @param {String} type type of item to request
 * @param {String} reqtype type of request, "grab" (bring to) or "take" (remove)
 */
export function sendrequest(building: Structure, am: number, type: ResourceConstant, reqtype = "grab") {
    building.room.getMasterSpawn().memory.itemrequests.splice(0, 0, {
        request: type,
        type: reqtype,
        amount: am,
        id: building.id,
        //@ts-ignore
        storage: building.room.storage.id
    })
}
export function removerequests(building: Structure) {
    for (let I in building.room.getMasterSpawn().memory.itemrequests) {
        let info = building.room.getMasterSpawn().memory.itemrequests[I]
        if (info.id === building.id) {
            //@ts-ignore
            building.room.getMasterSpawn().memory.itemrequests.splice(I, 1)
            break
        }
    }
}
