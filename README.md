# Automate Reducer

Simple library to eliminate the need of writing reducers

```
npm install automate-redux
```

## Motivation

Redux is a great library for maitaining state in web apps. It helps you manage your app state in a predictable manner.
However, it involves writing a lot of boiler plate code for even a simple todo app. As the application grows, the benefits of using redux increases and so does the boilerplate code.

For a person who is new to web development and has just learned something like ReactJS, it can be overwhelming to learn a state management library like redux immediately. For the professionals who are used to redux, it's boring and painstaking to write reducers everytime.

This gave us the motivation to completely eliminate the need of writing reducers. 

## Setup

To install, simply hit this command:
```
npm install automate-redux
```

## Usage

```js
import { createStore, get } from "automate-redux";

// Initial state of redux
const initialState: { foo: string, items: string[] } = { foo: "1", items: ["1", "2"] };

// Generate reducers with the initial state and pass it to the redux store
const store = createStore(initialState);

// NOTE: All actions (set, increment, decrement, push, reset) inside the store.actions are type-safe and provide autocomplete based on the the initial state

// Set the value of a field
store.dispatch(store.actions.set("foo", "2"));

// Set the value of a nested field
store.dispatch(store.actions.set("foo.bar", "1"));

// Increment/decrement the value of a nested field
store.dispatch(store.actions.increment("foo.bar"));
store.dispatch(store.actions.decrement("foo.bar"));

// Increment/decrement the value of a nested field by a particular value 
store.dispatch(store.actions.increment("foo.bar", 2));
store.dispatch(store.actions.decrement("foo.bar", 2));

// Push the value of a field
store.dispatch(store.actions.push("items", "3"));

// Reset a field to an initial value
store.dispatch(store.actions.reset("foo"));

// Reset the entire state to initial value
store.dispatch(store.actions.reset());

// Read a field's value
get(store.getState(), "foo");

// Return default value if field is undefined or null
get(store.getState(), "some-field", "default value");

// Read a nested field's value
get(store.getState(), "foo.bar");
```

## Credits
- [dot-prop-immutable](https://github.com/debitoor/dot-prop-immutable): Made accessing nested paths a piece of cake!
- [space-cloud](https:github.com/spaceuptech/space-cloud): An open-source Firebase + Heroku. This library came into existence while building the admin console of space cloud:)

## License

[MIT](http://opensource.org/licenses/MIT)
