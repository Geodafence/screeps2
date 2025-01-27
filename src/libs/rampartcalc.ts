//@ts-nocheck
function findOptimalRamparts(room) {
    const spawn = room.getMasterSpawn();
    if (!spawn) {
        console.log(`No master spawn found in room ${room.name}`);
        return [];
    }

    const terrain = new Room.Terrain(room.name);
    const entrances = findRoomEntrances(room, terrain);
    const graph = buildGraph(room, spawn.pos, entrances, terrain);

    const minCut = calculateMinCut(graph, spawn.pos, entrances);

    return minCut;
}

function findRoomEntrances(room, terrain) {
    const entrances = [];

    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

            const isEdge = x === 0 || x === 49 || y === 0 || y === 49;
            if (isEdge) {
                entrances.push(new RoomPosition(x, y, room.name));
            }
        }
    }

    return entrances;
}

function buildGraph(room, spawnPos, entrances, terrain) {
    const graph = {};

    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

            const posKey = `${x},${y}`;
            graph[posKey] = [];

            const neighbors = getNeighbors(x, y, terrain);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                graph[posKey].push(neighborKey);
            }
        }
    }

    return graph;
}

function getNeighbors(x, y, terrain) {
    const deltas = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];

    const neighbors = [];

    for (const delta of deltas) {
        const nx = x + delta.dx;
        const ny = y + delta.dy;

        if (nx < 0 || nx > 49 || ny < 0 || ny > 49) continue;
        if (terrain.get(nx, ny) === TERRAIN_MASK_WALL) continue;

        neighbors.push({ x: nx, y: ny });
    }

    return neighbors;
}

function calculateMinCut(graph, spawnPos, entrances) {
    const source = "source";
    const sink = "sink";

    const edges = {};

    // Add edges from entrances to source
    for (const entrance of entrances) {
        const key = `${entrance.x},${entrance.y}`;
        edges[source] = edges[source] || {};
        edges[source][key] = 1; // Capacity of 1
    }

    // Add edges from graph to spawn
    for (const [node, neighbors] of Object.entries(graph)) {
        for (const neighbor of neighbors) {
            edges[node] = edges[node] || {};
            edges[node][neighbor] = 1; // Capacity of 1
        }

        if (node === `${spawnPos.x},${spawnPos.y}`) {
            edges[node] = edges[node] || {};
            edges[node][sink] = Infinity; // Unlimited capacity to sink
        }
    }

    return edmondsKarp(edges, source, sink);
}

function edmondsKarp(edges, source, sink) {
    const flows = {};

    function bfs() {
        const queue = [source];
        const parents = {};
        parents[source] = null;

        while (queue.length > 0) {
            const node = queue.shift();

            if (node === sink) {
                return parents;
            }

            for (const neighbor in (edges[node] || {})) {
                if (!parents.hasOwnProperty(neighbor) && (edges[node][neighbor] - ((flows[node] && flows[node][neighbor]) || 0)) > 0) {
                    parents[neighbor] = node;
                    queue.push(neighbor);
                }
            }
        }

        return null;
    }

    function augmentPath(parents) {
        let pathFlow = Infinity;
        let current = sink;

        while (parents[current] !== null) {
            const prev = parents[current];
            const capacity = edges[prev][current] - ((flows[prev] && flows[prev][current]) || 0);
            pathFlow = Math.min(pathFlow, capacity);
            current = prev;
        }

        current = sink;
        while (parents[current] !== null) {
            const prev = parents[current];
            flows[prev] = flows[prev] || {};
            flows[current] = flows[current] || {};

            flows[prev][current] = (flows[prev][current] || 0) + pathFlow;
            flows[current][prev] = (flows[current][prev] || 0) - pathFlow;

            current = prev;
        }

        return pathFlow;
    }

    while (true) {
        const parents = bfs();
        if (!parents) break;
        augmentPath(parents);
    }

    const minCut = [];
    const visited = new Set();

    function dfs(node) {
        visited.add(node);
        for (const neighbor in (edges[node] || {})) {
            if (!visited.has(neighbor) && (edges[node][neighbor] - ((flows[node] && flows[node][neighbor]) || 0)) > 0) {
                dfs(neighbor);
            }
        }
    }

    dfs(source);

    for (const node of visited) {
        for (const neighbor in (edges[node] || {})) {
            if (!visited.has(neighbor)) {
                minCut.push(node);
            }
        }
    }

    // Log the minCut values to see what's inside
    console.log('MinCut:', minCut);

    return minCut.map(pos => {
        if (pos) {
            // Ensure the position is valid and in the expected format
            console.log(`Processing position: ${pos}`);

            const parts = pos.split(",");
            if (parts.length === 3) {
                const [x, y, roomName] = parts.map(Number);
                return new RoomPosition(x, y, roomName);
            } else {
                console.log(`Invalid position format: ${pos}`);
                return null; // Or handle as needed
            }
        } else {
            console.log('Invalid position (undefined or null):', pos);
            return null; // Handle invalid positions
        }
    }).filter(pos => pos !== null); // Filter out invalid positions
}

export const findOptimalRamparts = findOptimalRamparts;
