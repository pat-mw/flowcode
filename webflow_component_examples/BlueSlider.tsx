'use client';

import { useSliderStore } from '@/lib/stores/slider-store';
import { Slider } from '@/components/ui/slider';

interface BlueSliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function BlueSlider({
  label = 'Blue Slider',
  min = 0,
  max = 100,
  step = 1,
}: BlueSliderProps) {
  const blueValue = useSliderStore((state) => state.blueValue);
  const setBlueValue = useSliderStore((state) => state.setBlueValue);

  // Convert from 0-1 range to min-max range for display
  const displayValue = Math.round(blueValue * (max - min) + min);

  const handleValueChange = (values: number[]) => {
    // Convert from min-max range to 0-1 range for store
    const normalizedValue = (values[0] - min) / (max - min);
    setBlueValue(normalizedValue);
  };

  return (
    <div className="w-full max-w-md space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-blue-900">{label}</label>
        <span className="text-2xl font-bold text-blue-600">{displayValue}</span>
      </div>

      <Slider
        value={[displayValue]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-700"
      />

      <div className="flex justify-between text-xs text-blue-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
