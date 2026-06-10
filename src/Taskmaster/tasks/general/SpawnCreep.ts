import { bodyConsts } from "consts/BodyConsts";
import { generateName, deferCreepGrab } from "functions/misc";
import { SpawnCreepConstructor } from "Taskmaster/planConstructor";
import { taskReturn } from "Taskmaster/taskdefs";
import { InternalGetBodyCost, InternalCalcBodySize } from "functions/HelperFunctions";


export function SpawnHauler(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0])

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        }
    }

    if (spawn.room.energyAvailable >= InternalGetBodyCost(spawn)) {
        let name = generateName()
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.hauler), name)
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "hauler", name)
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            }
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function SpawnHarvester(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0])

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        }
    }

    if (spawn.room.energyAvailable >= InternalGetBodyCost(spawn)) {
        let name = generateName()
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.harvester), name)
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "harvester", name)
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            }
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function SpawnUpgrader(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0])

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        }
    }

    if (spawn.room.energyAvailable >= InternalGetBodyCost(spawn)) {
        let name = generateName()
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.upgrader), name)
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "upgrader", name)
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            }
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function SpawnBuilder(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0])

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        }
    }

    if (spawn.room.energyAvailable >= InternalGetBodyCost(spawn)) {
        let name = generateName()
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.builder), name)
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "builder", name)
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            }
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function SpawnScout(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0])

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        }
    }

    if (spawn.room.energyAvailable >= 50) {
        let name = generateName()
        let ret = spawn.spawnCreep([MOVE], name)
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "scout", name)
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            }
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
export function SpawnRemote(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0]);

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        };
    }

    if (spawn.room.energyAvailable >= 50) {
        let name = generateName();
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.harvester), name);
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "remote", name);
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            };
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function SpawnRemoteHauler(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0]);

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        };
    }

    if (spawn.room.energyAvailable >= 50) {
        let name = generateName();
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.hauler), name);
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "remotehauler", name);
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            };
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function SpawnQueen(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0]);

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        };
    }

    if (spawn.room.energyAvailable >= 50) {
        let name = generateName();
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.hauler), name);
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "queen", name);
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            };
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
export function SpawnDefender(allocatedItems: Id<StructureSpawn>[], planState: SpawnCreepConstructor): taskReturn {
    let spawn = Game.getObjectById(allocatedItems[0]);

    if (!spawn) {
        return {
            suceeded: true,
            status: "spawn no longer exists",
            updatedItems: allocatedItems
        };
    }

    if (spawn.room.energyAvailable >= 50) {
        let name = generateName();
        let ret = spawn.spawnCreep(InternalCalcBodySize(spawn, bodyConsts.defender), name);
        if (ret === OK) {
            deferCreepGrab(spawn.room.name, "defender", name);
            return {
                suceeded: true,
                status: "no errors",
                updatedItems: allocatedItems
            };
        }
    }
    return {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    };
}
