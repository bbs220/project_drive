import { create } from "zustand";

// define possible control states
export type ControlState = "car" | "plane" | "helicopter" | "on_foot";

// define telemetry specific to cars
type CarTelemetry = {
  speed: number;
};

// define telemetry specific to fixed wing planes
export type PlaneTelemetry = {
  airspeed: number;
  altitude: number;
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
};

// define telemetry specific to helicopters
export type HelicopterTelemetry = {
  rotorRpm: number;
  altitude: number;
  collective: number;
  pitch: number;
  roll: number;
  yaw: number;
};

// define strict global state
type VehicleState = {
  // track active control
  activeControl: ControlState;

  // action to swap active control
  setActiveControl: (control: ControlState) => void;

  // strict car telemetry state and setter
  carTelemetry: CarTelemetry;
  setCarTelemetry: (data: Partial<CarTelemetry>) => void;

  // strict plane telemetry state and setter
  planeTelemetry: PlaneTelemetry;
  setPlaneTelemetry: (data: Partial<PlaneTelemetry>) => void;

  // strict helicopter telemetry state and setter
  helicopterTelemetry: HelicopterTelemetry;
  setHelicopterTelemetry: (data: Partial<HelicopterTelemetry>) => void;
};

// create and export global store
export const useVehicleStore = create<VehicleState>((set) => ({
  // default to car for current testing phase
  activeControl: "car",

  // setter for active control
  setActiveControl: (control) => set({ activeControl: control }),

  // initialize car telemetry
  carTelemetry: { speed: 0 },

  // setter for car telemetry safely merges new data
  setCarTelemetry: (data) =>
    set((state) => ({
      carTelemetry: { ...state.carTelemetry, ...data },
    })),

  // initialize plane telemetry
  planeTelemetry: {
    airspeed: 0,
    altitude: 0,
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
  },

  // setter for plane telemetry safely merges new data
  setPlaneTelemetry: (data) =>
    set((state) => ({
      planeTelemetry: { ...state.planeTelemetry, ...data },
    })),

  // initialize helicopter telemetry
  helicopterTelemetry: {
    rotorRpm: 0,
    altitude: 0,
    collective: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
  },

  // setter for helicopter telemetry safely merges new data
  setHelicopterTelemetry: (data) =>
    set((state) => ({
      helicopterTelemetry: { ...state.helicopterTelemetry, ...data },
    })),
}));
