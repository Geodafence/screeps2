import { Misc } from "consts/MiscConsts";
import { addCoordinates } from "functions/misc";
import { GoRemoteMineConstructor, GoScoutConstructor } from "Taskmaster/planConstructor"
import { taskReturn } from "Taskmaster/taskdefs"

interface scoutMemory {
    /**
     * All sources in the room
     */
    sources: RoomPosition[];
     /**
     * All creeps in the room
      *
      * This info goes stale incredibly quickly and is NOT RECOMMENDED FOR USE
     */
     creeps: RoomPosition[];
      /**
         * All structures in the room
       *
       */
      Structures: { pos: RoomPosition, structureType: StructureConstant, id: Id<Structure> }[];
      /**
       * Basic info about the controller
       */
      controller: { owned?: string | undefined, level?: number | undefined, exists: boolean, reservation: string | undefined };
     /**
       * A tick timestamp stating when this room was surveyed, avoid using after ~100-1000 ticks
     */
     surveyedAt: number;
}

export function ScoutRoom(allocatedItems: Id<Creep>[], planState: GoScoutConstructor): taskReturn {
    if(!Memory.roomData) {
        Memory.roomData = {}
    }
    let confirm = false
    for (let id of allocatedItems) {
        let creep = Game.getObjectById(id)
        if(!creep) {
            return {
                suceeded: true,
                updatedItems: allocatedItems
            }
        }
        if(creep.memory.roomName===undefined) {
            let r = creep.room.name
            let checkArray = [addCoordinates(r,"E0N1"),addCoordinates(r,"E0S1"),addCoordinates(r,"W1N0"),addCoordinates(r,"E1N0")]
            console.log(checkArray)
            let setRoom:string|undefined = undefined
            let mt = Infinity
            for(let I of checkArray) {
                let d = Memory.roomData[I];
                let t = d === undefined ? 0: d.surveyedAt
                let e = d === undefined? undefined : d.controller.owned
                t += Math.floor(Math.random()*100)
                if(t < mt&&(e===undefined||e===Misc.username)) {
                    setRoom = I
                    mt = t
                }
            }
            if(setRoom!==null) {
                creep.memory.roomName = setRoom
            }
        }
        if(creep.memory.roomName===undefined) {
            continue
        }
        if(creep.room.name!==creep.memory.roomName||creep.pos.inRangeTo(new RoomPosition(25,25,creep.memory.roomName),35)===false) {
            creep.moveTo(new RoomPosition(25,25,creep.memory.roomName))
        } else {
            let scout: scoutMemory = createRoomData(creep)
            Memory.roomData[creep.room.name] = scout
            creep.memory.roomName = undefined
            confirm = true
        }
    }
    return {
        suceeded: confirm,
        updatedItems: allocatedItems
    }
}

function createRoomData(creep: Creep) {
    let source = creep.room.find(FIND_SOURCES)
    let creeps = creep.room.find(FIND_HOSTILE_CREEPS)
    //let structs: Structure[] = creep.room.find(FIND_STRUCTURES)
    let scout: scoutMemory = {
        sources: [],
        creeps: [],
        Structures: [],
        controller: {
            owned: creep.room.controller?.owner?.username,
            level: creep.room.controller?.level,
            exists: creep.room.controller !== undefined,
            reservation: creep.room.controller?.reservation?.username
        },
        surveyedAt: Game.time,
    }
    for (let s of source) scout.sources.push(s.pos)
    for (let s of creeps) scout.creeps.push(s.pos)
    //for (let s of structs) scout.Structures.push({ pos: s.pos, structureType: s.structureType, id: s.id })

    return scout
}
export function MoveToRoom(allocatedItems: Id<Creep>[], planState: GoRemoteMineConstructor): taskReturn {
    let confirm = true;
    let iter = 0;

    for (let id of allocatedItems) {
        let creep = Game.getObjectById(id);
        if (creep === null || !(creep instanceof Creep)) {
            allocatedItems.splice(iter, 1);
            return {
                suceeded: false,
                status: "creep doesn't exist",
                updatedItems: allocatedItems
            };
        }

        let roomname = planState.targetId;
        if (roomname === undefined) {
            continue;
        }
        new RoomVisual(creep.room.name).text("Travelling to " + planState.targetId, creep.pos.x, creep.pos.y, {
            color: "blue"
        });
        if (creep.room.name !== roomname || creep.pos.inRangeTo(new RoomPosition(25, 25, roomname), 14) === false) {
            creep.moveTo(new RoomPosition(25, 25, roomname));
        }
        if(creep.room.name !== roomname || !creep.pos.inRangeTo(new RoomPosition(25, 25, roomname), 20)) {
            confirm = false;
        }

        iter++;
    }
    return {
        suceeded: confirm,
        updatedItems: allocatedItems
    };
}
