import { planConstructor } from "./planConstructor";

type altConditionFunction = ((allocatedItems: Array<string>, planState: planConstructor) => boolean)

function anyTargetDiedCondition(allocatedItems: Array<Id<AnyCreep> | Id<Structure> | string>, planState: planConstructor): boolean {


    for(let creepid of allocatedItems) {
        if (typeof creepid === "string") {
            return false
        }
        if(Game.getObjectById(creepid)===null) {
            return true
        }
    }
    return false
}



export const ConditionMap: {
    [funcname: string]: ((allocatedItems: Array<Id<AnyCreep> | Id<Structure> | string>, planState: planConstructor) => boolean | altConditionFunction);
} = {
    anyTargetDiedCondition: anyTargetDiedCondition
};
