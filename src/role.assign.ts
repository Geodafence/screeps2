

    /**
     *
     * @deprecated DON'T USE THIS
     */
    export function harvester(creepName:string) {
        //@ts-ignore
        Memory.harvesters.push(creepName);
    }

    /**
     *
     * @deprecated DON'T USE THIS
     */
    export function builder(creepName:string) {
        //@ts-ignore
        Memory.builders.push(creepName);
    }
    export function combat(creepName:string) {
        Memory.fighters.push(creepName);
    }
    export function miner(creepName:string) {
        Memory.storedcreeps.push(creepName);
    }
    export function hauler(creepName:string) {
        Memory.haulers.push(creepName);
    }
    export function newid() {
        var cur = Memory.assignedids
        Memory.assignedids += 1
        return cur.toString();
    }
