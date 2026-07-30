import { useState, useEffect, useRef } from "react";
import { Pane } from "tweakpane";

type FolderApi = ReturnType<Pane["addFolder"]>;

type TweakpaneOptions<V = unknown> = {
  value: V;
  folder?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Record<string, V> | { text: string; value: V }[];
  picker?: "inline" | "popup";
  expanded?: boolean;
  [key: string]: unknown;
};

type ExtractValue<T> = T extends { value: infer V } ? V : T;

type TweakpaneState<T> = {
  [K in keyof T]: ExtractValue<T[K]>;
};

let sharedPane: Pane | null = null;
let sharedFolders: Record<string, FolderApi> = {};
let activeHooksCount = 0;

export function useTweakpane<T extends Record<string, unknown>>(config: {
  [K in keyof T]: T[K] extends { value: infer V } ? TweakpaneOptions<V> : T[K];
}): TweakpaneState<T> {
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
  const tweakpaneTargetRef = useRef({ ...params });

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    if (!sharedPane) {
      sharedPane = new Pane({ title: "🛠️ Controls" });
      sharedFolders = {};
    }
    activeHooksCount++;

    const initialConfig = configRef.current;
    const bindings: Array<{ dispose: () => void }> = [];

    const getFolder = (path: string): FolderApi => {
      if (sharedFolders[path]) return sharedFolders[path];

      const parts = path.split("/");
      let currentPane: Pane | FolderApi = sharedPane!;
      let currentPath = "";

      for (const part of parts) {
        currentPath += (currentPath ? "/" : "") + part;
        if (!sharedFolders[currentPath]) {
          sharedFolders[currentPath] = currentPane.addFolder({ title: part });
        }
        currentPane = sharedFolders[currentPath];
      }
      return currentPane as FolderApi;
    };

    (Object.keys(initialConfig) as Array<keyof T>).forEach((key) => {
      const item = initialConfig[key];
      const isConfigObject =
        typeof item === "object" && item !== null && "value" in item;

      let options: Omit<TweakpaneOptions, "folder"> = {};
      let folder: string | undefined = undefined;

      if (isConfigObject) {
        const { folder: f, ...rest } = item as TweakpaneOptions;
        folder = f;
        options = rest;
      }

      const targetPane = folder ? getFolder(folder) : sharedPane!;

      const binding = targetPane
        .addBinding(tweakpaneTargetRef.current, key as string, options)
        .on("change", (ev: { value: unknown }) => {
          setParams((prev) => ({ ...prev, [key]: ev.value }));
        });

      bindings.push(binding);
    });

    return () => {
      bindings.forEach((binding) => binding.dispose());
      activeHooksCount--;

      if (activeHooksCount === 0 && sharedPane) {
        sharedPane.dispose();
        sharedPane = null;
        sharedFolders = {};
      }
    };
  }, []);

  return params;
}
