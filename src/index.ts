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

/** Detect literal-key Record<K,V> (e.g. Record<MyEnum, ...> or Record<'A'|'B', ...>) */
type IsLiteralKeyRecord<T> =
  T extends Record<infer K, any>
  ? string extends K
  ? false
  : [K] extends [string]
  ? true
  : false
  : false;

/**
 * DotPaths:
 *  - For normal objects/arrays: enumerate keys and nested dot paths (precise).
 *  - For literal-key Records (Record<Enum, ...>): enumerate those keys too.
 *  - For generic Record<string, V>: allow dynamic key descent but do NOT introduce plain `string`.
 */
export type DotPaths<T> =
  T extends Primitive ? never :

  // If it's a Record with literal keys (enum or union), enumerate them
  IsLiteralKeyRecord<T> extends true
  ? {
    [K in keyof T & string]:
    | K
    | `${K}.${DotPaths<NonArray<T[K]>>}`
  }[keyof T & string]

  // Normal objects / arrays
  : (
    {
      [K in keyof T & string]:
      | K
      | (T[K] extends (infer U)[]
        // ✅ only numeric indexes and recurse into element type (not array prototype)
        ? `${K}.${number}`
        | `${K}.${number}.${DotPaths<NonArray<U>>}`
        : T[K] extends Record<string, any>
        ? `${K}.${DotPaths<NonArray<T[K]>>}`
        : never)
    }[keyof T & string]
  )
  // ✅ fallback for generic Record<string,V>
  | (T extends Record<string, infer V> ? `${string}.${DotPaths<NonArray<V>>}` : never);

type NonArray<T> = T extends (infer U)[] ? U : T;


/**
 * Resolves the **value type** for a given dot path.
 */
export type ValueAtPath<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
  ? ValueAtPath<T[K], Rest>
  : T extends Record<string, infer V>        // <- NEW fallback
  ? ValueAtPath<V, Rest>
  : never
  : P extends keyof T
  ? T[P]
  : T extends Record<string, infer V>        // <- NEW fallback
  ? V
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
    reset<P extends DotPaths<T> | undefined = undefined>(path?: P): AutomateReduxAction {
      return { type: "RESET" as const, path };
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