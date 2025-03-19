
import { checkerBoard } from "../libs/baseBuildingLibs/checkerboardBuilder"
import { addCoordinates, getTrueDistance } from "../libs/general.functions";

function random(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** Find and push claimed rooms to the claim queue

Note that this also clears stale data
**/
export function findClaimRooms(room2: Room): void {
    if (Memory.wantToClaim.length === 0 && global.LRBmake !== 1 && global.ownedRooms < Game.gcl.level) {
        for (let I in Memory.scoutedRooms) {
            let room = Memory.scoutedRooms[I]
            if (Game.time > room.surveyedAt + 20000) {
                //delete Memory.scoutedRooms[I]
                //continue
            }
            let ableToBeSupported = false
            for(let I2 in Game.rooms) {
                let R = Game.rooms[I2]
                if((R.controller??{level:0}).level>=5) {
                    let dist = getTrueDistance(new RoomPosition(25, 25, I), new RoomPosition(25, 25, R.name))
                    if(dist<100) {
                        ableToBeSupported = false
                        break;
                    }
                    if(dist<500&&R.controller?.owner?.username===room2.controller?.owner?.username) {
                        ableToBeSupported = true
                    }
                }
            }
            if (ableToBeSupported) {
                console.log(I+" can be supported")
                if (confirmSuitable(I, new RoomPosition(random(5, 45), random(5, 45), I))) {
                    break;
                }
            }
        }
    }
}

function confirmSuitable(roomname: string, roomPos: RoomPosition):boolean {
    let I = Memory.scoutedRooms[roomname]

    if(I===undefined) {
        return false
    }
    if (I.controller.level !== 0 && I.controller.level !== undefined) {
        return false
    }
    if (I.controller.owned !== undefined) {
        return false
    }
    if (!I.controller.exists) {
        return false
    }

    if (I.sources.length !== 2) {
        return false
    }
    if (I.creeps!==undefined) {
        if(I.creeps.length>0) {
            return false
        }
    }

    console.log("room "+roomname+" passed basic testing, confirming if it's suitable for claiming.")
    let coords = ["W0N1", "E1N1", "E1N0", "E1S1", "E0S1", "W1S1", "W1N0","W0N2", "E2N2", "E2N0", "E2S2", "E0S2", "W2S2", "W2N0"]
    let mid = new RoomPosition(25, 25, roomname)
    let foundSources = 0
    let neededSources = 4
    let possibleRooms: string[] = []
    for (let coord of coords) {
        if (foundSources >= neededSources) break;
        let roomCheck = addCoordinates(roomname, coord)
        let Sroom = Memory.scoutedRooms[roomCheck]
        if (Sroom !== undefined) {
            if (Sroom.controller.owned !== undefined ||
                (Sroom.controller.reservation !== undefined) || Memory.miningrooms.some((a) => a.room === roomCheck)||Sroom.sources.length>2) {
                continue;
            }
            if (PathFinder.search(mid, Sroom.sources).cost < 70) {
                foundSources += Sroom.sources.length
                possibleRooms.push(roomCheck)
            }
        }
    }
    if (foundSources < 4) {
        console.log("failed: not enough remotes")
        return false
    }

    let test = new checkerBoard({
        RCL: 8,
        radius: 1,
        importantBuildRadius: 7,
        buildlimit: 10,
    })
    if (test.checkerCalculate(roomPos)) {
        Memory.wantToClaim.push({ room: roomname, override: false })
        return true
    }
    console.log("failed: no suitable checker setup")
    return false
}



