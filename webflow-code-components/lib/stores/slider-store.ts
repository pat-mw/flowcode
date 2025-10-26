import { create } from 'zustand';

interface SliderState {
  blueValue: number;
  setBlueValue: (value: number) => void;
  getRedValue: () => number;
}

export const useSliderStore = create<SliderState>((set, get) => ({
  blueValue: 0.5, // Default value (0-1 range)
  setBlueValue: (value: number) => set({ blueValue: value }),
  getRedValue: () => 1 - get().blueValue,
}));
