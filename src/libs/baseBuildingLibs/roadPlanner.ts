/**
 * Places a road, with a list of specified goals.
 * @param {RoomPosition} start The starting position
 * @param {RoomPosition[]} goals The goals to reach.
 * @param {Boolean} efficent If the road planner should be cpu efficent. Note that it gives AWFUL results while on.
 * @param {boolean} [autoPlaceRoads=true] If roads should auto be placed where it has planned. Creates construction sites.
 * @returns {"Invalid room!"|"No goals!"|"too many roads!"|RoomPosition[]} Error codes or an array of roomPositions representing where the roads were placed.
 */
export function useRoadPlanner(start:RoomPosition,goals:RoomPosition[],efficent:boolean,autoPlaceRoads:boolean): "Invalid room!"|"No goals!"|"too many roads!"|RoomPosition[]
/**
 * Places a road, with a list of specified goals.
 * @param {RoomPosition} start The starting position
 * @param {RoomPosition[]} goals The goals to reach.
 * @param {Boolean} efficent If the road planner should be cpu efficent. Note that it gives AWFUL results while on.
 * @param {boolean} [autoPlaceRoads=true] If roads should auto be placed where it has planned. Creates construction sites.
 * @returns {"Invalid room!"|"No goals!"|"too many roads!"|RoomPosition[]} Error codes or an array of roomPositions representing where the roads were placed.
 */
export function useRoadPlanner(start:RoomPosition,goals:RoomPosition[],efficent:boolean=false,autoPlaceRoads:boolean=true):"Invalid room!"|"No goals!"|"too many roads!"|RoomPosition[] {
    let room = Game.rooms[start.roomName];
    if (!room&&autoPlaceRoads) {
        console.log("(Geo's road planner) The roadplanner room "+start.roomName+" is not in game.rooms! Please gain visibility of the room")
        return "Invalid room!"
    }
    if (goals.length===0) {
        console.log("(Geo's road planner) You forgot goals!")
        return "No goals!"
    }
    let baseGoal = goals[0]
    let possibleRoads:RoomPosition[] = []
    let basePath = findShortestRoad(start,baseGoal,possibleRoads)
    let dist = 9999
    possibleRoads = possibleRoads.concat(basePath.path)
    if(efficent) {
        possibleRoads.reverse()
        console.log("(Geo's road planner) Efficent mode is being used, significantly less used cpu at the cost of awful results")
    } else {
        console.log("(Geo's road planner) Non efficent mode is being used. Be careful, this uses a significant amount of cpu!")
    }
    for(let goal of goals) {
        let orgp = findShortestRoad(start,goal,possibleRoads).path
        let shortestPath = orgp
        let length = orgp.length
        for(let road of possibleRoads) {
            if(efficent) {
                let testdist = Math.sqrt(Math.pow((road.x-goal.x),2)+Math.pow((road.y-goal.y),2))
                if(testdist<dist) {
                    let confirm = findShortestRoad(road,goal,possibleRoads).path
                    if(confirm.length<length) {
                        shortestPath = confirm
                        length = confirm.length
                        dist = testdist
                    }
                }
            } else {
                let confirm = findShortestRoad(road,goal,possibleRoads).path
                if(confirm.length<length) {
                    shortestPath = confirm
                    length = confirm.length
                }
            }
        }
        possibleRoads = possibleRoads.concat(shortestPath)
    }
    if(possibleRoads.length>100&&autoPlaceRoads) {
        console.log("(Geo's road planner) Cannot find a road path shorter than 100 roads!")
        return "too many roads!"
    }
    if(autoPlaceRoads) {
        for(let road of possibleRoads) {
            road.createConstructionSite(STRUCTURE_ROAD);
        }
    }
    return possibleRoads
}
/**
 * Helps with useRoadPlanner. Not used otherwise
 * @param {RoomPosition} start Start location
 * @param {RoomPosition} goal End location
 * @param {RoomPosition[]} placedRoads Previously placed road
 * @returns {PathFinderPath} PathFinderPath
 */
function findShortestRoad(start:RoomPosition,goal:RoomPosition,placedRoads:RoomPosition[]) {
    let ret = PathFinder.search(
        start, {pos:goal,range:1},
        {
          plainCost: 2,
          swampCost: 5,
          roomCallback: function(roomName) {
            let room = Game.rooms[roomName];
            //if (!room) return false;
            let costs = new PathFinder.CostMatrix;
            return costs;
          },
        }
      );
      return ret
}
