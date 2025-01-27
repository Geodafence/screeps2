
import { Structure, StructureLink } from "../typings/structure";
import { getTrueDistance } from "./libs/general.functions"
import { removerequests, sendrequest, containsRequest } from "./libs/item-request-lib";
function getMasterLink(masterSpawn:StructureSpawn) {
    let links:StructureLink[] = masterSpawn.room.find(FIND_MY_STRUCTURES,{filter: function(structure:Structure) {
        return structure.structureType === STRUCTURE_LINK
    }})

    let link: undefined | StructureLink
    link = undefined
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
    export function tick(link: StructureLink) {
        let spawn = link.room.getMasterSpawn()
        let masterLink = getMasterLink(spawn)
        if(masterLink!==link&&masterLink!==undefined) {
            link.transferEnergy(masterLink)
        }
        if(link.store[RESOURCE_ENERGY]>700) {
            if(link.room.getMasterSpawn().memory.itemrequests.length===0) {
                sendrequest(link,700,RESOURCE_ENERGY,"take");
            }
        } else {
            removerequests(link)
        }
    }
