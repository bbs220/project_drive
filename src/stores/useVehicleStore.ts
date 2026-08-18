import { create } from "zustand";

// class dictionary (what kind of vehicle is it?)
export const CONTROL_STATE = {
  PLAYER: "player",
  CAR: "car",
  PLANE: "plane",
  HELICOPTER: "helicopter",
} as const;

export type TypeControlState =
  (typeof CONTROL_STATE)[keyof typeof CONTROL_STATE];

// instance dictionary (exactly which vehicle is it?)
export const ENTITY_ID = {
  PLAYER_1: "player_01",
  CAR_1: "car_01",
  PLANE_1: "plane_01",
  HELI_1: "heli_01",
} as const;

export type TypeEntityId = (typeof ENTITY_ID)[keyof typeof ENTITY_ID];

// define the exact shapes of telemetry
export type PlayerTelemetry = {
  position: [number, number, number];
};

export type CarTelemetry = {
  speed: number;
  position: [number, number, number];
  seatPosition: [number, number, number];
  seatRotation: [number, number, number, number];
};

export type PlaneTelemetry = {
  airspeed: number;
  throttle: number;
  altitude: number;
  pitch: number;
  roll: number;
  yaw: number;
  position: [number, number, number];
  seatPosition: [number, number, number];
  seatRotation: [number, number, number, number];
};

export type HelicopterTelemetry = {
  airspeed: number;
  rotorRpm: number;
  altitude: number;
  collective: number;
  pitch: number;
  roll: number;
  yaw: number;
  position: [number, number, number];
  seatPosition: [number, number, number];
  seatRotation: [number, number, number, number];
};

// map entities directly to their specific telemetry type
export type TelemetryMap = {
  [ENTITY_ID.PLAYER_1]: PlayerTelemetry;
  [ENTITY_ID.CAR_1]: CarTelemetry;
  [ENTITY_ID.PLANE_1]: PlaneTelemetry;
  [ENTITY_ID.HELI_1]: HelicopterTelemetry;
};

// define strict global state
type VehicleState = {
  // active state combines what we are driving and which one we are driving
  active: {
    control: TypeControlState;
    entity: TypeEntityId;
  };

  // setter updated to require both parameters
  setActive: (control: TypeControlState, entity: TypeEntityId) => void;

  // telemetry is completely separated from the active state, acting as pure world data
  telemetry: TelemetryMap;

  // single, perfectly typed update function
  updateTelemetry: <K extends TypeEntityId>(
    entity: K,
    data: Partial<TelemetryMap[K]>,
  ) => void;
};

// create and export global store
export const useVehicleStore = create<VehicleState>((set) => ({
  // start the game as player
  active: {
    control: CONTROL_STATE.PLAYER,
    entity: ENTITY_ID.PLAYER_1,
  },

  setActive: (control, entity) => set({ active: { control, entity } }),

  // initialize the world data dictionary
  telemetry: {
    [ENTITY_ID.PLAYER_1]: { position: [0, 0, 0] },
    [ENTITY_ID.CAR_1]: {
      speed: 0,
      position: [0, 0, 0],
      seatPosition: [0, 0, 0],
      seatRotation: [0, 0, 0, 1],
    },
    [ENTITY_ID.PLANE_1]: {
      airspeed: 0,
      throttle: 0,
      altitude: 0,
      pitch: 0,
      roll: 0,
      yaw: 0,
      position: [0, 0, 0],
      seatPosition: [0, 0, 0],
      seatRotation: [0, 0, 0, 1],
    },
    [ENTITY_ID.HELI_1]: {
      airspeed: 0,
      rotorRpm: 0,
      altitude: 0,
      collective: 0,
      pitch: 0,
      roll: 0,
      yaw: 0,
      position: [0, 0, 0],
      seatPosition: [0, 0, 0],
      seatRotation: [0, 0, 0, 1],
    },
  },

  // update specific entity data without touching anything else
  updateTelemetry: (entity, data) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        [entity]: {
          ...state.telemetry[entity],
          ...data,
        },
      },
    })),
}));
