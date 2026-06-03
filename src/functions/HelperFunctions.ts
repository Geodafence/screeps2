export function InternalGetBodyCost(spawn: StructureSpawn): number {
    return Math.floor(spawn.room.energyCapacityAvailable / 50) * 50;
}
export function InternalCalcBodySize(spawn: StructureSpawn, bodydict: { [num: number]: BodyPartConstant[]; }): BodyPartConstant[] {
    let size = Math.floor(spawn.room.energyCapacityAvailable / 50) * 50;
    let biggest: BodyPartConstant[] = [];
    for (let I in bodydict) {
        //@ts-ignore
        if (size >= I) {
            biggest = bodydict[I];
        }
    }
    return biggest;
}
