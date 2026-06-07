const costs = {
    WORK: 100,
    CARRY: 50,
    MOVE: 50
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
function calcBestHaulerBody(maxprice:number):BodyPartConstant[] {
    let remainingprice = maxprice
    let body:BodyPartConstant[] = []
    while(remainingprice/costs.CARRY>body.length) {
        body.push(MOVE)
        remainingprice -= costs.MOVE
    }
    while(remainingprice>costs.CARRY) {
        body.push(CARRY)
        remainingprice -= costs.CARRY
    }
    return body
}

let harvesterdict:{[cost:number]:BodyPartConstant[]} = {}
for(let I = 6; I < 18; I++) {
    harvesterdict[I*50] = calcBestHarvesterBody(I*50)
}
let upgraderdict: { [cost: number]: BodyPartConstant[] } = {};
for (let I = 6; I < 18; I++) {
    upgraderdict[I * 50] = calcBestUpgraderBody(I * 50);
}
let haulerdict:{[cost:number]:BodyPartConstant[]} = {}
for(let I = 6; I < 18; I++) {
    haulerdict[I*50] = calcBestHaulerBody(I*50)
}
let scoutdict:{[cost:number]:BodyPartConstant[]} = {}
for(let I = 6; I < 18; I++) {
    scoutdict[I*50] = [MOVE]
}

export const bodyConsts = {
    harvester: harvesterdict,
    upgrader: upgraderdict,
    hauler: haulerdict,
    builder: upgraderdict,
    scout: scoutdict,
}
