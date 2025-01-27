import {assert} from "chai";
import {loop} from "../../src/main.ts";
const Game: {
  creeps: { [name: string]: any };
  rooms: any;
  spawns: any;
  time: any;
} = {
  creeps: {},
  rooms: [],
  spawns: {},
  time: 12345
};

const Memory: {
  creeps: { [name: string]: any };
} = {
  creeps: {}
};


describe("main", () => {
  before(() => {
    // runs before all test in this block
  });

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should export a loop function", () => {
    assert.isTrue(typeof loop === "function");
  });

  it("should return void when called with no context", () => {
    assert.isUndefined(loop());
  });

  it("Automatically delete memory of missing creeps", () => {
    Memory.creeps.persistValue = "any value";
    Memory.creeps.notPersistValue = "any value";

    Game.creeps.persistValue = "any value";

    loop();

    assert.isDefined(Memory.creeps.persistValue);
    assert.isUndefined(Memory.creeps.notPersistValue);
  });
});
