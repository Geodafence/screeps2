import { planConstructor, TowerConstructor } from "../../planConstructor";
import { taskReturn } from "../../taskdefs";

export function runTowerForever(allocatedItems: Id<StructureTower>[], planState: TowerConstructor): taskReturn {
    for(let towerid of allocatedItems) {
        let tower = Game.getObjectById(towerid)
        if(tower == null) {
            console.log("Tower not found");
            return {
                suceeded: true,
                status: "tower dead",
                updatedItems: allocatedItems
            };
        }
        let repair = [STRUCTURE_ROAD,STRUCTURE_CONTAINER]

        let enemies = tower.room.find(FIND_HOSTILE_CREEPS);
        if (enemies.length > 0) {
            tower.attack(enemies[0]);

            return {
                suceeded: false,
                status: "no errors",
                updatedItems: allocatedItems
            };
        }
        //@ts-ignore
        let repairBuilding:(StructureRoad|StructureContainer) = tower.room.find(FIND_STRUCTURES, { filter: (x) => repair.includes(x.structureType) }).filter(x=>x.hits!==x.hitsMax)[0];

        tower.repair(repairBuilding);
    }
    return  {
        suceeded: false,
        status: "no errors",
        updatedItems: allocatedItems
    }
}
