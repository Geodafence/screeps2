import { simpleAllies } from "./simpleAllies"
import { respondToDefenseRequests } from "./respond.defense"
import { respondToResourceRequests } from "./respond.resource"
export function run(room:Room) {
    simpleAllies.initRun()

    respondToDefenseRequests(room)
    respondToResourceRequests(room)

    simpleAllies.endRun()
}
