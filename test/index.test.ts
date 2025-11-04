import assert from "assert";
import { createStore, Store } from "redux";
import {
  generateReducers,
  set,
  push,
  reset,
  get,
  increment,
  decrement,
  AnyState
} from "../src"; // adjust if your compiled code is in 'dist'

describe("automate-redux", () => {
  describe("set function", () => {
    it("should set a given state for a field which is already present", () => {
      const initialState: AnyState = { name: "foo" };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(set("name", "bar"));
      const newState = store.getState();
      assert.strictEqual(newState.name, "bar");
    });

    it("should create a given field with the value if not already present", () => {
      const initialState = {};
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(set("name", "bar"));
      const newState = store.getState();
      assert.strictEqual(newState.name, "bar");
    });
  });

  describe("reset function", () => {
    it("should reset a given state for a field", () => {
      const initialState: AnyState = { name: "foo" };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(set("name", "bar"));
      let newState = store.getState();
      assert.strictEqual(newState.name, "bar");
      store.dispatch(reset("name"));
      newState = store.getState();
      assert.strictEqual(newState.name, "foo");
    });

    it("should reset entire state if no field mentioned", () => {
      const initialState: AnyState = { foo: "1", bar: "2" };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(set("foo", "2"));
      store.dispatch(set("bar", "1"));
      let newState = store.getState();
      assert.strictEqual(newState.foo, "2");
      assert.strictEqual(newState.bar, "1");
      store.dispatch(reset());
      newState = store.getState();
      assert.strictEqual(newState.foo, "1");
      assert.strictEqual(newState.bar, "2");
    });
  });

  describe("push function", () => {
    it("should push a given value for a field which is already present", () => {
      const initialState: AnyState = { items: ["foo"] };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(push("items", "bar"));
      const newState = store.getState();
      assert.strictEqual(newState.items.length, 2);
      assert.strictEqual(newState.items[0], "foo");
      assert.strictEqual(newState.items[1], "bar");
    });

    it("should initialize an array with a given value for a field if not already present", () => {
      const initialState = {};
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(push("items", "foo"));
      const newState = store.getState();
      assert.strictEqual(newState.items.length, 1);
      assert.strictEqual(newState.items[0], "foo");
    });
  });

  describe("increment function", () => {
    it("should increment a given field", () => {
      const initialState: AnyState = { foo: 2 };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(increment("foo"));
      const newState = store.getState();
      assert.strictEqual(newState.foo, 3);
    });
  });

  describe("decrement function", () => {
    it("should decrement a given field", () => {
      const initialState: AnyState = { foo: 3 };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      store.dispatch(decrement("foo"));
      const newState = store.getState();
      assert.strictEqual(newState.foo, 2);
    });
  });

  describe("get function", () => {
    it("should get value for a given field which is present", () => {
      const initialState: AnyState = { name: "foo" };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      const newState = store.getState();
      assert.strictEqual(get(newState, "name"), "foo");
    });

    it("should get default value for a given field which is not present", () => {
      const initialState = {};
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      const newState = store.getState();
      assert.strictEqual(get(newState, "name", "foo"), "foo");
    });

    it("should get default value for a given field if field value is null", () => {
      const initialState: AnyState = { name: null };
      const store: Store<AnyState> = createStore(generateReducers(initialState));
      const newState = store.getState();
      assert.strictEqual(get(newState, "name", "foo"), "foo");
    });
  });
});
