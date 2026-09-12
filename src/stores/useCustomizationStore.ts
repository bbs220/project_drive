import { create } from "zustand";

// strictly define all acceptable vehicle keys
export type typeGarageVehicle = "car" | "plane" | "helicopter";

// specific interfaces for each vehicle's unique composition
export type typeCarMods = {
  baseColor: string;
  trailColor: string;
};

export type typePlaneMods = {
  baseColor: string;
  stripeColor: string;
  glassColor: string;
  trailColor: string;
};

export type typeHelicopterMods = {
  baseColor: string;
  trailColor: string;
};

// map the vehicle keys to their specific mod types
type typeVehicleModsMap = {
  car: typeCarMods;
  plane: typePlaneMods;
  helicopter: typeHelicopterMods;
};

export type typeCustomizationStore = {
  activeGarageVehicle: typeGarageVehicle;
  carMods: typeCarMods;
  planeMods: typePlaneMods;
  helicopterMods: typeHelicopterMods;
  setActiveGarageVehicle: (vehicle: typeGarageVehicle) => void;

  // generic signature: ts will cross-reference the vehicle (v) to ensure the key (k) belongs to it
  setVehicleMod: <
    V extends typeGarageVehicle,
    K extends keyof typeVehicleModsMap[V],
  >(
    vehicle: V,
    key: K,
    value: typeVehicleModsMap[V][K],
  ) => void;
};

// independent default states
const defaultCarMods: typeCarMods = {
  baseColor: "#404040",
  trailColor: "#ffffff",
};

const defaultPlaneMods: typePlaneMods = {
  baseColor: "#404040",
  stripeColor: "#ffffff",
  glassColor: "#00f3ff",
  trailColor: "#ffffff",
};

const defaultHelicopterMods: typeHelicopterMods = {
  baseColor: "#404040",
  trailColor: "#ffffff",
};

export const useCustomizationStore = create<typeCustomizationStore>((set) => ({
  activeGarageVehicle: "car",

  // initialize each vehicle with its own independent memory bank
  carMods: { ...defaultCarMods },
  planeMods: { ...defaultPlaneMods },
  helicopterMods: { ...defaultHelicopterMods },

  // action to swap the currently viewed vehicle
  setActiveGarageVehicle: (vehicle) => set({ activeGarageVehicle: vehicle }),

  // dynamic action to safely update a single property on a specific vehicle
  setVehicleMod: (vehicle, key, value) =>
    set((state) => {
      // strictly cast the dynamic string so typescript knows it maps to a valid store key
      const targetModObj = `${vehicle}Mods` as const;

      return {
        ...state,
        [targetModObj]: {
          // generic function signature guarantees safety at the call-site
          ...state[targetModObj],
          [key]: value,
        },
      };
    }),
}));
