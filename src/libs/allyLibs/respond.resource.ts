
import { ResourceRequest, simpleAllies } from "./simpleAllies";

// Example of fulfilling an ally resource request


export function respondToResourceRequests(room:Room) {

    // Other players want resources, let's send them some!

    const resourceRequests = simpleAllies.allySegmentData.requests?.resource
    if (!resourceRequests||!room.terminal) return

    for (const request of resourceRequests) {

        let structRef = Memory.structures[room.terminal.id]
    }
}
