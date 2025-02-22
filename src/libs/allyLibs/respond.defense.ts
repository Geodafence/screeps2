import { DefenseRequest, ResourceRequest, simpleAllies } from "./simpleAllies";
import { getTrueDistance } from "../general.functions"


export function respondToDefenseRequests(room:Room) {

    const defenseRequests = simpleAllies.allySegmentData.requests?.defense
    if (!defenseRequests) return

    for (const request of defenseRequests) {
        let start = new RoomPosition(25,25,room.name)
        let roomPos = new RoomPosition(25,25,request.roomName)
        if(getTrueDistance(start,roomPos)/50<=8) {
            if(request.priority<=0.3) {
                let alreadyrequested = -1;
                for (let temp in Memory.defenserequests) {
                    if (Memory.defenserequests[temp].room == request.roomName) {
                        alreadyrequested = 1;
                    }
                }
                if (alreadyrequested == -1) {
                    Memory.defenserequests.push({ x: 25, y: 25, room: request.roomName });
                }
                global.defenseNeeded = 40;
            } else {
                let alreadyrequested = -1;
                for (let temp in Memory.triorequests) {
                    if (Memory.triorequests[temp].roomName == request.roomName) {
                        alreadyrequested = 1;
                    }
                }
                if (alreadyrequested == -1) {
                    Memory.triorequests.push(new RoomPosition(25,25,request.roomName));
                }
            }
        }
    }

}
