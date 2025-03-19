import { Structure } from "../../../typings/structure";

export function buildRamparts(pos:Structure) {
        // example call
        let tempPos = pos
        let tempwalls = floodFillingWalls(tempRoomMaps(tempPos.room.name), 250, tempPos.pos, 0.5);
        let iter = 1
        for(let I of tempwalls) {
            iter += 1;
            iter = iter>3?1:iter
            let loc = new RoomPosition(I[0],I[1],tempPos.room.name);
            let E = true
            for(let i of loc.look()) {
                if(i.type == LOOK_STRUCTURES || i.type === LOOK_CONSTRUCTION_SITES ) {
                    E = false
                 }
            }
            if(E) {
                let site = iter==2?STRUCTURE_RAMPART:STRUCTURE_WALL
                console.log(site)
                loc.createConstructionSite(site);
            }
        }
}

export function floodFillingWalls(roomMap:{[x:number]:{[y:number]:number}}, saved:number, defendPoint:RoomPosition, lengthCost:number) {
    let walls = [];
    let defended = 2500;
    let roomName = defendPoint.roomName;
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if(roomMap[x][y] == 3){
                for (let dx = -1; dx < 2; dx++) {
                    for (let dy = -1; dy < 2; dy++) {
                        const xTotal = x + dx;
                        const yTotal = y + dy;
                        if(xTotal < 50 && xTotal > -1){
                            if(yTotal < 50 && yTotal > -1){
                                if(roomMap[xTotal][yTotal] == 2){
                                    roomMap[xTotal][yTotal] = 1;
                                    walls.push([xTotal, yTotal, 8]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    let lowestWalls = JSON.parse(JSON.stringify(walls));
    let counting = 2500;
    for (let c = 0; c < 3; c++) {
        if(c == 0){
            for(let wall in walls){
                let addedPos = 0;
                for (let dx = -1; dx < 2; dx++) {
                    for (let dy = -1; dy < 2; dy++) {
                        const xTotal = walls[wall][0] + dx;
                        const yTotal = walls[wall][1] + dy;
                        if(roomMap[xTotal][yTotal] == 2){
                            addedPos = addedPos + 1;
                        }
                    }
                }
                if(addedPos == 0){
                    roomMap[walls[wall][0]][walls[wall][1]] = 3;
                    //@ts-ignore
                    walls.splice(wall, 1);
                    //@ts-ignore
                    wall--;
                }
                else{
                    walls[wall][2] = addedPos;
                }
            }
        }
        else if(c == 1){
            let wallsAdded = false
            for(let wall in walls){
                if(walls[wall][2] == 1){
                    wallsAdded = true;
                    for (let dx = -1; dx < 2; dx++) {
                        for (let dy = -1; dy < 2; dy++) {
                            const xTotal = walls[wall][0] + dx;
                            const yTotal = walls[wall][1] + dy;
                            if(roomMap[xTotal][yTotal] == 2){
                                roomMap[walls[wall][0]][walls[wall][1]] = 3;
                                //@ts-ignore
                                walls.splice(wall, 1);
                                //@ts-ignore
                                wall--;
                                dx = 2;
                                dy = 2;
                                let newNumber = 0;
                                roomMap[xTotal][yTotal] = 1;
                                for (let nx = -1; nx < 2; nx++) {
                                    for (let ny = -1; ny < 2; ny++) {
                                        const nxTotal = xTotal + nx;
                                        const nyTotal = yTotal + ny;
                                        if(roomMap[nxTotal][nyTotal] == 2){
                                            newNumber = newNumber + 1;
                                        }
                                    }
                                }
                                walls.push([xTotal, yTotal, newNumber]);
                            }
                        }
                    }
                }
            }
            if(wallsAdded == true){
                if(counting > 0){
                    counting = counting - 1;
                    c = -1;
                }
            }
        }
        else if(c == 2){
            if(walls.length > 0){
                walls = findFurthestCoordinateIndex();
                if(defended < saved){
                    return lowestWalls;
                }
                if(walls.length < lowestWalls.length){
                    lowestWalls = JSON.parse(JSON.stringify(walls));
                }
                let toRemove = findLargestThirdElement(walls);
                let largestCord = walls[toRemove];
                roomMap[largestCord[0]][largestCord[1]] = 3;
                walls.splice(toRemove, 1);
                for (let dx = -1; dx < 2; dx++) {
                    for (let dy = -1; dy < 2; dy++) {
                        const xTotal = largestCord[0] + dx;
                        const yTotal = largestCord[1] + dy;
                        if(roomMap[xTotal][yTotal] == 2){
                            let newNumber = 0;
                            roomMap[xTotal][yTotal] = 1;
                            for (let nx = -1; nx < 2; nx++) {
                                for (let ny = -1; ny < 2; ny++) {
                                    const nxTotal = xTotal + nx;
                                    const nyTotal = yTotal + ny;
                                    if(roomMap[nxTotal][nyTotal] == 2){
                                        newNumber = newNumber + 1;
                                    }
                                }
                            }
                            walls.push([xTotal, yTotal, newNumber]);
                        }
                    }
                }
                if(counting > 0){
                    counting = counting - 1;
                    c = -1;
                }
            }
        }
    }

    function findFurthestCoordinateIndex() {
        let tempMap = JSON.parse(JSON.stringify(roomMap));
        let defenedPos = 1;
        let counting = 0;
        let toCheck = [];
        let walls = [];
        toCheck.push([defendPoint.x,defendPoint.y]);
        tempMap[defendPoint.x][defendPoint.y] = 0;
        while(toCheck.length > 0){
            counting = counting + 1;
            for (let dx = -1; dx < 2; dx++) {
                for (let dy = -1; dy < 2; dy++) {
                    //@ts-ignore
                    const xTotal = toCheck[0][0] + dx;
                    //@ts-ignore
                    const yTotal = toCheck[0][1] + dy;
                    if(tempMap[xTotal][yTotal] == 2){
                        defenedPos = defenedPos + 1;
                        tempMap[xTotal][yTotal] = 0;
                        toCheck.push([xTotal,yTotal]);
                    }
                    else if(tempMap[xTotal][yTotal] == 1){
                        let wallHere = [];
                        tempMap[xTotal][yTotal] = 0;
                        wallHere.push([xTotal,yTotal]);
                        for(let x = 0; x < 100; x++){
                            if(x < wallHere.length){
                                for (let nx = -1; nx < 2; nx++) {
                                    for (let ny = -1; ny < 2; ny++) {
                                        //@ts-ignore
                                        const nxTotal = wallHere[x][0] + nx;
                                        //@ts-ignore
                                        const nyTotal = wallHere[x][1] + ny;
                                        if(tempMap[nxTotal][nyTotal] == 1){
                                            wallHere.push([nxTotal,nyTotal]);
                                            tempMap[nxTotal][nyTotal] = 0;
                                        }
                                    }
                                }
                            }
                            else{
                                for(let wall of wallHere){
                                    walls.push([wall[0], wall[1], (x * lengthCost) + walls.length]);
                                }
                                x = 100;
                            }
                        }
                    }
                }
            }
            toCheck.shift();
            if(counting > 2500){
                toCheck = [];
                console.log('something broke in toCheck')
            }
        }
        defended = defenedPos;
        return walls;
    }

    function findLargestThirdElement(arrays:Array<Array<any>>) {
        let maxIndex = 0;
        let maxValue = arrays[0][2]; // Assume the first array has the largest third element

        for (let i = 1; i < arrays.length; i++) {
            if (arrays[i][2] > maxValue) {
                maxValue = arrays[i][2];
                maxIndex = i;
            }
        }

        return maxIndex;
    }

    console.log('something broke in floodFillingWalls');
}

export function tempRoomMaps(roomName:string) {
    const terrain = new Room.Terrain(roomName);

    // Initialize the 50x50 arrays
    const roomMap = Array.from({ length: 50 }, () => Array(50).fill(2));

    // Fill roomMap
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                roomMap[x][y] = 0;
            } else {
                if(y == 0 || y == 49 || x == 0 || x == 49){
                    for (let dx = -1; dx < 2; dx++) {
                        for (let dy = -1; dy < 2; dy++) {
                            const xTotal = x + dx;
                            const yTotal = y + dy;
                            if(xTotal < 50 && xTotal > -1){
                                if(yTotal < 50 && yTotal > -1){
                                    if(roomMap[xTotal][yTotal] != 0){
                                        roomMap[xTotal][yTotal] = 3;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Return the combined distances
    return roomMap;
}
