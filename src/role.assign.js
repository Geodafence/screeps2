
    export function harvester(creepName) {
        Memory.harvesters.push(creepName);
    }
    export function builder(creepName) {
        Memory.builders.push(creepName);
    }
    export function combat(creepName) {
        Memory.fighters.push(creepName);
    }
    export function miner(creepName) {
        Memory.storedcreeps.push(creepName);
    }
    export function hauler(creepName) {
        Memory.haulers.push(creepName);
    }
    export function newid() {
        var cur = Memory.assignedids
        Memory.assignedids += 1
        return cur.toString();
    }
