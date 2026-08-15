// define strict generic types for tweakpane parameters
export type typeTweakpaneParam<T> = {
  value: T;
  min?: number;
  max?: number;
  label?: string;
};

// safely extract values from tweakpane objects or return fallback if undefined
export const unwrapParam = <T>(
  param: T | typeTweakpaneParam<T> | undefined,
  fallback: T,
): T => {
  if (param === undefined || param === null) return fallback;
  return typeof param === "object" && "value" in param
    ? (param as typeTweakpaneParam<T>).value
    : (param as T);
};
