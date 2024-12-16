
//Note: this code is deprecated and is no longer in use
export function run() {
        let totalDeficit = 0
        let wanted = 0
        let gotten = 0
        for(let I in Memory.longrangemining) {
            let value = Memory.longrangemining[I]
            wanted+= value.wantcreeps-1
            gotten+= value.creeps.length
        }
        if(gotten > wanted) {
            gotten = wanted
        }
        let temp = gotten*3-Memory.haulers.length
        if(temp < 0) {
            temp = 0
        }
        totalDeficit+=(wanted-gotten)
        totalDeficit+=temp
        if(Memory.harvesters.length == 0) {
            totalDeficit = Memory.storecache
        }
        if(totalDeficit < 0) {
            totalDeficit = 0
        }
        if(totalDeficit <= 5) {
            totalDeficit = 0
        }
        if(totalDeficit > Memory.storecache) {
            totalDeficit  = Memory.storecache
        }
        return totalDeficit
    }
