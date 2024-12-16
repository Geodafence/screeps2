
function getmasterspawn(creep) {
    return creep.room.find(FIND_MY_SPAWNS)[0]
}
    export function containsRequest(spawn,buildId,type=null,amount=null) {
        let ret = false
        for(let I in spawn.memory.itemrequests) {
            let request = spawn.memory.itemrequests[I]
            let istrue = false

        }
        return ret
    }
    /**
     * @param {Creep} creep
    **/
    export function getrequest(creep) {
        if(getmasterspawn(creep).memory.itemrequests===undefined) {
            getmasterspawn(creep).memory.itemrequests = []
        }
        if (getmasterspawn(creep).memory.itemrequests.length > 0) {
            if (creep.memory.fufilling === undefined) {
                creep.memory.fufilling = getmasterspawn(creep).memory.itemrequests.pop()
            }

            if ((creep.memory.type==="grab"&&Game.getObjectById(creep.memory.fufilling.storage).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount)||(creep.memory.type==="take"&&Game.getObjectById(creep.memory.fufilling.id).store[creep.memory.fufilling.request] < creep.memory.fufilling.amount)) {
                getmasterspawn(creep).memory.itemrequests.push(creep.memory.fufilling)
                creep.memory.fufilling = undefined
            }
        }
    }
    /**
     * @param {Creep} creep
    **/
    export function fufillrequest (creep) {
            if (creep.memory.fufilling !== undefined) {

                if(Game.getObjectById(creep.memory.fufilling.id)) {

                } else {
                    creep.memory.fufilling===undefined
                    console.log("Invalid request, removing")
                }
                if(creep.memory.fufilling.type==="grab") {
                    if(Game.getObjectById(creep.memory.fufilling.storage).store[creep.memory.fufilling.request] <creep.memory.fufilling.amount)  {
                        creep.memory.fufilling = undefined
                    }
                if(creep.store[RESOURCE_ENERGY]>0&&creep.memory.fufilling.request!==RESOURCE_ENERGY) {
                    creep.drop(RESOURCE_ENERGY,creep.store[RESOURCE_ENERGY])
                }
                if (creep.store[creep.memory.fufilling.request] < creep.store.getCapacity()) {
                    if (creep.memory.fufillStatus == "giving") {
                        creep.memory.fufilling.amount -= creep.store.getCapacity()
                    }
                    creep.memory.fufillStatus = "grabbing"
                    if (creep.withdraw(Game.getObjectById(creep.memory.fufilling.storage), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.fufilling.storage))
                    }
                } else {
                    if (creep.memory.fufillStatus == "grabbing") {
                        creep.memory.fufillStatus = "giving"
                    }
                    if (creep.transfer(Game.getObjectById(creep.memory.fufilling.id), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.fufilling.id))
                    }
                }
                if (creep.memory.fufilling.amount <= 0) {
                    creep.memory.fufilling = undefined
                }
            }
            if(creep.memory.fufilling.type==="take") {
                if(Game.getObjectById(creep.memory.fufilling.id).store[creep.memory.fufilling.request] <creep.memory.fufilling.amount)  {
                    creep.memory.fufilling = undefined
                }
                    if (creep.store[creep.memory.fufilling.request] < creep.store.getCapacity()&&creep.store[creep.memory.fufilling.request]<creep.memory.fufilling.amount) {
                        if (creep.memory.fufillStatus == "giving") {
                            creep.memory.fufilling.amount -= creep.store.getCapacity()
                        }
                        creep.memory.fufillStatus = "grabbing"
                        if (creep.withdraw(Game.getObjectById(creep.memory.fufilling.id), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(Game.getObjectById(creep.memory.fufilling.id))
                        }
                    } else {
                        if (creep.memory.fufillStatus == "grabbing") {
                            creep.memory.fufillStatus = "giving"
                        }
                        if (creep.transfer(Game.getObjectById(creep.memory.fufilling.storage), creep.memory.fufilling.request) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(Game.getObjectById(creep.memory.fufilling.storage))
                        }
                    }
                    if (creep.memory.fufilling.amount <= 0) {
                        creep.memory.fufilling = undefined
                    }
            }
        } else {
            if(creep.store[RESOURCE_OXYGEN]>0) {
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
    export function sendrequest (building, am, type,reqtype="grab") {
        getmasterspawn(building).memory.itemrequests.splice(0, 0, {
            request: type,
            type:reqtype,
            amount: am,
            id: building.id,
            storage: building.room.find(FIND_STRUCTURES, {
                filter: function (build) {
                    return build.structureType === STRUCTURE_STORAGE
                }
            })[0].id
        })
    }
    export function removerequests(building) {
        for(let I in getmasterspawn(building).memory.itemrequests) {
            console.log("master spawn: "+getmasterspawn(building))
            let info = getmasterspawn(building).memory.itemrequests[I]
            if(info.id===building.id) {
                getmasterspawn(building).memory.itemrequests.splice(I,1)
            }
        }
    }
