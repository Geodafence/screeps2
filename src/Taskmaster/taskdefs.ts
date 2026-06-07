import { GoHarvestConstructor, GoUpgradeConstructor, planConstructor } from "./planConstructor";
import { nulltask, removeCreepFromList, reverseRoomAndPlanId } from "Taskmaster/tasks/general/MiscTasks";
import { depositToSpawn, dropItems } from "Taskmaster/tasks/general/DepositAndRemoveEnergy";
import { GoUpgradeController, buildContainer, buildBuilding } from "Taskmaster/tasks/general/BuildAndUpgrade";
import {
    SpawnHarvester,
    SpawnHauler,
    SpawnUpgrader,
    SpawnBuilder,
    SpawnScout,
    SpawnRemote,
    SpawnRemoteHauler
} from "Taskmaster/tasks/general/SpawnCreep";
import {
    findAndHarvest,
    GrabFromDroppedResource,
    GrabFromSpawn,
    HaulerGrabFromDroppedResource
} from "Taskmaster/tasks/general/FindAndGetEnergy";
import { MoveToRoom, ScoutRoom } from "./tasks/general/Travelling";
import { FindAndUpdateRemotes, GoMineAndDrop } from "./tasks/remoteSpecific/MineAndDrop";
import { runTowerForever } from "./tasks/buildings/Tower";

export interface taskReturn {
    /**
     * The current status of the task
     *
     * Will most likely be removed
    */
    status?: any;
    suceeded:boolean
    /**
     * An array of allocated items, overrides the current "allocated" array.
     */
    updatedItems?: Id<AnyCreep>[]|Id<Structure>[];
}

export interface task {

    /** Name of task */
    name: string;
    /** Cost of task, used to decide which task path to go down */
    cost: number;
    //Id<AnyCreep>|Id<Structure>
    /** Condition to start the task.
     *
    Considers the plan completed if the task has no childern or all childern are impossible to reach. */
    condition: string|boolean;

}





function findAndHarvestFunction(usedItems:Id<AnyCreep>[],planState:GoHarvestConstructor) {
    return usedItems.filter(a=>{
        let creep = Game.getObjectById(a)
        if(creep===null) return false
        return creep.store.getFreeCapacity()!==0
    }).length===usedItems.length
}

function MoveToRoomCondition(usedItems:Id<AnyCreep>[],planState:planConstructor) {
    const targetRoom = typeof planState.targetId === 'string' ? planState.targetId : String(planState.targetId)
    console.log("Creeps: "+usedItems)
    return usedItems.some(a=>{
        let creep = Game.getObjectById(a)
        if(creep===null) {console.log("Creepnoexist :(");return false}
        console.log("Is creep in room? " + creep.room?.name !== targetRoom)
        return creep.room?.name !== targetRoom
    })
}
function GoUpgradeFunction(usedItems:Id<AnyCreep>[],planState:GoHarvestConstructor) {
    return true
}
function GrabFromSpawnFunction(usedItems:Id<Creep>[],planState:GoUpgradeConstructor) {

    let uno = usedItems.filter(a=>{
        let creep = Game.getObjectById(a)
        if(creep===null) return false
        return true
    }).length===usedItems.length
    let dos = Game.getObjectById(planState.targetId.spawn)
    let tres = Game.getObjectById(usedItems[0]).room.find(FIND_STRUCTURES,{filter:(a)=>a.structureType===STRUCTURE_CONTAINER})[0]
    if(dos===null) {
        return false;
    }
    return ((dos&&dos.store[RESOURCE_ENERGY]>200)||(tres))&&uno
}
function ContainerNotExistsCondition(usedItems:Id<Creep>[],planState:planConstructor) {
    return Game.getObjectById(usedItems[0]).room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType===STRUCTURE_CONTAINER}).length===0
}
function HarvesterGoToSpawnCondition(usedItems:Id<Creep>[],planState:planConstructor) {

    return usedItems.filter(a=>{
        let creep = Game.getObjectById(a)
        if(creep===null) return false
        return creep.store.getFreeCapacity()===0
    }).length===usedItems.length&&Game.getObjectById(usedItems[0]).room.memory.creeps.haulers.all.length===0
}
function GoToSpawnCondition(usedItems:Id<Creep>[],planState:planConstructor) {

    return usedItems.filter(a=>{
        let creep = Game.getObjectById(a)
        if(creep===null) return false
        return creep.store.getFreeCapacity()===0
    }).length===usedItems.length
}
function DropItemsCondition(usedItems:Id<Creep>[],planState:planConstructor) {
    return usedItems.filter(a=>{
        let creep = Game.getObjectById(a)
        if(creep===null) return false
        return creep.store.getFreeCapacity()===0
    }).length===usedItems.length&&Game.getObjectById(usedItems[0]).room.memory.creeps.haulers.all.length>0
}
function AlwaysTrueCondition(usedItems:Id<Creep>[],planState:planConstructor) {
    return true
}
export const TaskMap: {
    [funcname: string]: (allocatedItems: any[], planState: any) => taskReturn | boolean;
} = {
    findAndHarvest: findAndHarvest,
    SpawnBuilder: SpawnBuilder,
    SpawnScout: SpawnScout,
    buildBuilding: buildBuilding,
    GrabFromDroppedResource: HaulerGrabFromDroppedResource,
    GlobalGrabFromDroppedResource: GrabFromDroppedResource,
    reverseRoomAndPlanId: reverseRoomAndPlanId,
    GrabFromSpawn: GrabFromSpawn,
    goToSpawn: depositToSpawn,
    SpawnHarvester: SpawnHarvester,
    dropItems: dropItems,
    SpawnUpgrader: SpawnUpgrader,
    SpawnHauler: SpawnHauler,
    SpawnRemoteHauler: SpawnRemoteHauler,
    nulltask: nulltask,
    GoUpgradeController: GoUpgradeController,
    ScoutRoom: ScoutRoom,
    buildContainer: buildContainer,
    MoveToRoom: MoveToRoom,
    MoveToRoomCondition: MoveToRoomCondition,
    DropItemsCondition: DropItemsCondition,
    AlwaysTrueCondition: AlwaysTrueCondition,
    findAndHarvestFunction: findAndHarvestFunction,
    HarvesterGoToSpawnCondition: HarvesterGoToSpawnCondition,
    GoToSpawnCondition: GoToSpawnCondition,
    GrabFromSpawnFunction: GrabFromSpawnFunction,
    GoUpgradeFunction: GoUpgradeFunction,
    removeCreepFromList: removeCreepFromList,
    ContainerNotExistsCondition: ContainerNotExistsCondition,
    GoMineAndDrop: GoMineAndDrop,
    SpawnRemoteFunction: SpawnRemote,
    FindAndUpdateRemotes: FindAndUpdateRemotes,
    runTowerForever: runTowerForever
};
// Examples
interface CreepTaskConstructor extends task {
    condition: boolean|string;
}
export const findAndHarvestTask: CreepTaskConstructor = {

    condition: "findAndHarvestFunction",

    name: "findAndHarvest",

    cost: 5,

}
export const GoBuildTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "buildBuilding",

    cost: 3,

}
export const GoUpgradeTask: CreepTaskConstructor = {

    condition: "GoUpgradeFunction",

    name: "GoUpgradeController",

    cost: 3,

}
export const RemoveFromClosedListTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "removeCreepFromList",

    cost: 100,
}

