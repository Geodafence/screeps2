import { getTrueDistance, addCoordinates } from "../general.functions"

export function findSuitableRemotes(room: Room):{room: string;linkedroom?: string;usedSegment: number;}[] {
    let banned:string[] = []
    if(Game.shard.name==="thunderdrone") {
        banned = ["E7S7","E8S7","E8S8"]
    }
    let coords = ["W0N1","E1N1","E1N0","E1S1","E0S1","W1S1","W1N0"]
    let mid = new RoomPosition(25,25,room.name)
    let foundSources = 0
    let level = (room.controller?.level??0)
    let neededSources = level>=7?8:level>=3?4:6
    let possibleRooms:string[] = []
    for(let coord of coords) {
        if(foundSources>=neededSources) break;
        let roomCheck = addCoordinates(room.name,coord)
        let Sroom = Memory.scoutedRooms[roomCheck]
        if(Sroom!==undefined) {
            if(Sroom.controller.owned!==undefined||
            (Sroom.controller.reservation!==undefined&&Sroom.controller.reservation!==room.controller?.owner?.username)||Memory.miningrooms.some((a)=>a.room===roomCheck)
            || banned.indexOf(roomCheck)!==-1) {
                continue;
            }
            if(PathFinder.search(mid,Sroom.sources).cost<100) {
                foundSources += Sroom.sources.length
                possibleRooms.push(roomCheck)
            }
        }
    }
    let ret:{
        room: string;
        linkedroom?: string;
        usedSegment: number;
    }[] = []
    for(let R of possibleRooms) {
        ret.push({room:R,usedSegment:0,linkedroom:room.name})
    }
    return ret
}
