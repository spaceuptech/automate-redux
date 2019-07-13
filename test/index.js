const assert = require("assert");
const { createStore } = require("redux");
const {
  generateReducers,
  set,
  push,
  reset,
  del,
  get,
  increment,
  decrement
} = require("../index");

describe("set function", function() {
  it("should set a given state for a field which is already present", function() {
    const initialState = { name: "foo" };
    const store = createStore(generateReducers(initialState));
    store.dispatch(set("name", "bar"));
    const newState = store.getState();
    assert.equal(newState.name, "bar");
  });

  it("should create a given field with the value if not already present", function() {
    const initialState = {};
    const store = createStore(generateReducers(initialState));
    store.dispatch(set("name", "bar"));
    const newState = store.getState();
    assert.equal(newState.name, "bar");
  });
});

describe("reset function", function() {
  it("should reset a given state for a field", function() {
    const initialState = { name: "foo" };
    const store = createStore(generateReducers(initialState));
    store.dispatch(set("name", "bar"));
    var newState = store.getState();
    assert.equal(newState.name, "bar");
    store.dispatch(reset("name"));
    var newState = store.getState();
    assert.equal(newState.name, "foo");
  });

  it("should reset entire state if no field mentioned", function() {
    const initialState = { foo: "1", bar: "2" };
    const store = createStore(generateReducers(initialState));
    store.dispatch(set("foo", "2"));
    store.dispatch(set("bar", "1"));
    var newState = store.getState();
    assert.equal(newState.foo, "2");
    assert.equal(newState.bar, "1");
    store.dispatch(reset());
    var newState = store.getState();
    assert.equal(newState.foo, "1");
    assert.equal(newState.bar, "2");
  });
});

describe("push function", function() {
  it("should push a given value for a field which is already present", function() {
    const initialState = { items: ["foo"] };
    const store = createStore(generateReducers(initialState));
    store.dispatch(push("items", "bar"));
    const newState = store.getState();
    assert.equal(newState.items.length, 2);
    assert.equal(newState.items[0], "foo");
    assert.equal(newState.items[1], "bar");
  });

  it("should initialize an array with a given value for a field if not already present", function() {
    const initialState = {};
    const store = createStore(generateReducers(initialState));
    store.dispatch(push("items", "foo"));
    const newState = store.getState();
    assert.equal(newState.items.length, 1);
    assert.equal(newState.items[0], "foo");
  });
});

describe("del function", function() {
  it("should delete a given field", function() {
    const initialState = { name: "foo" };
    const store = createStore(generateReducers(initialState));
    store.dispatch(del("name"));
    const newState = store.getState();
    assert.equal(newState.name, undefined);
  });
});

describe("increment function", function() {
  it("should increment a given field", function() {
    const initialState = { foo: 2 };
    const store = createStore(generateReducers(initialState));
    store.dispatch(increment("foo"));
    const newState = store.getState();
    assert.equal(newState.foo, 3);
  });
});

describe("decrement function", function() {
  it("should decrement a given field", function() {
    const initialState = { foo: 3 };
    const store = createStore(generateReducers(initialState));
    store.dispatch(decrement("foo"));
    const newState = store.getState();
    assert.equal(newState.foo, 2);
  });
});

describe("get function", function() {
  it("should get value for a given field which is present", function() {
    const initialState = { name: "foo" };
    const store = createStore(generateReducers(initialState));
    const newState = store.getState();
    assert.equal(get(newState, "name"), "foo");
  });

  it("should get default value for a given field which is not present", function() {
    const initialState = {};
    const store = createStore(generateReducers(initialState));
    const newState = store.getState();
    assert.equal(get(newState, "name", "foo"), "foo");
  });
});
