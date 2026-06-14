import { planConstructor } from "Taskmaster/planConstructor"
import {
    CreateSpawnBuilderPlan, CreateSpawnDefenderPlan,
    CreateSpawnHarvesterPlan,
    CreateSpawnHaulerPlan, CreateSpawnQueenPlan,
    CreateSpawnRemoteHaulerPlan,
    CreateSpawnRemotePlan,
    CreateSpawnScoutPlan,
    CreateSpawnUpgraderPlan
} from "Taskmaster/plans";

export const creepLimits: {
    [limtName: string]: { [RCL: string]: number; default: number };
    harvesters: { [RCL: string]: number; default: number };
    haulers: { [RCL: string]: number; default: number };
    upgraders: { [RCL: string]: number; default: number };
    builders: { [RCL: string]: number; default: number };
    scouts: { [RCL: string]: number; default: number };
    remoteminers: { [RCL: string]: number; default: number };
    remotehaulers: { [RCL: string]: number; default: number };
} = {
    harvesters: { default: 2 },
    haulers: { default: 4, 1: 4, 2: 4, 5: 2 },
    upgraders: { default: 3, 2: 7, 3: 10, 4: 3 },
    builders: { default: 2 },
    scouts: { default: 3 },
    remoteminers: { default: 5, 1: 2, 2: 5, 3: 4, 4: 5},
    remotehaulers: { default: 10, 1: 4, 2: 15, 3: 12, 4: 10 },
    queens: { default: 2 },
    defenders: { default: 2 },
};
export function getCreepLimit(room: Room, pointer: string): number {
    //@ts-ignore
    global.getCreepLimit = getCreepLimit;
    return creepLimits[String(pointer)][room.controller?.level || "default"] || creepLimits[String(pointer)].default;
}

export interface creationOrder {
    planFunction: (room:Room) => planConstructor,
    planSkipCondition?: (room:Room) => boolean,
    planName: string,
    pointer: string
}
export const buildOrder: creationOrder[] = [
    {
        planFunction: CreateSpawnHarvesterPlan,
        planName: "SpawnHarvester",
        pointer: "harvesters"
    },
    {
        planFunction: CreateSpawnHaulerPlan,
        planName: "SpawnHauler",
        pointer: "haulers"
    },
    {
        planFunction: CreateSpawnDefenderPlan,
        planSkipCondition: (room: Room) => {
            return !room.memory.flags.threatened;
        },
        planName: "SpawnDefender",
        pointer: "defenders"
    },
    {
        planFunction: CreateSpawnRemotePlan,
        planName: "SpawnRemote",
        pointer: "remoteminers"
    },
    {
        planFunction: CreateSpawnRemoteHaulerPlan,
        planName: "SpawnRemoteHauler",
        pointer: "remotehaulers"
    },
    {
        planFunction: CreateSpawnQueenPlan,
        planSkipCondition: (room: Room) => {
            return room.find(FIND_STRUCTURES, { filter: (x) => x.structureType === STRUCTURE_STORAGE }).length === 0;
        },
        planName: "SpawnQueen",
        pointer: "queens"
    },
    {
        planFunction: CreateSpawnBuilderPlan,
        planSkipCondition: (room: Room) => {
            return room.find(FIND_CONSTRUCTION_SITES).length === 0;
        },
        planName: "SpawnBuilder",
        pointer: "builders"
    },
    {
        planFunction: CreateSpawnUpgraderPlan,
        planSkipCondition: (room: Room) => {
            return room.find(FIND_CONSTRUCTION_SITES).length > 0;
        },
        planName: "SpawnUpgrader",
        pointer: "upgraders"
    },

    {
        //@ts-expect-error
        planFunction: null,
        planName: "null",
        pointer: "null"
    }
];

export const globalBuildOrder:creationOrder[] = [
    {
        planFunction: CreateSpawnScoutPlan,
        planName: "SpawnScout",
        pointer: "scouts",
    },
    {
        //@ts-expect-error
        planFunction: null,
        planName: "null",
        pointer: "null",
    }
]
