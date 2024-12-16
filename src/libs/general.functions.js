function sfc32(a, b, c, d) {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
}
function getWorldCoord(pos) {
    let { x, y, roomName } = pos
    if (x < 0 || x > 49) throw new RangeError("x value " + x + " not in range")
    if (y < 0 || y > 49) throw new RangeError("y value " + y + " not in range")
    if (roomName == "sim") throw new RangeError("Sim room does not have world position")
    let [name, h, wx, v, wy] = roomName.match(/^([WE])([0-9]+)([NS])([0-9]+)$/)

    if (h == "W") wx = ~wx
    if (v == "N") wy = ~wy
    return { x: 50 * wx + x, y: 50 * wy + y }
  }

function seededrandom(seed,optional=null,optional2=null) {

    if(optional === null) {
        const getRand = sfc32(seed[0],seed[1],seed[2],seed[3]);
        return getRand
    } else {
        const getRand = sfc32(seed[0],optional2,seed[2],optional);
        return getRand
    }
}
    /**
     * Remove a item from a list because js is too stupid to make this a basic function
     * @param {Array} list
     * @param {Any} item
    **/
    export function Lremove(varset, item) {
        const index = varset.indexOf(item);
        var copy = varset
        if (index > -1) {
            copy.splice(index, 1);
        }
        return copy
    }
    export function shuffle(array) {
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
      export function seededshuffle(array,seed) {
        let currentIndex = array.length;
        let I = 0
        let I2 = 0
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
          // Pick a remaining element...
          let randomIndex = Math.floor(seededrandom(seed,I,I2) * currentIndex);
          currentIndex--;

          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
            I+=500000
            I+=10000
        }
        return array
    }
    export function getseed() {
        const seedgen = () => (Math.random()*2**32)>>>0;
        return [seedgen(), seedgen(), seedgen(), seedgen()]
    }
    export function partcost(array) {
        let tally = 0
            for(const I in array) {
                let I2 = array[I]
                tally+=BODYPART_COST[I2]
            }
        return tally
    }
    export function getTrueDistance(pos1, pos2){
        pos1 = getWorldCoord(pos1);
        pos2 = getWorldCoord(pos2);
        let xDiff = Math.abs(pos1.x - pos2.x);
        let yDiff = Math.abs(pos1.y - pos2.y);
        let trueDistance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        return trueDistance;
    }




