

import { RoomObject } from "../../typings/room-object";
import { AnyOwnedStructure, Structure } from "../../typings/structure";
function flee(creep:Creep, goal:RoomObject) {
    let goals = [{ pos: goal.pos, range: 3 }];
    let ret =  PathFinder.search(
    creep.pos, goals,
    {
      // We need to set the defaults costs higher so that we
      // can set the road cost lower in `roomCallback`
      plainCost: 2,
      swampCost: 100,
      flee: true,
      maxRooms: 1,

      roomCallback: function(roomName) {

        let room = Game.rooms[roomName];
        // In this example `room` will always exist, but since
        // PathFinder supports searches which span multiple rooms
        // you should be careful!
        if (!room) return false;
        let costs = new PathFinder.CostMatrix;

        room.find(FIND_STRUCTURES).forEach(function(struct) {
          if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
          } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                     (struct.structureType !== STRUCTURE_RAMPART ||
                      !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
          }
        });

        // Avoid creeps in the room
        room.find(FIND_CREEPS).forEach(function(creep) {
          costs.set(creep.pos.x, creep.pos.y, 0xff);
        });

        return costs;
      },
    }
  );
  let pos = ret.path[0];
  creep.move(creep.pos.getDirectionTo(pos));
  return ret
}
function combatCalc(creep:Creep,target:RoomObject) {
    if(creep.getActiveBodyparts(HEAL) > 0&&creep.saying !== "ATTACK"&&creep.hits<creep.hitsMax)  {
        creep.heal(creep)
    }
    if(creep.saying === undefined) {
        var lastAction = "none"
    } else {
        var lastAction = creep.saying
    }

    if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            if(creep.pos.getRangeTo(target) < 3) {
                let hide = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter: (structure:Structure) => {
                    return structure.structureType == STRUCTURE_RAMPART
                }})
                if(hide.length > 0) {
                    creep.moveTo(hide[0])
                } else {
                    flee(creep,target)
                }
            }
            if(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3,{filter: function(creep:Creep) {
                return creep.owner.username !== "chungus3095"
            }}).length > 1) {
                creep.rangedMassAttack()
            } else creep.rangedAttack(target)
            if(creep.pos.getRangeTo(target) > 3) {
            creep.moveTo(target)
            }
        creep.say("RANGED_ATTACK")
    }
        if(creep.getActiveBodyparts(ATTACK) > 0) {
            if((creep.attack(target) == ERR_NOT_IN_RANGE)) {
                creep.moveTo(target)
                creep.say("ATTACK")
            }
        }

}
    /**
     *
     * @param {Creep} creep
     * @returns
     */
    export function run(creep:Creep) {
        if(Game.flags.attack === undefined) {
            var closestHostile:RoomObject|Creep|null = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: function(creep:Creep) {
                return creep.owner.username !== "chungus3095"
            }});
            if(!closestHostile) {
                closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter: function(creep:Structure) {
                    //@ts-ignore
                    return creep.owner.username !== "chungus3095"
                }});
            }
            if (closestHostile) {
                creep.memory.stopmoving = 0;
                combatCalc(creep, closestHostile)
                return
            }
            if(creep.getActiveBodyparts(HEAL) > 0&&creep.saying !== "ATTACK"&&creep.hits<creep.hitsMax)  {
                creep.heal(creep)
            }
            // Patrolling behavior
            if (creep.memory.patrolling === undefined) {
                var targetRoom: {
                    room: string;
                    usedSegment: number;
                };
                var targetCreep
                do {
                    targetRoom = Memory.miningrooms[Math.floor(Math.random() * Memory.miningrooms.length)];
                    targetCreep = new RoomPosition(25,25,targetRoom.room)
                } while (targetRoom === creep.memory.lastRoom);

                creep.memory.targetCreeps = targetCreep
                creep.memory.patrolling = targetRoom;
                creep.memory.lastRoom = targetRoom;
                creep.memory.defenseoverride = 0
                creep.memory.wait = 0;
                creep.memory.TX = undefined
            }
            if((creep.memory.defenseoverride == 0 || creep.memory.defenseoverride === undefined)&&Memory.defenserequests.length > 0) {
                let respond = Memory.defenserequests.pop()
                creep.memory.TX = respond.x; creep.memory.TY = respond.y
                creep.memory.roomname = respond.room
                creep.memory.defenseoverride = 1
                creep.memory.wait=0
            }
            if(creep.memory.roomname === undefined) creep.memory.roomname = creep.memory.patrolling.room
            if(creep.memory.TX === undefined) {
                creep.memory.TX = 25
                creep.memory.TY = 25
            }
            //@ts-ignore
            creep.moveTo(new RoomPosition(creep.memory.TX,creep.memory.TY,creep.memory.roomname),{reusePath: 100,stroke: '#ff0000'})
            //@ts-ignore
            creep.memory.wait = creep.memory.wait!==undefined ? creep.memory.wait : 0
            creep.memory.wait+=1
            if(creep.memory.wait > 120) {
                creep.memory.patrolling = undefined
            }
    } else {
        let theif
        if(Game.flags.attack.room === undefined) {
            theif = 1
        } else {
            theif = (Game.flags.attack.room.name !== creep.room.name)
        }
        if(theif) {
            creep.moveTo(Game.flags.attack,{reusePath: 200,stroke: '#ff0000'})
        } else {
            let target1 = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: function(creep:Creep) {
                return creep.owner.username !== "chungus3095"
            }});
            let target2 = creep.room.find(FIND_HOSTILE_STRUCTURES);
            for(const t in target2) {
                let I = target2[t]
                if(I.structureType == STRUCTURE_TOWER&&creep.room.find(FIND_HOSTILE_CREEPS,{filter: function(crep) {
                    return (crep.getActiveBodyparts(ATTACK) > 0|| crep.getActiveBodyparts(RANGED_ATTACK) > 0) && crep.owner.username !== "chungus3095";
                }}).length==0) {
                    target1 = null
                    target2 = [I]
                    break
                }
            }
            if(target1) {
                combatCalc(creep, target1)
            } else {
                let target2:AnyOwnedStructure|AnyOwnedStructure[] = creep.room.find(FIND_HOSTILE_STRUCTURES);
                if(target2[0].structureType === STRUCTURE_CONTROLLER) {
                    target2 = target2[1]
                } else {
                    target2 = target2[0]
                }
                combatCalc(creep, target2)
            }
        }
    }
    }

