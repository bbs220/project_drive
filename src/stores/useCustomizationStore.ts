import { create } from "zustand";

// strictly define all acceptable vehicle keys
export type typeGarageVehicle = "car" | "plane" | "helicopter";

// define the reusable advanced material properties
export type typeMaterialProps = {
  color: string;
  metalness: number;
  roughness: number;
  emission: number;
};

// specific interfaces for each vehicle's unique composition
export type typeCarMods = {
  base: typeMaterialProps;
  neon: typeMaterialProps;
  chrome: typeMaterialProps;
  interior: typeMaterialProps;
  rubber: typeMaterialProps;
  trailColor: string;
};

export type typePlaneMods = {
  base: typeMaterialProps;
  stripes: typeMaterialProps;
  glass: typeMaterialProps;
  trailColor: string;
};

export type typeHelicopterMods = {
  base: typeMaterialProps;
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

  // setter for advanced nested material properties
  setVehicleMaterial: <
    V extends typeGarageVehicle,
    K extends keyof typeVehicleModsMap[V],
  >(
    vehicle: V,
    part: K,
    prop: keyof typeMaterialProps,
    value: string | number,
  ) => void;
};

// helper to quickly generate default material states
const defaultMat = (color: string, emission = 0): typeMaterialProps => ({
  color,
  metalness: 0.5,
  roughness: 0.2,
  emission,
});

// independent default states
const defaultCarMods: typeCarMods = {
  base: defaultMat("#404040"),
  neon: defaultMat("#00f3ff", 2),
  chrome: defaultMat("#ffffff"),
  interior: defaultMat("#1a1a1a"),
  rubber: defaultMat("#111111"),
  trailColor: "#ffffff",
};

const defaultPlaneMods: typePlaneMods = {
  base: defaultMat("#404040"),
  stripes: defaultMat("#ffffff", 2),
  glass: defaultMat("#00f3ff"),
  trailColor: "#ffffff",
};

const defaultHelicopterMods: typeHelicopterMods = {
  base: defaultMat("#404040"),
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

  // deep merge function to update specific material sliders without overwriting others
  setVehicleMaterial: (vehicle, part, prop, value) =>
    set((state) => {
      const targetModObj = `${vehicle}Mods` as const;
      const vehicleState = state[targetModObj];
      return {
        ...state,
        [targetModObj]: {
          ...vehicleState,
          [part]: {
            ...(vehicleState[
              part as keyof typeof vehicleState
            ] as typeMaterialProps),
            [prop]: value,
          },
        },
      };
    }),
}));
