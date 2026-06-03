import { planConstructor } from "Taskmaster/planConstructor"
import {
    CreateSpawnBuilderPlan,
    CreateSpawnHarvesterPlan,
    CreateSpawnHaulerPlan,
    CreateSpawnRemoteHaulerPlan,
    CreateSpawnRemotePlan,
    CreateSpawnScoutPlan,
    CreateSpawnUpgraderPlan
} from "Taskmaster/plans";

export const creepLimits: {
    [limtName: string]: number;
    harvesters: number;
    haulers: number;
    upgraders: number;
    builders: number;
    scouts: number;
    remoteminers: number;
    remotehaulers: number;
} = {
    harvesters: 2,
    haulers: 4,
    upgraders: 3,
    builders: 2,
    scouts: 3,
    remoteminers: 2,
    remotehaulers: 4
};
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
        planFunction: CreateSpawnBuilderPlan,
        planSkipCondition: (room: Room) => {
            return room.find(FIND_CONSTRUCTION_SITES).length === 0;
        },
        planName: "SpawnBuilder",
        pointer: "builders"
    },
    {
        planFunction: CreateSpawnUpgraderPlan,
        planName: "SpawnUpgrader",
        pointer: "upgraders"
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
