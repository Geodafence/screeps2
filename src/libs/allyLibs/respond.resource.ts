
import { ResourceRequest, simpleAllies } from "./simpleAllies";

// Example of fulfilling an ally resource request


export function respondToResourceRequests(room:Room) {

    // Other players want resources, let's send them some!

    const resourceRequests = simpleAllies.allySegmentData.requests?.resource
    if (!resourceRequests||!room.terminal) return

    for (const request of resourceRequests) {

        if(request===null) continue

        let structRef = Memory.structures[room.terminal.id]
        if(request.terminal&&room.terminal&&room.storage) {
            if(room.storage.store[request.resourceType]>request.amount+(20000-20000*request.priority)) {
                structRef.data.storedRequests.push({sendTo:request.roomName,sendtype:"direct",resType:request.resourceType,amount:request.amount})
            }
        }
        Memory.structures[room.terminal.id] = structRef
    }
}
