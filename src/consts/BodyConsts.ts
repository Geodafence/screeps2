const costs = {
    WORK: 100,
    CARRY: 50,
    MOVE: 50,
    RANGED_ATTACK: BODYPART_COST[RANGED_ATTACK],
    HEAL: BODYPART_COST[HEAL],
}
function calcBestHarvesterBody(maxprice: number): BodyPartConstant[] {
    let remainingprice = maxprice;
    let body: BodyPartConstant[] = [];
    remainingprice -= costs.CARRY;
    remainingprice -= costs.MOVE;
    while (remainingprice / costs.MOVE > body.length) {
        body.push(WORK);
        remainingprice -= costs.WORK;
    }
    body.push(MOVE);
    while (remainingprice > costs.MOVE) {
        body.push(MOVE);
        remainingprice -= costs.MOVE;
    }
    body.push(CARRY);
    return body;
}
function calcBestUpgraderBody(maxprice: number): BodyPartConstant[] {
    let remainingprice = maxprice;
    let body: BodyPartConstant[] = [];
    remainingprice -= costs.CARRY*Math.ceil(maxprice/400);
    remainingprice -= costs.MOVE;
    while (remainingprice / costs.MOVE > body.length) {
        body.push(WORK);
        remainingprice -= costs.WORK;
    }
    body.push(MOVE);
    while (remainingprice > costs.MOVE) {
        body.push(MOVE);
        remainingprice -= costs.MOVE;
    }
    if(Math.ceil(maxprice / 400)>1) {
        body.push(MOVE);
    }

    for (let i = 0; i < Math.ceil(maxprice / 400); i++) {
        body.push(CARRY);
    }

    return body;
}
function calcBestHaulerBody(maxprice: number): BodyPartConstant[] {
    let remainingprice = maxprice;
    let body: BodyPartConstant[] = [];
    while (remainingprice / costs.CARRY > body.length) {
        body.push(MOVE);
        remainingprice -= costs.MOVE;
    }
    while (remainingprice > costs.CARRY) {
        body.push(CARRY);
        remainingprice -= costs.CARRY;
    }
    return body;
}
function calcBestRattackBody(maxprice: number): BodyPartConstant[] {
    let remainingprice = maxprice;
    let body: BodyPartConstant[] = [];

    if (maxprice > 1300) {
        remainingprice -= costs.HEAL;
        remainingprice -= costs.MOVE;
    }

    let rAttackCount = Math.round(remainingprice / 2);
    rAttackCount = Math.round(rAttackCount / costs.RANGED_ATTACK);

    for (let i = 0; i < rAttackCount; i++) {
        body.push(MOVE);
    }
    for(let i = 0; i < rAttackCount; i++) {
        body.push(RANGED_ATTACK);
    }


    if (maxprice > 1300) {
        body.push(MOVE);
        body.push(HEAL);
    }
    return body;
}


let harvesterdict:{[cost:number]:BodyPartConstant[]} = {}
for(let I = 6; I < 20; I++) {
    harvesterdict[I*50] = calcBestHarvesterBody(I*50)
}
let upgraderdict: { [cost: number]: BodyPartConstant[] } = {};
for (let I = 6; I < 60; I++) {
    upgraderdict[I * 50] = calcBestUpgraderBody(I * 50);
}
let haulerdict: { [cost: number]: BodyPartConstant[] } = {};
for (let I = 6; I < 18; I++) {
    haulerdict[I * 50] = calcBestHaulerBody(I * 50);
}

let scoutdict:{[cost:number]:BodyPartConstant[]} = {}
for(let I = 6; I < 1; I++) {
    scoutdict[I*50] = [MOVE]
}
let defenderdict: { [cost: number]: BodyPartConstant[] } = {};
for(let I = 6; I < 60; I++) {
    defenderdict[I*50] = calcBestRattackBody(I* 50);
}

export const bodyConsts = {
    harvester: harvesterdict,
    upgrader: upgraderdict,
    hauler: haulerdict,
    builder: upgraderdict,
    scout: scoutdict,
    defender: defenderdict
};
