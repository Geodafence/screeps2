
import funcs from "../libs/general.functions"
var pathDetector = function() {
    this.applyFunctions()
}
pathDetector.prototype.overrideFunctions = [
    "move"
]
pathDetector.prototype.wrapFunction = function (name, originalFunction) {
    return function wrappedFunction() {
      if(!!this.apply) {
        this.apply(name)
      }
      return originalFunction.apply(this, arguments);
    };
}
pathDetector.prototype.newRoadDetection = function() {
    for(let I in Game.creeps) {
        let item = Game.creeps[I]
        if(item.memory._move !== undefined ) {
            if(item.memory._move.path!==item.memory._lastpath) {
            if(Memory.pathIntents[item.memory._move.path] === undefined) {
                Memory.pathIntents[item.memory._move.path] = {
                    path: item.memory._move.path,
                    room: item.memory._move.room,
                    usage: 0,
                    decay: 0,
                }
            }
            if(Memory.pathIntents[item.memory._move.path] !== undefined) {
                Memory.pathIntents[item.memory._move.path].usage+=1
                item.memory._lastpath = item.memory._move.path
            }
        }
        }
    }
}
pathDetector.prototype.update = function() {
    this.newRoadDetection()
    for(let I in Memory.pathIntents) {
        try {
        let item = Memory.pathIntents[I]
        item.decay+=1
        if(item.decay == 60) {
            item = false
        }
        if(item.usage > 5) {
            this.road(Room.deserializePath(item.path),item.room)
        }
        if(item !== false) {Memory.pathIntents[I] = item} else {Memory.pathIntents.splice(I);return}
    } catch(e) {}
    }
}
pathDetector.prototype.road = function(ra,r) {
    try {
        for(let I in ra) {
            let item = ra[I]
            Game.rooms[r].createConstructionSite(item.x,item.y,STRUCTURE_ROAD)
        }
    } catch(e) {}
}
pathDetector.prototype.applyFunctions = function() {

}
export default new pathDetector()
