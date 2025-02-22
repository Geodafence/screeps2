export interface combatConstructor {
    /** The estimated total power of the item, may be inaccurate depending on the situation */
    estimatedPower: number;
    /** The hp the item can tank until it's damaging parts begin to take damage */
    HPpower: number;
    /** The melee dmg per tick that can be delt. Ranged items completely counter this.
     * Note that melee does significantly more damage when able to get into range */
    meleePower: number;
    /** The ranged dmg per tick that can be delt.
     * Note that ranged does significantly less damage, even less so when using rangedMass. */
    rangedPower: number;
    /** The healing per second the item can do. */
    healingPower: number
}
interface reportConstructor {
    /**
     * Checks if a creep can win aganist another creep.
     * @param enemyCreep Enemy creep
     * @param creep this creep
     * @returns a {@link Boolean} confirming if that creep can win or not.
     */
    canWin: (enemyCreep: Creep, creep: Creep) => Boolean
    /**
     * Checks if all of your creeps in a room can win aganist all enemy creeps in a room
     * @param room The room to check
     * @returns a {@link Boolean} confirming if those creeps can win or not.
     */
    canWinRoom: (room:Room) => Boolean
    /**
     * Gets the power of a creep
     * @param creep A creep
     * @returns A {@link combatConstructor} giving the creep's power
     */
    getCreepPower: (creep: Creep) => combatConstructor
    /**
     * gets the combined power of every friendly creep in a room
     * @param room The room to search
     * @returns A {@link combatConstructor} giving the room's power
     */
    getMyRoomPower: (room: Room) => combatConstructor
    /**
     * gets the combined power of every enemy creep in a room
     * @param room The room to search
     * @returns A {@link combatConstructor} giving the room's power
     */
    getEnemyRoomPower: (room: Room) => combatConstructor
}
export class strengthCalc implements reportConstructor {

    /**
     * Checks if a creep can win aganist another creep.
     * @param enemyCreep Enemy creep
     * @param creep this creep
     * @returns a {@link Boolean} confirming if that creep can win or not.
     */
    canWin(enemyCreep: Creep, creep: Creep): Boolean {
        let cacheId = enemyCreep.id + "combatInfo"
        let thiscacheId = creep.id + "combatInfo"
        let thisPower: combatConstructor
        let enemyPower: combatConstructor
        if (global.cache[cacheId] === undefined) {
            enemyPower = this.getCreepPower(enemyCreep)
            global.cache[cacheId] = enemyPower
        } else {
            enemyPower = global.cache[cacheId]
        }
        if (global.cache[thiscacheId] === undefined) {
            thisPower = this.getCreepPower(creep)
            global.cache[thiscacheId] = thisPower
        } else {
            thisPower = global.cache[thiscacheId]
        }
        if(thisPower.estimatedPower>=enemyPower.estimatedPower) {
            return true
        } else {
            return false
        }
    }
    /**
     * Checks if all of your creeps in a room can win aganist all enemy creeps in a room
     * @param room The room to check
     * @returns a {@link Boolean} confirming if those creeps can win or not.
     */
    canWinRoom(room:Room): Boolean {
        let thisPower: combatConstructor = this.getMyRoomPower(room)
        let enemyPower: combatConstructor = this.getEnemyRoomPower(room)
        console.log("this rooms power: "+JSON.stringify(thisPower)+", enemy room power: "+JSON.stringify(enemyPower))
        if(thisPower.estimatedPower>=enemyPower.estimatedPower) {
            return true
        } else {
            return false
        }
    }
    /**
     * Gets the power of a creep
     * @param creep A creep
     * @returns A {@link combatConstructor} giving the creep's power
     */
    getCreepPower(creep: Creep): combatConstructor {
        let constructor: combatConstructor = {
            estimatedPower: 0,
            HPpower: 0,
            meleePower: 0,
            rangedPower: 0,
            healingPower: 0
        }
        constructor.meleePower = (creep.getActiveBodyparts(ATTACK) * ATTACK_POWER)/3
        constructor.rangedPower = creep.getActiveBodyparts(RANGED_ATTACK) * RANGED_ATTACK_POWER
        constructor.healingPower = creep.getActiveBodyparts(HEAL) * HEAL_POWER

        let HPuntilsquishy = 0
        for (let part of creep.body) {
            if (part.type === MOVE || part.type === TOUGH) {
                HPuntilsquishy += part.hits
            } else break;
        }

        if (constructor.meleePower === 0 && constructor.rangedPower === 0 && constructor.healingPower === 0) {
            constructor.estimatedPower = 0
        } else {
            const offensivePower = constructor.meleePower + constructor.rangedPower + constructor.healingPower;
            const defensivePower = constructor.HPpower;

            const offensiveWeight = 0.7;
            const defensiveWeight = 0.3;

            constructor.estimatedPower = (offensivePower * offensiveWeight) + (defensivePower * defensiveWeight);
        }

        return constructor
    }
    /**
     * gets the combined power of every enemy creep in a room
     * @param room The room to search
     * @returns A {@link combatConstructor} giving the room's power
     */
    getEnemyRoomPower(room: Room):combatConstructor {
        let totalPower: combatConstructor = {
            estimatedPower: 0,
            HPpower: 0,
            meleePower: 0,
            rangedPower: 0,
            healingPower: 0
        }

        let creeps = room.find(FIND_HOSTILE_CREEPS)

        for(let creep of creeps) {
            totalPower = combineCombatPower(totalPower,this.getCreepPower(creep))
        }

        return totalPower
    }
    /**
     * gets the combined power of every friendly creep in a room
     * @param room The room to search
     * @returns A {@link combatConstructor} giving the room's power
     */
    getMyRoomPower(room: Room):combatConstructor {
        let totalPower: combatConstructor = {
            estimatedPower: 0,
            HPpower: 0,
            meleePower: 0,
            rangedPower: 0,
            healingPower: 0
        }

        let creeps = room.find(FIND_MY_CREEPS)

        for(let creep of creeps) {
            totalPower = combineCombatPower(totalPower,this.getCreepPower(creep))
        }

        return totalPower
    }
}
function combineCombatPower(constructor1:combatConstructor,constructor2:combatConstructor):combatConstructor {
    let constructor: combatConstructor = {
        estimatedPower: 0,
        HPpower: 0,
        meleePower: 0,
        rangedPower: 0,
        healingPower: 0
    }

    let repeat = ["estimatedPower","HPpower","meleePower","rangedPower","healingPower"]

    for(let compare of repeat) {
        //@ts-ignore
        constructor[compare] = constructor1[compare]+constructor2[compare]
    }

    return constructor
}
