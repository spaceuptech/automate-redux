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

## Installation

```
npm install automate-redux
```

Then to elimintate writing reducers, use `generateReducers` while creating redux store:

```js
import { createStore } from "redux";
import { generateReducers } from "automate-redux";

// Initial state of redux
const initialState = { foo: "1" };

// Generate reducers with the initial state and pass it to the redux store
const store = createStore(generateReducers(initialState));
```

## Usage

```js
import { createStore } from "redux";
import { generateReducers, set, get, reset, push, del } from "automate-redux";

// Initial state of redux
const initialState = { foo: "1", items: ["1", "2"] };

// Generate reducers with the initial state and pass it to the redux store
const store = createStore(generateReducers(initialState));

// Set the value of a field
store.dispatch(set("foo", "2"));

// Set the value of a nested field
store.dispatch(set("foo.bar", "1"));

// Push the value of a field
store.dispatch(push("items", "3"));

// Reset a field to an initial value
store.dispatch(reset("foo"));

// Reset the entire state to initial value
store.dispatch(reset());

// Remove a field
store.dispatch(del("items"));

// Read a field's value
get(store.getState(), "foo");

// Return default value if field is not present
get(store.getState(), "some-field", "default value");

// Read a nested field's value
get(store.getState(), "foo.bar");
```
