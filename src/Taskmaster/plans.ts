import { creepLimits, getCreepLimit } from "consts/EcoConsts"
import { FindUpdateRemotesConstructor, GoHarvestConstructor, GoHaulConstructor, GoRemoteMineConstructor, GoScoutConstructor, GoUpgradeConstructor, planConstructor, SpawnCreepConstructor } from "./planConstructor"
import {
    dropItemsTask,
    findAndHarvestTask,
    HarvesterGoToSpawnTask,
    GoUpgradeTask,
    GrabFromDroppedResourceTask,
    GrabFromSpawnTask,
    RemoveFromClosedListTask,
    SpawnHarvesterTask,
    SpawnHaulerTask,
    GoToSpawnTask,
    SpawnUpgraderTask,
    buildContainerTask,
    SpawnBuilderTask,
    GoBuildTask,
    SpawnScoutTask,
    GoScoutTask,
    MoveToRoomTask,
    GoMineAndDropTask,
    SpawnRemoteTask,
    FindAndUpdateRemotesTask,
    RemoteGrabFromDroppedResourceTask,
    reverseRoomAndPlanIdTask,
    SpawnRemoteHaulerTask, runTowerForeverTask
} from "./taskdefs";


export function CreateGoHarvestPlan(roomName: string, creep: Creep): GoHarvestConstructor {
    let plan = {

      // Type of task
      type: "goHarvest",

      // Room name of task
      roomName: roomName,

      // Priority of task
      priority: 5,

      // Requirements before task can be met
      requirements: (creep !== undefined),

      // Cancels the task if any of the allocated creeps die to prevent errors
      cancelCondition: "anyTargetDiedCondition",
      // Id of target of this task (eg: a source)
      targetId: creep.memory.previousTarget !== undefined ? creep.memory.previousTarget :
                  creep.room.find(FIND_SOURCES)[Math.floor(Math.random()*creep.room.find(FIND_SOURCES).length)].id,

      // Ids of creeps or structures that are allocated to this task
      allocated: [creep.id],

      taskTree: {
        // Possible children to be called
        // Possible child 1
        findAndHarvestchild: {
          info: findAndHarvestTask,
          children: {
            RemoveFromClosedListTask2: {
              info:RemoveFromClosedListTask
            },
            // child 2, called after child 1 is completed.
            GoToSpawnTaskchild2: {
              info: HarvesterGoToSpawnTask,
              children: {
                RemoveFromClosedListTask3: {
                  info: RemoveFromClosedListTask
                }
              }
            },
            dropItemsTaskchild2: {
              info:dropItemsTask,
              children: {
                RemoveFromClosedListTask2: {
                  info:RemoveFromClosedListTask
                }
              }
            }
          }
        },

        // Possible child 2, has a lower cost but a different condition that cannot be met if findAndHarvestchild is possible.
        GoToSpawnTaskchild1: {
          info: HarvesterGoToSpawnTask,
          children: {
            RemoveFromClosedListTask1: {
              info: RemoveFromClosedListTask
            }
          }
          // If there is no children, the plan will be considered completed

        },
        dropItemsTaskchild1: {
          info:dropItemsTask,
          children: {
            RemoveFromClosedListTask4: {
              info:RemoveFromClosedListTask
            }
          }
        },
        RemoveFromClosedListTask5: {
          info:RemoveFromClosedListTask
        },
      },
    }
    return plan
}
export function CreateGoHaulPlan(roomName: string, creep: Creep): GoHaulConstructor {
    let plan = {

      // Type of task
      type: "goHaul",

      // Room name of task
      roomName: roomName,

      // Priority of task
      priority: 5,

      // Requirements before task can be met
      requirements: (creep !== undefined),

      // Cancels the task if any of the allocated creeps die to prevent errors
      cancelCondition: "anyTargetDiedCondition",
      // Id of target of this task (eg: a source)
      targetId: creep.room.find(FIND_DROPPED_RESOURCES)[Math.floor(Math.random()*creep.room.find(FIND_DROPPED_RESOURCES).length)].id,

      // Ids of creeps or structures that are allocated to this task
      allocated: [creep.id],

      taskTree: {
        GrabFromDroppedResourceTask: {
          info:GrabFromDroppedResourceTask,
          children: {
            RemoveFromClosedListTask2: {
              info:RemoveFromClosedListTask
            },
            GoToSpawnTaskchild: {
              info: GoToSpawnTask,
              children: {
                RemoveFromClosedListTask: {
                  info: RemoveFromClosedListTask
                }
              }
            }
          }
        },
        RemoveFromClosedListTask2: {
          info:RemoveFromClosedListTask
        },
      },
    }
    return plan
}
export function CreateSpawnHarvesterPlan(room: Room): SpawnCreepConstructor {
  let compilerdumb = room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType===STRUCTURE_SPAWN})[0].id
  let plan = {

    // Type of task
    type: "SpawnHarvester",

    // Room name of task
    roomName: room.name,

    // Priority of task
    priority: 5,

    // Requirements before task can be met
    requirements: (room !== undefined&&room.memory.creeps.harvesters.all.length<getCreepLimit(room,"harvesters")),

    targetId: room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType===STRUCTURE_SPAWN})[0].id,

    allocated: [compilerdumb],

    // A cancel condition is not required

    taskTree: {
      // Possible children to be called
      // Possible child 1
      SpawnHarvesterChild: {
        info: SpawnHarvesterTask,
      },

    },
  }
  //@ts-ignore
  return plan
}
export function CreateSpawnUpgraderPlan(room: Room): SpawnCreepConstructor {
  let compilerdumb = room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType===STRUCTURE_SPAWN})[0].id
  let plan = {
      // Type of task
      type: "SpawnUpgrader",

      // Room name of task
      roomName: room.name,

      // Priority of task
      priority: 5,

      // Requirements before task can be met
      requirements: room !== undefined && room.memory.creeps.upgraders.all.length < getCreepLimit(room, "upgraders"),

      targetId: room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id,

      allocated: [compilerdumb],

      taskTree: {
          // Possible children to be called
          // Possible child 1
          SpawnUpgraderChild: {
              info: SpawnUpgraderTask
          }
      }
  };
  //@ts-ignore
  return plan
}
export function CreateSpawnBuilderPlan(room: Room): SpawnCreepConstructor {
  let compilerdumb = room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType===STRUCTURE_SPAWN})[0].id
  let plan = {
      // Type of task
      type: "SpawnBuilder",

      // Room name of task
      roomName: room.name,

      // Priority of task
      priority: 5,

      // Requirements before task can be met
      requirements: room !== undefined && room.memory.creeps.builders.all.length < getCreepLimit(room, "builders"),

      targetId: room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id,

      allocated: [compilerdumb],

      taskTree: {
          // Possible children to be called
          // Possible child 1
          SpawnBuilderChild: {
              info: SpawnBuilderTask
          }
      }
  };
  //@ts-ignore
  return plan
}
export function CreateSpawnHaulerPlan(room: Room): SpawnCreepConstructor {
  let compilerdumb = room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType===STRUCTURE_SPAWN})[0].id
  let plan = {
      // Type of task
      type: "SpawnHauler",

      // Room name of task
      roomName: room.name,

      // Priority of task
      priority: 5,

      // Requirements before task can be met
      requirements: room !== undefined && room.memory.creeps.haulers.all.length < getCreepLimit(room, "haulers"),

      targetId: room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id,

      allocated: [compilerdumb],

      taskTree: {
          // Possible children to be called
          // Possible child 1
          SpawnHaulerChild: {
              info: SpawnHaulerTask
          }
      }
  };
  //@ts-ignore
  return plan
}
  export function CreateGoUpgradePlan(roomName: string, creep: Creep): GoUpgradeConstructor {
    let plan = {

      // Type of task
      type: "goUpgrade",

      // Room name of task
      roomName: roomName,

      // Priority of task
      priority: 3,


      cancelCondition: "anyTargetDiedCondition",

      // Requirements before task can be met
      requirements: (creep !== undefined),

      // Id of target of this task (eg: a source)
      targetId: {spawn:creep.room.find(FIND_MY_SPAWNS)[0].id,source:creep.room.find(FIND_SOURCES)[0].id},

      // Ids of creeps or structures that are allocated to this task
      allocated: [creep.id],

      taskTree: {
        // Possible children to be called
        // Possible child 1
        findAndHarvest: {
          info: findAndHarvestTask,
          children: {
            buildContainerTask: {
              info: buildContainerTask,
              children: {
                RemoveFromClosedListTask5: {
                  info: RemoveFromClosedListTask
                }
              }
            },
            // child 2, called after child 1 is completed.
            GoUpgrade: {
              info: GoUpgradeTask ,
              children: {
                RemoveFromClosedListTask3: {
                  info: RemoveFromClosedListTask
                }
              }
            },
            RemoveFromClosedListTask4: {
              info: RemoveFromClosedListTask
            }
          }
        },

        // Possible child 2, has a lower cost but a different condition that cannot be met if findAndHarvestchild is possible.
        GrabFromSpawnTask: {
          info: GrabFromSpawnTask,
          // If there is no children, the plan will be considered completed
          children: {
            buildContainerTask2: {
              info: buildContainerTask,
              children: {
                RemoveFromClosedListTask6: {
                  info: RemoveFromClosedListTask
                }
              }
            },
            // child 2, called after child 1 is completed.
            GoUpgrade: {
              info: GoUpgradeTask,
              children: {
                RemoveFromClosedListTask2: {
                  info: RemoveFromClosedListTask
                }
              },
              RemoveFromClosedListTask1: {
                info: RemoveFromClosedListTask
              }
            }
          }
        }

      },
    }
    return plan
  }

  export function CreateGoBuildPlan(roomName: string, creep: Creep): GoUpgradeConstructor {
    let plan = {

      // Type of task
      type: "goBuild",

      // Room name of task
      roomName: roomName,

      // Priority of task
      priority: 3,

      // Requirements before task can be met
      requirements: (creep !== undefined),

      // Cancels the task if any of the allocated creeps die to prevent errors
      cancelCondition: "anyTargetDiedCondition",

      // Id of target of this task (eg: a source)
      targetId: {spawn:creep.room.find(FIND_MY_SPAWNS)[0].id,source:creep.room.find(FIND_SOURCES)[0].id},

      // Ids of creeps or structures that are allocated to this task
      allocated: [creep.id],

      taskTree: {
        // Possible children to be called
        // Possible child 1
        findAndHarvest: {
          info: findAndHarvestTask,
          children: {
            GoBuildTask: {
              info: GoBuildTask,
              children: {
                RemoveFromClosedListTask5: {
                  info: RemoveFromClosedListTask
                }
              }
            },
            RemoveFromClosedListTask4: {
              info: RemoveFromClosedListTask
            }
          }
        },

        // Possible child 2, has a lower cost but a different condition that cannot be met if findAndHarvestchild is possible.
        GrabFromSpawnTask: {
          info: GrabFromSpawnTask,
          // If there is no children, the plan will be considered completed
          children: {
            GoBuildTask2: {
              info: GoBuildTask,
              children: {
                RemoveFromClosedListTask6: {
                  info: RemoveFromClosedListTask
                }
              }
            },
          }
        }

      },
    }
    return plan
  }
  export function CreateGoScoutPlan(creep: Creep): GoScoutConstructor {
      let plan = {
          // Type of task
          type: "goScout",

          // Room name of task

          // Priority of task
          priority: 3,

          // Requirements before task can be met
          requirements: creep !== undefined,

          // Cancels the task if any of the allocated creeps die to prevent errors
          cancelCondition: "anyTargetDiedCondition",

          // Id of target of this task (eg: a source)
          targetId: {},

          // Ids of creeps or structures that are allocated to this task
          allocated: [creep.id],

          taskTree: {
              GoScout: {
                  info: GoScoutTask
                  // A closedlistremoval task wasn't included here because that is built for tasks specific to a single room. An automatic removefromlist system in main.ts is being used instead.
              }
          }
      };
      return plan;
  }
  export function CreateSpawnScoutPlan(room: Room): SpawnCreepConstructor {
      let compilerdumb = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id;
      let plan = {
          // Type of task
          type: "SpawnScout",

          // Room name of task
          roomName: room.name,

          // Priority of task
          priority: 5,

          // Requirements before task can be met
          requirements:
              room !== undefined && Memory.global.creeps.scouts.all.length < getCreepLimit(room, "scouts"),

          targetId: room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id,

          allocated: [compilerdumb],

          taskTree: {
              // Possible children to be called
              // Possible child 1
              SpawnHaulerChild: {
                  info: SpawnScoutTask
                  // A closedlistremoval task wasn't included here because that is built for tasks specific to a single room. An automatic removefromlist system in main.ts is being used instead.
              }
          }
      };
      //@ts-ignore
      return plan;
  }
