
/**
 * Formats an item in a way that makes it suitable for end-of-tik reporting
 * It also pushes the return value to printQueue
 * sets it up as such:
 * [<ROOM>] Report ------------ tick <(currentTime)>
 */
function formatHeader(roomName:string) {
    if(global.printQueue===undefined) global.printQueue = []
    global.printQueue.push({
        headerdata:{roomname:roomName,isglobal:true},
        msg:`[${roomName}] Report ------------ tick <${Game.time}>`,
    })
    return `Report room ${roomName} ------------ tick <${Game.time}>`
}

/**
 * formats a item in such a way that it is labled as important info.
 * It also pushes the return value to printQueue
 * Sets it up as such:
 * [<roomName>]|||IMPORTANT|||\n
 * <info>
 */
function formatImportant(roomName:string,info:string) {
    if(global.printQueue===undefined) global.printQueue = []
    global.printQueue.push({msg:`[${roomName}]|||IMPORTANT|||\n${info}`})
    return `[${roomName}]|||IMPORTANT|||\n${info}`
}

/**
 * formats a item in such a way that it looks like a subreport of the headder
 * It also pushes the return value to printQueue
 * Sets it up as such:
 * [<roomName>] <info>
 */
function formatBasic(roomName:string,info:string) {
    if(global.printQueue===undefined) global.printQueue = []
    global.printQueue.push({msg:`[${roomName}] ${info}`})
    return `[${roomName}] ${info}`
}

/**
 * flushes the print queue. Call at the end of a tick
 */
function flush() {
    if(global.printQueue===undefined) global.printQueue = []
    let startPos = [1,3]
    let curRoom = ""
    let rectSize = 0
    let rectWidth = 0
    let sizeArr = []
    let globalApp = []
    for(let print of global.printQueue) {
        if(curRoom==="*") {
            globalApp.push({msg:print.msg})
        }
        if(print.headerdata?.isglobal) {
            curRoom = print.headerdata.roomname
            sizeArr = []; rectSize = 0; rectWidth = 0; startPos = [1,3]
        }
    }
    startPos = [1,3]
    curRoom = ""
    rectSize = 0
    rectWidth = 0
    sizeArr = []
    for(let print of global.printQueue) {
        if(print.headerdata?.isglobal) {
            if(curRoom!=="") {
                sizeArr = [];
                for(let I of globalApp) {
                    if(I.msg!==undefined) {
                        new RoomVisual(curRoom).text(I.msg,startPos[0],startPos[1],{align:"left"})
                        sizeArr.push(I.msg.length*0.6)
                        rectSize = Math.max(...sizeArr)
                        rectWidth+=1
                        startPos[1]+=1
                    }
                }
                //new RoomVisual(curRoom).rect(1,3,rectSize,rectWidth)
            }
            curRoom = print.headerdata.roomname
            rectSize = 0; rectWidth = 0; startPos = [1,3]
        }
        if(print.msg!==undefined&&curRoom !== "") {
            new RoomVisual(curRoom).text(print.msg,startPos[0],startPos[1],{align:"left"})
            sizeArr.push(print.msg.length*0.6)
            rectSize = Math.max(...sizeArr)
            rectWidth+=1
            startPos[1]+=1
        }
    }
    global.printQueue=[]
}
export interface report {
    /**
     * Formats an item in a way that makes it suitable for end-of-tick reporting
     * It also pushes the return value to printQueue
     * sets it up as such:
     * [<ROOM>] Report ------------ tick <(currentTime)>
     */
    formatHeader(roomName:string): string;


    /**
     * formats a item in such a way that it looks like a subreport of the headder
     * It also pushes the return value to printQueue
     * Sets it up as such:
     * [<roomName>] <info>
     */
    formatBasic(roomName:string,info:string): string

    /**
     * formats a item in such a way that it is labled as important info.
     * It also pushes the return value to printQueue
     * Sets it up as such:
     * [<roomName>]|||IMPORTANT|||\n
     * <info>
     */
    formatImportant(roomName:string,info:string): string;

    /**
     * flushes the print queue. Call at the end of a tick
     */
    flush(): void;
}
export const report:report = {
    formatHeader:formatHeader,
    formatBasic:formatBasic,
    formatImportant:formatImportant,
    flush:flush,
}
