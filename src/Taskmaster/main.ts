import { Plan, planConstructor, taskBranch, taskTree } from "./planConstructor";
import { task, TaskMap, taskReturn } from "./taskdefs";
import { ConditionMap } from "./ConditionMap";

/** An internal function used to average out cpu usage from previous runs of a task */
function avg(array: any[]) {
    if (array === undefined) {
        array = []
    }
    array = array.length === 0 ? [0] : array
    return array.reduce((a, b) => a + b) / array.length;
}
const visuals = true;
interface Memory {

    Taskmaster: {
        storedTasks: Array<planConstructor>;
        activeTasks: Array<planConstructor>;
        cpuUsage: {[taskname:string]: number[]}
        cpuGiven: number,
        init: boolean,
    }
}
declare const Memory: Memory;

export class Taskmaster {
    memoryloc: { base: object; link: string };
    /**
     * Create a Taskmaster. Taskmasters manage tasks, sorting them by priority as well as dynamically running them with a cpu allocation and priority system.
     *
     * Taskmaster stores info in Memory.Taskmaster by default, but this can be edited
     * @param allocatedCpu The maximum amount of CPU per tick allocated to this Taskmaster instance.
     *
     * Leave some cpu under your max to prevent Taskmaster and other calculations from crashing
     * @param startingMemory An optional beginning list of tasks to init Taskmaster with.
     *
     * Note that if the memory pointer is already initalized, this will do nothing
     *
     *@param [memorybase=Memory] An optional param for changing where taskmaster data is stored. Set to the base location.
     *
     * Example: A location of Memory.test.x would have a memorybase of Memory.test
     * @param [memorypointer="Taskmaster"] An optional param for changing where taskmaster data is stored. Set to the pointer location.
     *
     * Example: A location of Memory.test.x would have a memorypointer of "x"
     */
    constructor(
        allocatedCpu: number,
        startingMemory: Array<planConstructor> = [],
        memorybase = Memory,
        memorypointer: string = "Taskmaster"
    ) {
        //@ts-ignore
        let I: TaskmasterMemory = memorybase[memorypointer];
        this.memoryloc = { base: memorybase, link: memorypointer };
        if (I?.init) {
            if (I.cpuGiven !== allocatedCpu) {
                //@ts-ignore
                memorybase[memorypointer].cpuGiven = allocatedCpu;
            }
            return;
        }

        //@ts-ignore
        memorybase[memorypointer] = {
            activeTasks: [],
            storedTasks: startingMemory,
            cpuUsage: {},
            cpuGiven: allocatedCpu,
            init: true
        };
    }
    /**
     * Runs Taskmaster. Call at the end of your loop
     */
    public run() {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        let allocatedCpu = mem.cpuGiven;
        let usedCpu = 0;
        let tasks = mem.storedTasks.sort((a, b) => b.priority - a.priority);

        let iter = 0;
        for (let I of mem.activeTasks) {
            let oldcpu = Game.cpu.getUsed();
            let run = this.RunActiveTask(I);
            if (I.fullPlan.allocated.length === 0) {
                run = null;
            } else if (visuals) {
                try {
                    //@ts-ignore
                    if (Game.getObjectById(I.fullPlan.allocated[0]) !== null) {
                        //@ts-ignore
                        let creeps: RoomObject[] = I.fullPlan.allocated.map((I) => Game.getObjectById(I));
                        let boxstart = new RoomPosition(
                            Math.min(...creeps.map((I) => I.pos.x))-1,
                            Math.max(...creeps.map((I) => I.pos.y))+1,
                            creeps[0].room?.name || "W0N0"
                        );
                        let boxend = new RoomPosition(
                            Math.max(...creeps.map((I) => I.pos.x))+1,
                            Math.min(...creeps.map((I) => I.pos.y))-1,
                            creeps[0].room?.name || "W0N0"
                        );

                        let boxVisual = new RoomVisual(creeps[0].room?.name || "W0N0").rect(
                            boxstart.x % 50,
                            boxstart.y % 50,
                            (boxend.x - boxstart.x) % 50,
                            (boxend.y - boxstart.y) % 50,
                            { fill: "rgb(255 255 255 / 0)", lineStyle: "dashed", stroke: "#023693", strokeWidth: 0.2, opacity: 0.5 }
                        );
                        let textVisual = new RoomVisual(creeps[0].room?.name || "W0N0").text(
                            run?.fullPlan.type + " " + run?.activeTask,
                            new RoomPosition(
                                Math.round((boxend.x + boxstart.x) / 2) % 50,
                                (boxstart.y + 1) % 50,
                                creeps[0].room?.name || "W0N0"
                            )
                        );
                    }
                } catch (e) {
                    console.log("Visual error "+e)
                }
            }
            if (run == null) {
                console.log("task is null " + iter);
                mem.activeTasks.splice(iter, 1);
                // TODO: This is a really stupid way of handling a null task.
                this.run();
                return;
            }
            mem.activeTasks[iter] = run;

            mem.cpuUsage[I.fullPlan.type] = mem.cpuUsage[I.fullPlan.type] || [];
            mem.cpuUsage[I.fullPlan.type].push(Game.cpu.getUsed() - oldcpu);
            if (mem.cpuUsage[I.fullPlan.type].length > 30) mem.cpuUsage[I.fullPlan.type].shift();

            usedCpu += avg(mem.cpuUsage[I.fullPlan.type]);
            iter += 1;
        }

        iter = 0;
        for (let task of tasks) {
            let taskWillEat = task.forceCPU !== undefined ? task.forceCPU : avg(mem.cpuUsage[task.type]);
            if (usedCpu + taskWillEat > allocatedCpu) {
                continue;
            }

            let confirm = task.requirements instanceof Function ? task.requirements() : task.requirements;
            if (confirm) {
                tasks.splice(iter, 1);
                iter -= 1;

                let tasklist = this.DetermineCheapestPath(task.taskTree, task.allocated, task);
                if (tasklist.length === 0) {
                    console.log("No possible tasks!");
                    continue;
                }
                usedCpu = usedCpu + taskWillEat;
                mem.activeTasks.push({
                    tasklist: tasklist,
                    curTaskName: "",
                    fullPlan: task,
                    activeTask: 0
                });
            }
            iter += 1;
        }
        mem.storedTasks = tasks;

        //@ts-ignore
        this.memoryloc.base[this.memoryloc.link] = mem;
        console.log("[Taskmaster] Used " + usedCpu + "/" + allocatedCpu);
    }

