const dotProp = require("dot-prop-immutable");

exports.generateReducers = initialState => {
  return (state = initialState, action) => {
    switch (action.type) {
      case "SET":
        return dotProp.set(state, action.path, action.value);

      case "RESET":
        // Reset the entire state
        if (action.path === undefined) {
          return initialState;
        }

        // Reset specific state
        return dotProp.set(
          state,
          action.path,
          dotProp.get(initialState, action.path)
        );

      case "PUSH":
        return dotProp.merge(state, action.path, [action.value]);

      case "INCREMENT":
        var initialValue = Number(dotProp.get(state, action.path, 0))
        var newValue = initialValue + action.value
        return dotProp.set(state, action.path, newValue)

      case "DECREMENT":
          var initialValue = Number(dotProp.get(state, action.path, 0))
          var newValue = initialValue - action.value
          return dotProp.set(state, action.path, newValue)

      case "DELETE":
        return dotProp.delete(state, action.path);

      default:
        return state;
    }
  };
};

exports.set = (path, value) => ({ type: "SET", path, value });
exports.push = (path, value) => ({ type: "PUSH", path, value });
exports.del = path => ({ type: "DELETE", path });
exports.increment = (path, value = 1) => ({ type: "INCREMENT", path, value });
exports.decrement = (path, value = 1) => ({ type: "DECREMENT", path, value });
exports.reset = path => ({ type: "RESET", path });
exports.get = dotProp.get;
