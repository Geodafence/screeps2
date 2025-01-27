import { StructureTerminal } from "../../typings/structure";
import { removerequests, sendrequest } from "./item-request-lib";
    export function calcpricefor(type:ResourceConstant) {
        //Outlier prevention doesn't work!
        //let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: type});
        let orders = Game.market.getHistory(type);
        let price = 0
        let points = 0
        for(let cost in orders) {
            points+=1
            price+=orders[cost].avgPrice
        }
        /*
        Outlier prevention doesn't work!

        for(let cost in orders) {
            let preventoutliers=Math.ceil(price/points)
            if(preventoutliers) {
                console.log(preventoutliers)
                if(orders[cost].price<=preventoutliers+6&&orders[cost].price>=preventoutliers-6) {
                    points+=1
                    price+=orders[cost].price
                } else {
                }
            } else {
                if(orders[cost].price<200) {
                    points+=1
                    price+=orders[cost].price
                }
            }
        }*/
        let val = Math.ceil(price/points)
        return val
    }
    export function getBuysInRange (val:number,type:ResourceConstant,build:StructureTerminal) {
        let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: type});
        let validorders=[]
        for(let item in orders) {
            let dict = orders[item]
            if(dict.roomName!==undefined&&dict.price>=val&&dict.remainingAmount<5000&&Game.market.calcTransactionCost(dict.remainingAmount, build.room.name, dict.roomName)<=900) {
                validorders.push(dict)
            }
        }
        validorders.sort((a,b)=> b.price-a.price)
        return validorders
    }
    export function getBestDeal (build:StructureTerminal,type:ResourceConstant) {
        let range = calcpricefor(type)
        let best = getBuysInRange(range,type,build)[0]
        if(best===undefined) {
            //ok that didn't work, retrying with a lower price range
            range-=3
            best = getBuysInRange(range,type,build)[0]
        }
        if(best===undefined) {
            //still?! Trying even lower
            range-=2
            best = getBuysInRange(range,type,build)[0]
        }
        return best
    }
    /**
     *
     * @param {StructureTerminal} building
     */
    export function tick(building:StructureTerminal) {
        if(global.restartEco!==undefined) {
            return
        }
        if(Memory.structures===undefined) {
            Memory.structures = {}
        }
        if(Memory.structures[building.id]===undefined) {
            Memory.structures[building.id]={}
        }
        if(Memory.structures[building.id].marketStatus===undefined) {
            Memory.structures[building.id].marketStatus=getBestDeal(building,RESOURCE_OXYGEN)
            if(Memory.structures[building.id].marketStatus!==undefined) {
                removerequests(building)
                //@ts-ignore
                sendrequest(building,Memory.structures[building.id].marketStatus.remainingAmount,RESOURCE_OXYGEN,"grab")
                //@ts-ignore
                sendrequest(building,Game.market.calcTransactionCost(Memory.structures[building.id].marketStatus.remainingAmount,building.room.name,Memory.structures[building.id].marketStatus.roomName),RESOURCE_ENERGY,"grab")
            }
        } else {
            //@ts-ignore
            if(Game.market.getOrderById(Memory.structures[building.id].marketStatus.id)===undefined) {
                Memory.structures[building.id].marketStatus = undefined
            }
            //@ts-ignore
            if(building.store[RESOURCE_OXYGEN] >= Memory.structures[building.id].marketStatus.remainingAmount
                //@ts-ignore
                && building.store[RESOURCE_ENERGY] >= Game.market.calcTransactionCost(Memory.structures[building.id].marketStatus.remainingAmount, building.room.name, Memory.structures[building.id].marketStatus.roomName)) {
                    //@ts-ignore
                 Game.market.deal(Memory.structures[building.id].marketStatus.id, Memory.structures[building.id].marketStatus.remainingAmount, building.room.name);
                 Memory.structures[building.id].marketStatus=undefined
             }
        }
    }