export function CreateGoRemoteMinePlan(roomfrom: string, room: string, creep: Creep[]): GoRemoteMineConstructor {
    let plan = {
        // Type of task
        type: "goRemoteMine",

        // Room name of task
        roomName: roomfrom,

        // Priority of task
        priority: 5,

        // Requirements before task can be met
        requirements: room !== undefined,

        targetId: room,

        allocated: creep.map((c) => c.id),

        taskTree: {
            // Possible children to be called
            // Possible child 1
            MoveToRoomTask: {
                info: MoveToRoomTask,
                children: {
                    GoMineAndDropTask: {
                        info: GoMineAndDropTask,
                        children: {}
                    }
                }
            },
            GoMineAndDropTask: {
                info: GoMineAndDropTask,
                children: {}
            }
        }
    };
    //@ts-ignore
    return plan;
}
export function CreateGoRemoteHaulPlan(roomfrom: string, room: string, creep: Creep[]): GoRemoteMineConstructor {
    let haulerMoveToRoom = { ...MoveToRoomTask };
    haulerMoveToRoom.condition = true;
    let plan = {
        // Type of task
        type: "goRemoteHaul",

        // Room name of task
        roomName: roomfrom,

        // Priority of task
        priority: 5,

        // Requirements before task can be met
        requirements: room !== undefined,

        targetId: room,

        allocated: creep.map((c) => c.id),

        taskTree: {
            // Possible children to be called
            // Possible child 1
            MoveToRoomTask: {
                info: haulerMoveToRoom,
                children: {
                    RemoteGrabFromDroppedResourceTask: {
                        info: RemoteGrabFromDroppedResourceTask,
                        children: {
                            reverseRoomAndPlanIdTask: {
                                info: reverseRoomAndPlanIdTask,
                                children: {
                                    MoveToRoomTask: {
                                        info: haulerMoveToRoom,
                                        children: {
                                            GoToSpawnTask: {
                                                info: GoToSpawnTask
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    //@ts-ignore
    return plan;
}
export function CreateSpawnRemotePlan(room: Room): SpawnCreepConstructor {
    let compilerdumb = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id;
    let plan = {
        // Type of task
        type: "SpawnRemote",

        // Room name of task
        roomName: room.name,

        // Priority of task
        priority: 5,

        // Requirements before task can be met
        requirements:
            room !== undefined && room.memory.creeps.remoteminers.all.length < getCreepLimit(room, "remoteminers"),

        targetId: room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id,

        allocated: [compilerdumb],

        taskTree: {
            // Possible children to be called
            // Possible child 1
            SpawnHaulerChild: {
                info: SpawnRemoteTask,
                RemoveFromClosedListTask6: {
                    info: RemoveFromClosedListTask
                }
            }
        }
    };
    //@ts-ignore
    return plan;
}
export function CreateSpawnRemoteHaulerPlan(room: Room): SpawnCreepConstructor {
    let compilerdumb = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id;
    let plan = {
        // Type of task
        type: "SpawnRemoteHauler",

        // Room name of task
        roomName: room.name,

        // Priority of task
        priority: 5,

        // Requirements before task can be met
        requirements: room !== undefined && room.memory.creeps.remotehaulers.all.length < getCreepLimit(room,"remotehaulers"),

        targetId: room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN })[0].id,

        allocated: [compilerdumb],

        taskTree: {
            // Possible children to be called
            // Possible child 1
            SpawnHaulerChild: {
                info: SpawnRemoteHaulerTask,
                RemoveFromClosedListTask6: {
                    info: RemoveFromClosedListTask
                }
            }
        }
    };
    //@ts-ignore
    return plan;
}
export function CreateFindandUpdateRemotesPlan(room: Room): FindUpdateRemotesConstructor {
    let plan = {
        // Type of task
        type: "findUpdateRooms",

        // Room name of task
        roomName: room.name,

        // Priority of task
        priority: 5,

        // Requirements before task can be met
        requirements: room !== undefined,

        allocated: [room.name],

        taskTree: {
            // Possible children to be called
            // Possible child 1
            FindAndUpdateRemotesChild: {
                info: FindAndUpdateRemotesTask,
                RemoveFromClosedListTask6: {
                    info: RemoveFromClosedListTask
                }
            }
        }
    };
    //@ts-ignore
    return plan;
}
export function CreateRunTowerTask(tower: StructureTower,room:Room): FindUpdateRemotesConstructor {
    let plan = {
        // Type of task
        type: "TowerImmortalTask",

        // Room name of task
        roomName: room.name,

        // Priority of task
        priority: 5,

        // Requirements before task can be met
        requirements: true,

        allocated: [tower.id],

        taskTree: {
            runTowerForeverTask: {
                info: runTowerForeverTask,
            }
        }
    };
    //@ts-ignore
    return plan;
}
