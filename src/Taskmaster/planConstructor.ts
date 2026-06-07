import { Taskmaster } from "./main";
import { findAndHarvestTask, HarvesterGoToSpawnTask, task } from "./taskdefs";



export interface planConstructor {
  /*Name of plan **/
  type: string;
  /* The optional id of the plan. This exists soely to use with ContainsPlan

  For best practice, this should never be defined in the plan function**/
  id?: string;
  /*Priority of plan**/
  priority: number;
  /*Optional room name of plan **/
  roomName?: string;
  /** A condition to cancel the task. Add the function to ConditionMap and add its name here. */
  cancelCondition?: string;
  /** Requirements to start plan */
  requirements: boolean | ((...args: any[]) => boolean);
  /** Allocation of creeps/structures */
  allocated: Id<AnyCreep>[]|Id<Structure>[]|string[];
  /** Target, can be anything.
   *
   * Add a custom type overriding targetId if you want specific info for tasks.
  */
  targetId: (() => any) | any;
  /** Forced cpu use, otherwise avges out the last 5 cpu usages of the plan */
  forceCPU?: number;
  /** Task tree deciding what to do */
  taskTree: taskTree;
}
export interface taskTree {
  [taskName: string]: taskBranch;
}
export interface taskBranch {
  info: task;
  children?: taskTree
}
export interface Plan {
  tasklist: taskBranch[];
  curTaskName: string;
  roomName?: string;
  cancelCondition?: string;
  fullPlan: planConstructor
  activeTask: number;
}

//Example Tasks
export interface GoHarvestConstructor extends planConstructor {
  targetId: Id<Source>;
}

export interface SpawnCreepConstructor extends planConstructor {
  allocated: Id<StructureSpawn>[]
  targetId: Id<StructureSpawn>
}

export interface GoUpgradeConstructor extends planConstructor {
  targetId: {spawn:Id<StructureSpawn>,source:Id<Source>};
}

export interface GoHaulConstructor extends planConstructor {
  targetId: Id<Resource>;
}

export interface GoScoutConstructor extends planConstructor {
  allocated: Id<Creep>[];
}

export interface GoRemoteMineConstructor extends planConstructor {
  allocated: Id<Creep>[];
  /* The room of the remote miner. **/
  targetId: string
}
export interface FindUpdateRemotesConstructor extends planConstructor {
    allocated: string[];
}
export interface TowerConstructor extends planConstructor {
    allocated: Id<StructureTower>[];
}
