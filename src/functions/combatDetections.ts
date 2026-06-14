export function detectDanger(creep: Creep) {
    let enemyCreeps: (Creep)[] = creep.room.find(FIND_HOSTILE_CREEPS)
    let enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
    if (enemyCreeps.length > 0 || enemyStructures.length > 0) {
        if (areCreepsDangerous(enemyCreeps) || enemyStructures.length > 0) {
            Memory.global.defenseRequests[creep.room.name] = Memory.global.defenseRequests[creep.room.name] || {
                reportCount: 1,
                creepsAllocated: [],
                lastReported: Game.time
            };
            Memory.global.defenseRequests[creep.room.name].reportCount += 1;
            Memory.global.defenseRequests[creep.room.name].lastReported = Game.time;
        }
    }
}

export function areCreepsDangerous(creeps: Creep[]) {
    for(let creep of creeps) {
        let parts = creep.body.map((a)=>a.type)
        if(parts.includes(ATTACK)||parts.includes(RANGED_ATTACK)||parts.includes(HEAL)) {
            return true;
        }
    }
    return false;
}
