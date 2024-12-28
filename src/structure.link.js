import { getTrueDistance } from "./libs/general.functions"
import { removerequests, sendrequest, containsRequest } from "./libs/item-request-lib";
function getMasterLink(masterSpawn) {
    let links = masterSpawn.room.find(FIND_MY_STRUCTURES,{filter: function(structure) {
        return structure.structureType === STRUCTURE_LINK
    }})
    let link = 0
    let range = 999999
    for(let I in links) {
        if(getTrueDistance(links[I].pos,masterSpawn.pos)<range) {
            range = getTrueDistance(links[I].pos,masterSpawn.pos)
            link = links[I]
        }
    }
    return link
}
    /**
     *
     * @param {StructureLink} link
     */
    export function tick(link) {
        let spawn = link.room.getMasterSpawn()
        let masterLink = getMasterLink(spawn)
        if(masterLink!==link) {
            link.transferEnergy(masterLink)
        }
        if(link.store[RESOURCE_ENERGY]>700) {
            if(containsRequest(link.room.getMasterSpawn(),link.id)===false) {
                sendrequest(link,700,RESOURCE_ENERGY,"take");
            }
        } else {
            removerequests(link)
        }
    }
