import dotProp from "dot-prop-immutable";
import { Store, UnknownAction, applyMiddleware, compose, legacy_createStore } from "redux";
import { thunk, ThunkDispatch } from "redux-thunk";

/**
 * Generic action interface with optional path and value.
 */
export interface AutomateReduxAction extends UnknownAction {
  type:
  | "SET"
  | "RESET"
  | "PUSH"
  | "INCREMENT"
  | "DECREMENT"
  path?: string;
  value?: any;
}

export type AnyState = Record<string, any>;

/**
 * Generate a Redux reducer automatically handling simple immutable updates.
 */
export const generateReducers = <T extends AnyState>(initialState: T) => {
  return (state: T = initialState, action: AutomateReduxAction): T => {
    switch (action.type) {
      case "SET":
        return dotProp.set(state, action.path as string, action.value);

      case "RESET":
        // Reset entire state
        if (action.path === undefined) {
          return initialState;
        }
        // Reset specific path
        return dotProp.set(
          state,
          action.path,
          dotProp.get(initialState, action.path,)
        );

      case "PUSH": {
        const currentArray = dotProp.get(state, action.path as string, []);
        return dotProp.set(state, action.path as string, [
          ...currentArray,
          action.value,
        ]);
      }

      case "INCREMENT": {
        const initialValue = Number(dotProp.get(state, action.path as string, 0));
        const newValue = initialValue + (action.value ?? 1);
        return dotProp.set(state, action.path as string, newValue);
      }

      case "DECREMENT": {
        const initialValue = Number(dotProp.get(state, action.path as string, 0));
        const newValue = initialValue - (action.value ?? 1);
        return dotProp.set(state, action.path as string, newValue);
      }

      default:
        return state;
    }
  };
};

// ---- Action Creators ---- //

export const set = (path: string, value: any): AutomateReduxAction => ({
  type: "SET",
  path,
  value,
});

export const push = (path: string, value: any): AutomateReduxAction => ({
  type: "PUSH",
  path,
  value,
});

export const increment = (
  path: string,
  value: number = 1
): AutomateReduxAction => ({
  type: "INCREMENT",
  path,
  value,
});

export const decrement = (
  path: string,
  value: number = 1
): AutomateReduxAction => ({
  type: "DECREMENT",
  path,
  value,
});

export const reset = (path?: string): AutomateReduxAction => ({
  type: "RESET",
  path,
});

/**
 * Get nested value safely using dot path with fallback.
 */
export const get = <T = any>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T => {
  const result = dotProp.get(obj, path, defaultValue);
  if (result === null && defaultValue !== undefined) {
    return defaultValue;
  }
  return result;
};

export interface AutomateReduxStore<T> extends Store<T, UnknownAction> {
  dispatch: ThunkDispatch<T, unknown, UnknownAction>;
}

export const createStore = <T extends Record<string, any>>(initialState: T): AutomateReduxStore<T> => {
  const middlewareEnhancer = applyMiddleware(thunk);
  const composedEnhancer = compose(middlewareEnhancer);

  const store = legacy_createStore(
    generateReducers(initialState),
    composedEnhancer
  ) as AutomateReduxStore<T>;

  return store;
};