export function generateName() {
    let validname = false
    let name = ""
    while(!validname) {
        const spawnStarts = ["The Spooky","The Amazing","The Epic","The Baffling","The Giant", "The Red","The Northern","The Worrying","The Insane","The Eyebrow Raising","The Weirdly Wholesome","The Required","The Fascinating","The","The Big Stupid","The Halfwit","The Absurd","The Beautiful"]
        const spawnMids = [" Scary "," Creep "," Spawning "," Idiotic "," Lazy ", " Spy in The "," Mountain "," Choices of The "," Well Goblin in The "," Completely Ruined "," Short "," Extra "," Life Of The "," Car Crash Nature Of The "," Choice to Visit The "," Randomized "," Eye-Popping Visual of The "]
        const spawnEnds = ["Skeleton","Circus","Location","Decision","Cat","Base","Codebase Owner","Walls","Room","Soccer Field","Story","Overlords","Beta","Himalayas"]
        name = spawnStarts[Math.floor(spawnStarts.length*Math.random())] +
            spawnMids[Math.floor(spawnMids.length*Math.random())] +
            spawnEnds[Math.floor(spawnEnds.length*Math.random())]
        if(Game.creeps[name]===undefined) {
            validname = true
        }
    }
    return name
}
export function deferCreepGrab(roomName:string,type:string,creepName:string) {
    if(Memory.deferCreepGrab === undefined) Memory.deferCreepGrab = []
    Memory.deferCreepGrab.push({name:creepName,roomName:roomName,type:type})
}
export function getTrueDistance(pos1: RoomPosition, pos2: RoomPosition) {
    let pos1a: | { x: number, y: number }
        = getWorldCoord(pos1);
    let pos2a: { x: number, y: number }
        = getWorldCoord(pos2);
    let xDiff = Math.abs(pos1a.x - pos2a.x);
    let yDiff = Math.abs(pos1a.y - pos2a.y);
    let trueDistance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    return trueDistance;
}



export function parseCoordinate(coord: string) {
    const match = coord.match(/^([WE])(\d+)([NS])(\d+)$/);
    if (!match) {
        throw new Error(`Invalid coordinate format: ${coord}`);
    }
    const hDir = match[1];
    const hNum = parseInt(match[2], 10);
    const vDir = match[3];
    const vNum = parseInt(match[4], 10);
    const horizontal = hDir === 'W' ? -hNum : hNum;
    const vertical = vDir === 'S' ? -vNum : vNum;
    return { horizontal, vertical };
}

export function addCoordinates(coord1: string, coord2: string): string {
    const parsed1 = parseCoordinate(coord1);
    const parsed2 = parseCoordinate(coord2);

    const sumH = parsed1.horizontal + parsed2.horizontal;
    const sumV = parsed1.vertical + parsed2.vertical;

    const hResult = sumH >= 0 ? `E${sumH}` : `W${-sumH}`;
    const vResult = sumV >= 0 ? `N${sumV}` : `S${-sumV}`;

    return hResult + vResult;
}
function getWorldCoord(pos: RoomPosition) {
    let { x, y, roomName } = pos;

    if (x < 0 || x > 49) throw new RangeError("x value " + x + " not in range");
    if (y < 0 || y > 49) throw new RangeError("y value " + y + " not in range");
    if (roomName == "sim") throw new RangeError("Sim room does not have world position");

    const match = roomName.match(/^([WE])([0-9]+)([NS])([0-9]+)$/);
    if (!match) {
        throw new Error(`Room name '${roomName}' is not in the expected format`);
    }

    // Destructure after ensuring match is not null
    let wx: number | string; let wy: number | string; let h: string; let v: string; let name: string
    [name, h, wx, v, wy] = match;

    wx = parseInt(wx);
    wy = parseInt(wy);

    if (h == "W") wx = ~wx;
    if (v == "N") wy = ~wy;

    return { x: 50 * wx + x, y: 50 * wy + y };
}

export function flee(creep: Creep, goal: RoomObject, range: number = 6) {
    //@ts-ignore
    let goals = { pos: goal.pos, range: range };
    let ret = PathFinder.search(creep.pos, goals, {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 10,
        maxRooms: 1,
        flee: true,

        roomCallback: function (roomName) {
            let room = Game.rooms[roomName];
            // In this example `room` will always exist, but since
            // PathFinder supports searches which span multiple rooms
            // you should be careful!
            if (!room) return new PathFinder.CostMatrix();
            let costs = new PathFinder.CostMatrix();

            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (
                    struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
                ) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                }
            });

            // Avoid creeps in the room
            room.find(FIND_CREEPS).forEach(function (creep) {
                costs.set(creep.pos.x, creep.pos.y, 0xff);
            });

            return costs;
        }
    });
    let pos = ret.path[0];
    return ret.path;
}