export const SpawnUpgraderTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "SpawnUpgrader",

    cost: 1,

}
export const SpawnScoutTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "SpawnScout",

    cost: 1,

}
export const SpawnBuilderTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "SpawnBuilder",

    cost: 1,

}
export const SpawnHarvesterTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "SpawnHarvester",

    cost: 1,

}
export const SpawnHaulerTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "SpawnHauler",

    cost: 1,

}
export const GrabFromSpawnTask: CreepTaskConstructor = {

    condition: "GrabFromSpawnFunction",

    name: "GrabFromSpawn",

    cost: 1,

}
export const GoToSpawnTask: CreepTaskConstructor = {

    condition: "GoToSpawnCondition",

    name: "goToSpawn",

    cost: 4,
}
export const HarvesterGoToSpawnTask: CreepTaskConstructor = {
    condition: "HarvesterGoToSpawnCondition",

    name: "goToSpawn",

    cost: 4
};
export const GrabFromDroppedResourceTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "GrabFromDroppedResource",

    cost: 2
};

export const RemoteGrabFromDroppedResourceTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "GlobalGrabFromDroppedResource",

    cost: 2,
}
export const dropItemsTask: CreepTaskConstructor = {

    condition: "DropItemsCondition",

    name: "dropItems",

    cost: 3,
}
export const buildContainerTask: CreepTaskConstructor = {

    condition: "ContainerNotExistsCondition",

    name: "buildContainer",

    cost: 1,
}
export const GoScoutTask: CreepTaskConstructor = {

    condition: "AlwaysTrueCondition",

    name: "ScoutRoom",

    cost: 1,

}
export const MoveToRoomTask: CreepTaskConstructor = {

    condition: "MoveToRoomCondition",

    name: "MoveToRoom",

    cost: 1,

}
export const GoMineAndDropTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "GoMineAndDrop",

    cost: 3
};
export const SpawnRemoteTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "SpawnRemoteFunction",

    cost: 3
};
export const FindAndUpdateRemotesTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "FindAndUpdateRemotes",

    cost: 3
};
export const reverseRoomAndPlanIdTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "reverseRoomAndPlanId",

    cost: 1
};
export const SpawnRemoteHaulerTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "SpawnRemoteHauler",

    cost: 3
};
export const runTowerForeverTask: CreepTaskConstructor = {
    condition: "AlwaysTrueCondition",

    name: "runTowerForever",

    cost: 1
}
