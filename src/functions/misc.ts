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

export function SayAll(creepList: Creep[]) {
    let text = [
        "There", "once", "was", "a", "ship", "that", "put", "to", "sea",
        "The", "name", "of", "the", "ship", "was", "the", "Billy", "of", "Tea",
        "The", "winds", "blew", "up", "her", "bow", "dipped", "down",
        "O", "blow", "my", "bully", "boys", "blow", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tea", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "done",
        "We'll", "take", "our", "leave", "and", "go",
        "She", "had", "not", "been", "two", "weeks", "from", "shore",
        "When", "down", "on", "her", "a", "right", "whale", "bore",
        "The", "captain", "called", "all", "hands", "and", "swore",
        "He'd", "take", "that", "whale", "in", "tow", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tеa", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "donе",
        "We'll", "take", "our", "leave", "and", "go",
        "Before", "the", "boat", "had", "hit", "the", "water",
        "The", "whale's", "tail", "came", "up", "and", "caught", "her",
        "All", "hands", "to", "the", "side", "harpooned", "and", "fought", "her",
        "When", "she", "dived", "down", "low", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tea", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "done",
        "We'll", "take", "our", "leave", "and", "go",
        "No", "line", "was", "cut", "no", "whale", "was", "freed",
        "The", "Captain's", "mind", "was", "not", "of", "greed",
        "But", "he", "belonged", "to", "the", "Wellermans", "creed",
        "She", "took", "that", "ship", "in", "tow", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tea", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "done",
        "We'll", "take", "our", "leave", "and", "go",
        "For", "forty", "days", "or", "even", "more",
        "The", "line", "went", "slack", "then", "tight", "once", "more",
        "All", "boats", "were", "lost", "there", "were", "only", "four",
        "But", "still", "that", "whale", "did", "go", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tea", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "done",
        "We'll", "take", "our", "leave", "and", "go",
        "As", "far", "as", "I've", "heard", "the", "fight's", "still", "on",
        "The", "line's", "not", "cut", "and", "the", "whale's", "not", "gone",
        "The", "Wellerman", "makes", "his", "regular", "call",
        "To", "encourage", "the", "Captain", "crew", "and", "all", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tea", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "done",
        "We'll", "take", "our", "leave", "and", "go", "Huh!",
        "Soon", "may", "the", "Wellerman", "come",
        "To", "bring", "us", "sugar", "and", "tea", "and", "rum",
        "One", "day", "when", "the", "tonguin'", "is", "done",
        "We'll", "take", "our", "leave", "and", "go",
        "hm","hm","hm","hm","hm","hm","hm","hm","hm","hm","hm","hm",
        "I", "thought", "I", "heard", "the", "Old", "Man", "say:",
        "Leave", "her,", "Johnny,", "leave", "her.",
        "Tomorrow", "you", "will", "get", "your", "pay", "And", "it\'s", "time", "for", "us", "to", "leave", "her",
        "Leave", "her,", "Johnny,", "leave", "her",
        "I", "thought", "I", "heard", "the", "Old", "Man", "say",
        "Leave", "her", "Johnny", "leave", "her",
        "Tomorrow", "you", "will", "get", "your", "pay",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "Leave", "her", "Johnny", "leave", "her",
        "Oh", "leave", "her", "Johnny", "leave", "her",
        "For", "the", "voyage", "is", "long", "and", "the", "winds", "don't", "blow",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "Oh", "the", "wind", "was", "foul", "and", "the", "sea", "ran", "high",
        "Leave", "her", "Johnny", "leave", "her",
        "She", "shipped", "it", "green", "and", "none", "went", "by",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "Leave", "her", "Johnny", "leave", "her",
        "Oh", "leave", "her", "Johnny", "leave", "her",
        "For", "the", "voyage", "is", "long", "and", "the", "winds", "don't", "blow",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "I", "hate", "to", "sail", "on", "this", "rotten", "tub",
        "Leave", "her", "Johnny", "leave", "her",
        "No", "grog", "allowed", "and", "rotten", "grub",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "Leave", "her", "Johnny", "leave", "her",
        "Oh", "leave", "her", "Johnny", "leave", "her",
        "For", "the", "voyage", "is", "long", "and", "the", "winds", "don't", "blow",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "We", "swear", "by", "rote", "for", "want", "of", "more",
        "Leave", "her", "Johnny", "leave", "her",
        "But", "now", "we're", "through", "so", "we'll", "go", "on", "shore",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "Leave", "her", "Johnny", "leave", "her",
        "Oh", "leave", "her", "Johnny", "leave", "her",
        "For", "the", "voyage", "is", "long", "and", "the", "winds", "don't", "blow",
        "And", "it's", "time", "for", "us", "to", "leave", "her",
        "hm","hm","hm","hm","hm","hm","hm","hm","hm","hm","hm","hm",
        "What", "will", "we", "do", "with", "a", "drunken", "sailor",
        "What", "will", "we", "do", "with", "a", "drunken", "sailor",
        "What", "will", "we", "do", "with", "a", "drunken", "sailor",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",

        "Shave", "his", "belly", "with", "a", "rusty", "razor",
        "Shave", "his", "belly", "with", "a", "rusty", "razor",
        "Shave", "his", "belly", "with", "a", "rusty", "razor",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",

        "Put", "him", "in", "a", "long", "boat", "till", "his", "sober",
        "Put", "him", "in", "a", "long", "boat", "till", "his", "sober",
        "Put", "him", "in", "a", "long", "boat", "till", "his", "sober",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",

        "Stick", "him", "in", "a", "barrel", "with", "a", "hosepipe", "on", "him",
        "Stick", "him", "in", "a", "barrel", "with", "a", "hosepipe", "on", "him",
        "Stick", "him", "in", "a", "barrel", "with", "a", "hosepipe", "on", "him",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",

        "Put", "him", "in", "the", "bed", "with", "the", "captains", "daughter",
        "Put", "him", "in", "the", "bed", "with", "the", "captains", "daughter",
        "Put", "him", "in", "the", "bed", "with", "the", "captains", "daughter",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",

        "Thats", "what", "we", "do", "with", "a", "drunken", "sailor",
        "Thats", "what", "we", "do", "with", "a", "drunken", "sailor",
        "Thats", "what", "we", "do", "with", "a", "drunken", "sailor",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",

        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Way", "hay", "and", "up", "she", "rises",
        "Early", "in", "the", "morning",
        "hm","hm","hm","hm","hm","hm","hm","hm","hm","hm","hm","hm",
    ]
    let start = Game.time /** creepList.length*/ % text.length
    creepList[Math.floor(Math.random()*creepList.length)].say(text[start],true)
    //for (let creep of creepList) {
    //    creep.say(text[start], true)
    //    start += 1
    //}
}

