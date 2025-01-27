

function sfc32(a:number, b:number, c:number, d:number) {
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
    let wx:number|string; let wy:number|string; let h:string; let v:string; let name:string
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
    export function Lremove(varset:Array<any>, item:any) {
        const index = varset.indexOf(item);
        var copy = varset
        if (index > -1) {
            copy.splice(index, 1);
        }
        return copy
    }
    export function shuffle(array:Array<any>) {
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
    export function partcost(array:BodyPartConstant[]) {
        let tally = 0
            for(const I in array) {
                let I2 = array[I]
                tally+=BODYPART_COST[I2]
            }
        return tally
    }
    export function getTrueDistance(pos1:RoomPosition, pos2:RoomPosition){
        let pos1a:|{x:number,y:number}
         = getWorldCoord(pos1);
        let pos2a:{x:number,y:number}
         = getWorldCoord(pos2);
        let xDiff = Math.abs(pos1a.x - pos2a.x);
        let yDiff = Math.abs(pos1a.y - pos2a.y);
        let trueDistance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        return trueDistance;
    }




