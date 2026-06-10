Goals
-
- Major additions that must be done in order.
1. Add remote mining.
   1. [X] Add scouting rooms
   2. [X] Add a task to check for viable remote rooms
   3. [X] Add remote miners
   4. [X] Add remote haulers
   5. [ ] Maybe add remote miners placing containers?
2. Add basic tower functionality
   1. [X] Add towers as something that can be filled.
   2. [X] Add shooting enemy creeps
   3. [X] Add healing damaged buildings
3. Add Queens after storage is built
   1. [X] Make haulers deposit to storage, if available.
   2. [X] Add a spawnqueen function when storage is available.
   3. [X] Make queens grab energy and fill extensions, spawns, and towers.
   4. [X] Make upgraders and builders grab from storages instead.
   5. [ ] Maybe remove the container when storage exists?
4. Add support for additional rooms
   1. [ ] Empty plan

Additional
-
- optimizations/additions to existing code. Order does not matter.
1. Add road planning to controller.
   1. [ ] Append a thing to the build planner that makes an exception for some roads
   2. [ ] Make something that pathfinds from spawn to controller.
2. Add reservers to remotes
   1. [ ] Empty plan

Errors
-
- Problems, duh.

1. At random points in time, cpu usage explodes to ridiculous amounts.
   1. Possibly from pathfinding.
   2. Possibly from tasks duplicating to extreme amounts.
   3. Good chance it's from scouts.
