import { create } from "zustand";

// strictly define all acceptable vehicle keys
export type typeGarageVehicle = "car" | "plane" | "helicopter";

// map vehicle keys to their exact store property names so typescript knows they are objects
type typeVehicleModKeys = "carMods" | "planeMods" | "helicopterMods";

export type typeVehicleMods = {
  baseColor: string;
};

export type typeCustomizationStore = {
  activeGarageVehicle: typeGarageVehicle;
  carMods: typeVehicleMods;
  planeMods: typeVehicleMods;
  helicopterMods: typeVehicleMods;
  setActiveGarageVehicle: (vehicle: typeGarageVehicle) => void;
  setVehicleMod: (
    vehicle: typeGarageVehicle,
    key: keyof typeVehicleMods,
    value: string | number,
  ) => void;
};

const defaultMods: typeVehicleMods = {
  baseColor: "#404040",
};

export const useCustomizationStore = create<typeCustomizationStore>((set) => ({
  activeGarageVehicle: "car",

  // initialize each vehicle with its own independent memory bank
  carMods: { ...defaultMods },
  planeMods: { ...defaultMods },
  helicopterMods: { ...defaultMods },

  // action to swap the currently viewed vehicle
  setActiveGarageVehicle: (vehicle) => set({ activeGarageVehicle: vehicle }),

  // dynamic action to safely update a single property on a specific vehicle
  setVehicleMod: (vehicle, key, value) =>
    set((state) => {
      // strictly cast the dynamic string so typescript knows exactly which object we are grabbing
      const targetModObj = `${vehicle}Mods` as typeVehicleModKeys;

      return {
        ...state,
        [targetModObj]: {
          ...state[targetModObj],
          [key]: value,
        },
      };
    }),
}));
