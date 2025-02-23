

import { RoomObject } from "../../typings/room-object";
import { AnyOwnedStructure, Structure } from "../../typings/structure";
import { strengthCalc } from "../libs/combatLibs/calcCreepPower";
import { report } from "../libs/roomReporting"
import { Allies } from "../libs/allyLibs/allyConsts"

const StrCalc = new strengthCalc()
function flee(creep:Creep, goal:RoomObject,range:number=6) {
    //@ts-ignore
    let goals = { pos: goal.pos, range: range };
    let ret = PathFinder.search(creep.pos, goals, {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 10,
        flee: true,

        roomCallback: function (roomName) {
            let room = Game.rooms[roomName];
            // In this example `room` will always exist, but since
            // PathFinder supports searches which span multiple rooms
            // you should be careful!
            if (!room) return new PathFinder.CostMatrix();
            let costs = new PathFinder.CostMatrix();

            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (
                    struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
                ) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                }
            });

            // Avoid creeps in the room
            room.find(FIND_CREEPS).forEach(function (creep) {
                costs.set(creep.pos.x, creep.pos.y, 0xff);
            });

            return costs;
        }
    });
    let pos = ret.path[0];
    return ret.path;
}
export function combatCalc(creep:Creep,target:RoomObject,bescared=true) {
    if(creep.getActiveBodyparts(HEAL) > 0&&creep.saying !== "ATTACK")  {
        if(creep.hits<creep.hitsMax) {
            creep.heal(creep)
        } else {
            let targetCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter:(a)=>{
                return (a.getActiveBodyparts(ATTACK)>0||a.getActiveBodyparts(RANGED_ATTACK)>0||a.getActiveBodyparts(HEAL)>0)&&
                a.hits<a.hitsMax
            }})
            if(targetCreep) {
                if(creep.heal(targetCreep)===ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetCreep)
                }
            }
        }
    }
    if(creep.saying === undefined) {
        var lastAction = "none"
    } else {
        var lastAction = creep.saying
    }
    if(StrCalc.canWinRoom(creep.room)===false&&bescared) {
        creep.moveByPath(flee(creep,target,6))

            let alreadyrequested = -1;
            for (let temp in Memory.triorequests) {
                if (Memory.triorequests[temp].roomName == creep.room.name) {
                    alreadyrequested = 1;
                }
            }
            if (alreadyrequested == -1&&(creep.room.controller?.level??0)<1) {
                Memory.triorequests.push(creep.pos);
            }
        return
    }
    if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            if(creep.pos.getRangeTo(target) < 2) {
                let hide = creep.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: (structure:Structure) => {
                    return structure.structureType == STRUCTURE_RAMPART
                }})
                if(hide.length > 0) {
                    creep.moveTo(hide[0])
                } else if(creep.getActiveBodyparts(ATTACK) === 0){
                    creep.moveByPath(flee(creep,target,3))
                }
            }
            if(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3,{filter: function(creep:Creep) {
                return Allies.indexOf(creep.owner.username) === -1
            }}).length > 10) {
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

        if((Game.flags.attack === undefined&&creep.memory.cachTarget===undefined)||creep.memory.defenseoverride===1) {
            var closestHostile:Creep|Creep[]|RoomObject[]|RoomObject|null = creep.room.find(FIND_HOSTILE_CREEPS,{filter: function(creep:Creep) {
                return Allies.indexOf(creep.owner.username) === -1
            }})
            .sort((a,b)=>(a.pos.getRangeTo(creep)+
            (Number(a.getActiveBodyparts(ATTACK)>0||a.getActiveBodyparts(RANGED_ATTACK)>0||a.getActiveBodyparts(HEAL)>0)*70))

            -(b.pos.getRangeTo(creep)+
            (Number(b.getActiveBodyparts(ATTACK)>0||b.getActiveBodyparts(RANGED_ATTACK)>0||b.getActiveBodyparts(HEAL)>0)*70))
            );
            closestHostile = closestHostile[0]
            if(!closestHostile) {
                closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter: function(creep:Structure) {
                    //@ts-ignore
                    return Allies.indexOf(creep.owner.username) === -1&&creep.structureType!==STRUCTURE_POWER_BANK
                }});
            }
            if (closestHostile&&(creep.room.name===creep.memory.roomname||creep.memory.defenseoverride===0)) {
                creep.memory.stopmoving = 0;
                //@ts-ignore
                combatCalc(creep, closestHostile)
                return
            } else if(creep.getActiveBodyparts(HEAL)>0){
                let Tcreep = creep.room.find(FIND_MY_CREEPS,{filter:(a)=>
                    a.hits<a.hitsMax
                })
                report.formatBasic("*",JSON.stringify(Tcreep))
                if(Tcreep.length>0) {
                    if(creep.heal(Tcreep[0])!==OK) {
                        creep.moveTo(Tcreep[0])
                    }
                }
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
            if(creep.room.name===creep.memory.roomname) {
                creep.memory.wait+=10
            }
            if(creep.memory.wait > 120) {
                creep.memory.patrolling = undefined
            }
    } else {
        if((creep.memory.defenseoverride == 0 || creep.memory.defenseoverride === undefined)&&Memory.defenserequests.length > 0) {
            let respond = Memory.defenserequests.pop()
            creep.memory.TX = respond.x; creep.memory.TY = respond.y
            creep.memory.roomname = respond.room
            creep.memory.defenseoverride = 1
            creep.memory.wait=0
        }
        if(creep.memory.cachTarget!==undefined) {
            //@ts-ignore
            var theFlag = new RoomPosition(creep.memory.cachTarget.x,creep.memory.cachTarget.y,creep.memory.cachTarget.roomName)
        } else {
            var theFlag = Game.flags.attack.pos
            //@ts-ignore
            creep.memory.cachTarget = theFlag
        }
        let theif
        theif = (theFlag.roomName !== creep.room.name)

        if(theif) {
            creep.moveTo(theFlag,{reusePath: 200,stroke: '#ff0000'})
            let target1 = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: function(creep:Creep) {
                return Allies.indexOf(creep.owner.username) === -1&&
                (creep.getActiveBodyparts(ATTACK)>0||creep.getActiveBodyparts(RANGED_ATTACK)>0||creep.getActiveBodyparts(HEAL)>0)
            }});
            if(creep.memory.targetCreep===undefined) {
                //@ts-ignore
                creep.memory.targetCreep = target1?.id
            }
            if(creep.memory.targetCreep!==undefined) {
                //@ts-ignore
                target1 = Game.getObjectById(creep.memory.targetCreep)
            }
            if(target1) {
                combatCalc(creep,target1)
            }
            if(Game.time%3===0) {
                creep.memory.targetCreep = undefined
            }
        } else {
            let sort = creep.room.find(FIND_HOSTILE_CREEPS,{filter: function(creep:Creep) {
                return Allies.indexOf(creep.owner.username) === -1
            }})
            .sort((a,b)=>(b.pos.getRangeTo(creep)+
            (Number(b.getActiveBodyparts(ATTACK)>0||b.getActiveBodyparts(RANGED_ATTACK)>0||b.getActiveBodyparts(HEAL)>0)*70))

            -(a.pos.getRangeTo(creep)+
            (Number(a.getActiveBodyparts(ATTACK)>0||a.getActiveBodyparts(RANGED_ATTACK)>0||a.getActiveBodyparts(HEAL)>0)*70))
            )
            let target1:Creep|null = sort[0]
            let target2 = creep.room.find(FIND_HOSTILE_STRUCTURES);
            for(const t in target2) {
                let I = target2[t]
                if(I.structureType == STRUCTURE_TOWER&&creep.room.find(FIND_HOSTILE_CREEPS,{filter: function(crep) {
                    return (crep.getActiveBodyparts(ATTACK) > 0|| crep.getActiveBodyparts(RANGED_ATTACK) > 0) && Allies.indexOf(crep.owner.username) === -1;
                }}).length==0) {
                    target1 = null
                    target2 = [I]
                    break
                }
            }
            if(target1) {
                if(creep.memory.targetCreep===undefined) {
                    //@ts-ignore
                    creep.memory.targetCreep = target1?.id
                }
                if(creep.memory.targetCreep!==undefined) {
                    //@ts-ignore
                    target1 = Game.getObjectById(creep.memory.targetCreep)
                }
                //@ts-ignore
                combatCalc(creep, target1)
                if(Game.time%3===0) {
                    creep.memory.targetCreep = undefined
                }
            } else {
                let target2:AnyOwnedStructure|AnyOwnedStructure[] = creep.room.find(FIND_HOSTILE_STRUCTURES);
                if(target2[0]!==undefined) {
                if(target2[0].structureType === STRUCTURE_CONTROLLER) {
                    target2 = target2[1]
                } else {
                    target2 = target2[0]
                }
                combatCalc(creep, target2)
                } else if(creep.getActiveBodyparts(HEAL)>0){
                    let Tcreep = creep.room.find(FIND_MY_CREEPS,{filter:(a)=>a.hits<a.hitsMax
                    })
                    report.formatBasic("*",JSON.stringify(Tcreep))
                    if(Tcreep.length>0) {
                        if(creep.heal(Tcreep[0])!==OK) {
                            creep.moveTo(Tcreep[0])
                        }
                    }
                }
            }
        }
    }
    }

