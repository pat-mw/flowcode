'use client';

import { useSliderStore } from '@/lib/stores/slider-store';
import { Slider } from '@/components/ui/slider';

interface RedSliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function RedSlider({
  label = 'Red Slider',
  min = 0,
  max = 100,
  step = 1,
}: RedSliderProps) {
  const blueValue = useSliderStore((state) => state.blueValue);
  const setBlueValue = useSliderStore((state) => state.setBlueValue);

  // Get the inverse value (1 - blueValue)
  const redValue = 1 - blueValue;

  // Convert from 0-1 range to min-max range for display
  const displayValue = Math.round(redValue * (max - min) + min);

  const handleValueChange = (values: number[]) => {
    // Convert from min-max range to 0-1 range
    const normalizedValue = (values[0] - min) / (max - min);
    // Set blue value as inverse of red value
    setBlueValue(1 - normalizedValue);
  };

  return (
    <div className="w-full max-w-md space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-red-900">{label}</label>
        <span className="text-2xl font-bold text-red-600">{displayValue}</span>
      </div>

      <Slider
        value={[displayValue]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:bg-red-600 [&_[role=slider]]:border-red-700"
      />

      <div className="flex justify-between text-xs text-red-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
