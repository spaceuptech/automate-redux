import dotProp from "dot-prop-immutable";
import { Store, UnknownAction, applyMiddleware, compose, legacy_createStore } from "redux";
import { thunk, ThunkDispatch } from "redux-thunk";

/**
 * Generic action interface with optional path and value.
 */
interface AutomateReduxAction extends UnknownAction {
  type:
  | "SET"
  | "RESET"
  | "PUSH"
  | "INCREMENT"
  | "DECREMENT"
  path?: string;
  value?: any;
}

type AnyState = Record<string, any>;

type Primitive = string | number | boolean | symbol | null | undefined;

/**
 * Recursively builds **dot path strings** for nested objects and arrays.
 * Enables full autocompletion in VSCode.
 */
export type DotPaths<T> = (
  T extends Primitive
  ? never
  : {
    [K in keyof T & string]:
    | K
    | (T[K] extends (infer U)[]
      ? `${K}.${number}`
      | `${K}.${number}.${DotPaths<U>}`
      : T[K] extends Record<string, any>
      ? `${K}.${DotPaths<T[K]>}`
      : never);
  }[keyof T & string]
);

/**
 * Resolves the **value type** for a given dot path.
 */
export type ValueAtPath<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
  ? T[K] extends (infer U)[]
  ? Rest extends `${number}.${infer Deep}`
  ? ValueAtPath<U, Deep>
  : Rest extends `${number}`
  ? U
  : never
  : ValueAtPath<T[K], Rest>
  : never
  : P extends keyof T
  ? T[P]
  : never;

/**
 * Generate a Redux reducer automatically handling simple immutable updates.
 */
const generateReducers = <T extends AnyState>(initialState: T) => {
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

/* -------------------------------------------------------------------------- */
/*                           🔹 Typed Action Factory                          */
/* -------------------------------------------------------------------------- */

export function createActions<T extends Record<string, any>>() {
  return {
    set<P extends DotPaths<T>>(path: P, value: ValueAtPath<T, P>): AutomateReduxAction {
      return { type: "SET", path, value };
    },
    push<P extends DotPaths<T>>(
      path: P,
      value: ValueAtPath<T, P> extends (infer U)[]
        ? U
        : ValueAtPath<T, P> extends (infer U)[] | undefined
        ? U
        : ValueAtPath<T, P>
    ): AutomateReduxAction {
      return { type: "PUSH", path, value };
    },
    increment<P extends DotPaths<T>>(path: P, value: number = 1): AutomateReduxAction {
      return { type: "INCREMENT", path, value };
    },
    decrement<P extends DotPaths<T>>(path: P, value: number = 1): AutomateReduxAction {
      return { type: "DECREMENT", path, value };
    },
    reset(path?: string): AutomateReduxAction {
      return { type: "RESET", path };
    },
  };
}


/* -------------------------------------------------------------------------- */
/*                              🔹 Get Function                               */
/* -------------------------------------------------------------------------- */

export function get<T extends Record<string, any>, P extends DotPaths<T>>(
  obj: T,
  path: P,
  defaultValue?: ValueAtPath<T, P>
): ValueAtPath<T, P> {
  const result = dotProp.get(obj, path, defaultValue);
  if (result === null && defaultValue !== undefined) return defaultValue!;
  return result;
}

export interface AutomateReduxStore<T extends Record<string, any>> extends Store<T, AutomateReduxAction> {
  dispatch: ThunkDispatch<T, unknown, AutomateReduxAction>;
  actions: ReturnType<typeof createActions<T>>;
}

/* -------------------------------------------------------------------------- */
/*                         🔹 Store Creator (Typed)                           */
/* -------------------------------------------------------------------------- */

export const createStore = <T extends Record<string, any>>(
  initialState: T
): AutomateReduxStore<T> => {
  const middlewareEnhancer = applyMiddleware(thunk);
  const composedEnhancer = compose(middlewareEnhancer);

  const store = legacy_createStore(
    generateReducers(initialState),
    composedEnhancer
  ) as AutomateReduxStore<T>;

  // attach typed actions (this enables autocompletion)
  store.actions = createActions<T>();

  return store;
};