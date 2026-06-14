export function InternalGetBodyCost(spawn: StructureSpawn): number {
    if (spawn.room.memory.flags.restartRoom)
        return 300;
    return Math.floor(spawn.room.energyCapacityAvailable / 50) * 50;
}
export function InternalCalcBodySize(spawn: StructureSpawn, bodydict: { [num: number]: BodyPartConstant[]; }): BodyPartConstant[] {
    let size = Math.floor(spawn.room.energyCapacityAvailable / 50) * 50;
    if (spawn.room.memory.flags.restartRoom) size = 300;

    let biggest: BodyPartConstant[] = [];
    for (let I in bodydict) {
        //@ts-ignore
        if (size >= I) {
            biggest = bodydict[I];
        }
    }
    return biggest;
}
export function getUsableSpawns(room:Room) {
    let spawns = room.find(FIND_MY_SPAWNS).filter((a)=>!a.spawning);
    return spawns[0] || room.find(FIND_MY_SPAWNS)[0];
}