    private DetermineCheapestPath(tasktree: taskTree, allocated: Array<any>, planState: planConstructor) {
        let cheapest = Infinity;
        let maintask: taskBranch | null = null;
        for (let I in tasktree) {
            let task = tasktree[I];
            let confirm =
                typeof task.info.condition === "string"
                    ? TaskMap[task.info.condition](allocated, planState)
                    : task.info.condition;

            if (confirm && task.info.cost < cheapest) {
                console.log("confirm");
                maintask = task;
                cheapest = task.info.cost;
            }
        }
        console.log("next task: " + maintask?.info.name + " for " + planState.type);
        if (maintask) return [maintask];
        else return [];
    }

    private RunActiveTask(plan: Plan): Plan | null {
        if (plan.tasklist.length === 0) {
            return null;
        }
        if (plan.activeTask >= plan.tasklist.length) {
            return null;
        }

        let curtask = plan.tasklist[plan.activeTask].info;
        if (plan.curTaskName !== curtask.name) {
            //if (curtask.initfunction !== undefined) {
            //    let ret = curtask.initfunction(plan.fullPlan.allocated, plan.fullPlan)
            //    plan.fullPlan.allocated = ret.updatedItems !== undefined ? ret.updatedItems : plan.fullPlan.allocated
            //}
            plan.curTaskName = curtask.name;
        }

        if (plan.fullPlan.cancelCondition !== undefined) {
            if (ConditionMap[plan.fullPlan.cancelCondition](plan.fullPlan.allocated, plan.fullPlan)) return null;
        }
        console.log("Name: "+curtask.name)
        //@ts-ignore
        let ret: taskReturn | boolean = TaskMap[curtask.name](plan.fullPlan.allocated, plan.fullPlan);
        let functionFinished: boolean = false;
        if (typeof ret !== "boolean") {
            plan.fullPlan.allocated = ret.updatedItems !== undefined ? ret.updatedItems : plan.fullPlan.allocated;
            functionFinished = ret.suceeded;
        } else {
            functionFinished = ret;
        }

        if (functionFinished) {
            let childern = plan.tasklist[plan.activeTask].children;
            if (childern != undefined) {
                plan.tasklist = plan.tasklist.concat(
                    this.DetermineCheapestPath(childern, plan.fullPlan.allocated, plan.fullPlan)
                );
            }
            plan.activeTask += 1;
        }

        return plan;
    }
    /**
     * If a Taskmaster instance contains a plan in either the inactive or active list
     */
    public ContainsPlan(taskname?: string, roomName?: string, allocated?: string[], targetId?: any, taskid?: string) {
        return (
            this.ContainsInactivePlan(taskname, roomName, allocated, targetId, taskid) ||
            this.ContainsActivePlan(taskname, roomName, allocated, targetId, taskid)
        );
    }
    /**
     * Removes an active plan from a taskmaster instance.
     */
    public RemoveActivePlan(
        taskname?: string,
        roomName?: string,
        allocated?: string[],
        targetId?: any,
        taskid?: string
    ) {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        mem.activeTasks.splice(this.GetIndexOfActivePlan(taskname, roomName, allocated, targetId, taskid), 1);
    }
    /**
     * Removes an inactive plan from a taskmaster instance.
     */
    public RemoveInactivePlan(
        taskname?: string,
        roomName?: string,
        allocated?: string[],
        targetId?: any,
        taskid?: string
    ) {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        mem.storedTasks.splice(this.GetIndexOfInactivePlan(taskname, roomName, allocated, targetId, taskid), 1);
    }
    /**
     * If a Taskmaster instance contains a plan that is currently being queued.
     */
    public ContainsInactivePlan(
        taskname?: string,
        roomName?: string,
        allocated?: string[],
        targetId?: any,
        taskid?: string
    ) {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        let I = mem.storedTasks.filter((a) => {
            let condition = true;
            if (taskname !== undefined && a.type === taskname) condition = true;
            else if (taskname !== undefined && a.type !== taskname) return false;

            if (roomName !== undefined && a.roomName === taskname) condition = true;
            else if (roomName !== undefined && a.roomName !== roomName) return false;

            // bullshit from the compiler forces me to do this
            //@ts-ignore
            if (allocated !== undefined && a.allocated.every((r) => allocated.includes(r))) condition = true;
            //@ts-ignore
            else if (allocated !== undefined && a.allocated.every((r) => allocated.includes(r)) === false) return false;

            if (targetId !== undefined && a.targetId === targetId) condition = true;
            else if (targetId !== undefined && a.targetId !== targetId) return false;

            if (taskid !== undefined && a.id === taskid) condition = true;
            else if (taskid !== undefined && a.id !== taskid) return false;
            return condition;
        });
        return I.length > 0;
    }
    /**
     * If a Taskmaster instance contains a plan that is currently being run.
     */
    public ContainsActivePlan(
        taskname?: string,
        roomName?: string,
        allocated?: string[],
        targetId?: any,
        taskid?: string
    ) {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        let I = mem.activeTasks.filter((a) => {
            let condition = false;
            if (taskname !== undefined && a.fullPlan.type === taskname) condition = true;
            else if (taskname !== undefined && a.fullPlan.type !== taskname) return false;

            if (roomName !== undefined && a.fullPlan.roomName === taskname) condition = true;
            else if (roomName !== undefined && a.fullPlan.roomName !== roomName) return false;

            // bullshit from the compiler forces me to do this
            //@ts-ignore
            if (allocated !== undefined && a.fullPlan.allocated.every((r) => allocated.includes(r))) condition = true;
            //@ts-ignore
            else if (allocated !== undefined && a.fullPlan.allocated.every((r) => allocated.includes(r)) === false)
                return false;

            if (targetId !== undefined && a.fullPlan.targetId === targetId) condition = true;
            else if (targetId !== undefined && a.fullPlan.targetId !== targetId) return false;

            if (taskid !== undefined && a.fullPlan.id === taskid) condition = true;
            else if (taskid !== undefined && a.fullPlan.id !== taskid) return false;

            return condition;
        });
        return I.length > 0;
    }
    /**
     * Gets the index of a inactive plan in a taskmaster instance, if conditions met.
     */
    public GetIndexOfInactivePlan(
        taskname?: string,
        roomName?: string,
        allocated?: string[],
        targetId?: any,
        taskid?: string
    ) {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        let i = 0;
        for (let a of mem.storedTasks) {
            i++;
            // TODO: Change to switch statements
            if (taskname !== undefined && a.type !== taskname) continue;
            else if (roomName !== undefined && a.roomName !== roomName) continue;
            // bullshit from the compiler forces me to do this
            //@ts-ignore
            else if (allocated !== undefined && a.allocated.every((r) => allocated.includes(r)) === false) continue;
            else if (targetId !== undefined && a.targetId === targetId) continue;
            else if (taskid !== undefined && a.id !== taskid) continue;
            return i;
        }
        return -1;
    }
    /**
     * Gets the index of a plan in a taskmaster instance, if conditions met.
     */
    public GetIndexOfActivePlan(
        taskname?: string,
        roomName?: string,
        allocated?: string[],
        targetId?: any,
        taskid?: string
    ) {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        let i = 0;
        for (let a of mem.activeTasks) {
            i++;
            // TODO: Change to switch statements
            if (taskname !== undefined && a.fullPlan.type !== taskname) continue;
            else if (roomName !== undefined && a.fullPlan.roomName !== roomName) continue;
            // bullshit from the compiler forces me to do this
            //@ts-ignore
            else if (allocated !== undefined && a.fullPlan.allocated.every((r) => allocated.includes(r)) === false)
                continue;
            else if (targetId !== undefined && a.fullPlan.targetId === targetId) continue;
            else if (taskid !== undefined && a.fullPlan.id !== taskid) continue;
            return i;
        }
        return -1;
    }
    /**
     * Appends a new plan to the task list.
     * @returns length of plans.
     */
    public AppendPlan(plan: planConstructor): number {
        //@ts-ignore
        let mem: TaskmasterMemory = this.memoryloc.base[this.memoryloc.link];
        if (mem.storedTasks.length >= Infinity) {
            throw Error("Your task amount has reached infinity, what the hell did you do?");
            return mem.storedTasks.length;
        }
        return mem.storedTasks.push(plan);
    }
}
type TaskmasterMemory = {
    activeTasks: Plan[]
    storedTasks: Array<planConstructor>,
    cpuUsage: { [taskname: string]: number[] },
    cpuGiven: number,
    init: boolean,
}

declare namespace NodeJS {
    interface Memory {
        Taskmaster: TaskmasterMemory
    }
}
