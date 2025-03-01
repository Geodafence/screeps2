

function sfc32(a: number, b: number, c: number, d: number) {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
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

/**
 * Remove a item from a list because js is too stupid to make this a basic function
 * @param {Array} list
 * @param {Any} item
**/
export function Lremove(varset: Array<any>, item: any) {
    const index = varset.indexOf(item);
    var copy = varset
    if (index > -1) {
        copy.splice(index, 1);
    }
    return copy
}
export function shuffle(array: Array<any>) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}
export function partcost(array: BodyPartConstant[]) {
    let tally = 0
    for (const I in array) {
        let I2 = array[I]
        tally += BODYPART_COST[I2]
    }
    return tally
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
export function generateName() {
    const spawnStarts = ["The Spooky","The Amazing","The Epic","The Baffling","The Giant", "The Red","The Northern","The Worrying","The Insane","The Eyebrow Raising","The Weirdly Wholesome","The Required","The Fascinating","The","The Big Stupid","The Halfwit","The Absurd","The Beautiful"]
    const spawnMids = [" Scary "," Creep "," Spawning "," Idiotic "," Lazy ", " Spy in The "," Mountain "," Choices of The "," Well Goblin in The "," Completely Ruined "," Short "," Extra "," Life Of The "," Car Crash Nature Of The "," Choice to Visit The "," Randomized "," Eye-Popping Visual of The "]
    const spawnEnds = ["Skeleton","Circus","Location","Decision","Cat","Base","Codebase Owner","Walls","Room","Soccer Field","Story","Overlords","Beta","Himalayas"]
    return spawnStarts[Math.floor(spawnStarts.length*Math.random())] +
    spawnMids[Math.floor(spawnMids.length*Math.random())] +
    spawnEnds[Math.floor(spawnEnds.length*Math.random())]
}
