import { Structure } from "../../typings/structure";
import { report } from "../libs/roomReporting"
import { Allies } from "../libs/allyLibs/allyConsts"

export function tick(creep: Creep) {
    try {
        if (creep.memory.patrolling === undefined) {
            let checkAll = [FIND_EXIT_BOTTOM, FIND_EXIT_LEFT, FIND_EXIT_RIGHT, FIND_EXIT_TOP]
            let nextMove: RoomPosition[] = [];
            for (let a of checkAll) {
                let newPos = creep.room.find(a)
                nextMove = nextMove.concat(newPos)

            }
            let moveTo = nextMove[Math.floor(nextMove.length * Math.random())]
            creep.memory.patrolling = moveTo
        }
        const messages = [
            "Scouting away, I don't know what to scout, i'll scout this anyway",
            "👀",
            "I see your room",
            "1 move part and a dream to see the world.",
            "It's a small world isn't' it",
            "did someone forget to reserve their room?",
            "adding signs like this is kinda useless, but it is funny",
            "how boxed in am I?",
            "A geo scout has been here!",
            "Geo land, " + String(Game.cpu.getUsed()) + " cpu used and counting!",
            "Hello!",
            "Traxus should expand the server map",
            "It's crazy how un-cpu efficent some bots here probably are.",
            "You should always start on shard3, why? I'm out of space to explain",
            "trios SUCK, don't use em",
            "Screeps :)",
            "My legacy shall be left... With signs!",
            "How many of your creeps died, for just 1k energy?",
            "You should play outer wilds."
        ]
        if (creep.memory.check === undefined) {
            creep.memory.check = 0
        }
        /*if(creep.room.name!==creep.memory.lastRoom) {
            creep.memory.check+=1
            if(creep.memory.check>5) {
                creep.memory.lastRoom = creep.room.name
                creep.memory.state = "signing"
                creep.memory.check = 0
            }
        }*/
        if (creep.memory.state === "signing") {

            if (creep.room.controller) {
                if (creep.signController(creep.room.controller, messages[Math.floor(messages.length * Math.random())]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller)
                } else {
                    creep.memory.state = ""
                    creep.memory.patrolling = undefined
                }
            }
        }
        creep.moveTo(new RoomPosition(creep.memory.patrolling.x, creep.memory.patrolling.y, creep.memory.patrolling.roomName))
        if (creep.pos.inRangeTo(creep.memory.patrolling, 1)) {
            let data = createRoomData(creep)
            Memory.scoutedRooms[creep.room.name] = data
            if (data.controller.reservation !== undefined && data.controller.reservation !== creep.owner.username && data.controller.owned === undefined && data.controller.exists) {
                if (Memory.harass === undefined) {
                    Memory.harass = []
                }
                if (data.controller.reservation !== "Invader"&&Allies.indexOf(data.controller.reservation)===-1) {
                    report.formatImportant("*", "harass target found")
                    console.log("harass target found")
                    Memory.harass.push(creep.room.name)
                }
            }
            creep.memory.patrolling = undefined

        }
    } catch (e) { console.log(e) }
}
function createRoomData(creep: Creep) {
    let source = creep.room.find(FIND_SOURCES)
    let creeps = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: function (creep: Creep) {
            return Allies.indexOf(creep.owner.username) === -1
        }
    })
    let structs: Structure[] = creep.room.find(FIND_STRUCTURES)
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
    for (let s of structs) scout.Structures.push({ pos: s.pos, structureType: s.structureType, id: s.id })
    console.log(JSON.stringify(scout))

    return scout
}
