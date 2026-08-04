import { create } from "zustand";

// define car state interface
interface CarState {
  speed: number;
}

// create and export global car store
export const useCarStore = create<CarState>(() => ({
  // initialize speed at zero
  speed: 0,
}));
