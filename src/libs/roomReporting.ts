
/**
 * Formats an item in a way that makes it suitable for end-of-tik reporting
 * It also pushes the return value to printQueue
 * sets it up as such:
 * [<ROOM>] Report ------------ tick <(currentTime)>
 */
function formatHeader(roomName:string) {
    if(global.printQueue===undefined) global.printQueue = []
    global.printQueue.push(`[${roomName}] Report ------------ tick <${Game.time}>`)
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
    global.printQueue.push(`[${roomName}]|||IMPORTANT|||\n${info}`)
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
    global.printQueue.push(`[${roomName}] ${info}`)
    return `[${roomName}] ${info}`
}

/**
 * flushes the print queue. Call at the end of a tick
 */
function flush() {
    if(global.printQueue===undefined) global.printQueue = []
    for(let print of global.printQueue) {
        console.log(print)
    }
    global.printQueue=[]
}
export interface report {
    /**
     * Formats an item in a way that makes it suitable for end-of-tik reporting
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
