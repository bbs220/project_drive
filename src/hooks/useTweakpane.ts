import { useState, useEffect, useRef } from "react";
import { Pane } from "tweakpane";

// conditional type: Extracts 'V' if it's { value: V }, otherwise returns the type itself
type ExtractValue<T> = T extends { value: infer V } ? V : T;

// mapped type: Loops over your config object and applies ExtractValue to every key
type TweakpaneState<T> = {
  [K in keyof T]: ExtractValue<T[K]>;
};

// lives in module scope to share the pane across all components
let sharedPane: Pane | null = null;
let activeHooksCount = 0;

export function useTweakpane<T extends Record<string, unknown>>(
  config: T,
): TweakpaneState<T> {
  // initialize React state for rendering
  const [params, setParams] = useState<TweakpaneState<T>>(() => {
    const initialState = {} as TweakpaneState<T>;

    (Object.keys(config) as Array<keyof T>).forEach((key) => {
      const item = config[key];
      const isObjectConfig =
        typeof item === "object" && item !== null && "value" in item;

      initialState[key] = (
        isObjectConfig ? (item as { value: unknown }).value : item
      ) as ExtractValue<T[keyof T]>;
    });

    return initialState;
  });

  const configRef = useRef(config);

  // create a stable, mutable object specifically for Tweakpane to bind to.
  // never replace this object; we just let Tweakpane mutate its properties.
  const tweakpaneTargetRef = useRef({ ...params });

  useEffect(() => {
    // ONLY run tweakpane if Vite is in development mode
    if (!import.meta.env.DEV) return;

    if (!sharedPane) {
      sharedPane = new Pane({ title: "🛠️ Controls" });
    }
    activeHooksCount++;

    const initialConfig = configRef.current;

    // structurally type the binding so we can call dispose() safely
    const bindings: Array<{ dispose: () => void }> = [];

    (Object.keys(initialConfig) as Array<keyof T>).forEach((key) => {
      const item = initialConfig[key];
      const options =
        typeof item === "object" && item !== null && "value" in item
          ? item
          : {};

      // bind Tweakpane to our stable ref object
      const binding = sharedPane!
        .addBinding(tweakpaneTargetRef.current, key as string, options)
        .on("change", (ev) => {
          // when Tweakpane mutates the ref, sync that change to React state to trigger a render
          setParams((prev) => ({ ...prev, [key]: ev.value }));
        });

      bindings.push(binding);
    });

    return () => {
      // remove only the inputs associated with this specific component
      bindings.forEach((binding) => binding.dispose());

      activeHooksCount--;

      // if no components are using the pane anymore, destroy the whole window
      if (activeHooksCount === 0 && sharedPane) {
        sharedPane.dispose();
        sharedPane = null;
      }
    };
  }, []);

  return params;
}
