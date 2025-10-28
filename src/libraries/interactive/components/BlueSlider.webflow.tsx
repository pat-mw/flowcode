import BlueSlider from './BlueSlider';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

import '@/lib/styles/globals.css';

interface WebflowBlueSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
}

const BlueSliderWrapper = ({ label, min, max, step }: WebflowBlueSliderProps) => {
  return <BlueSlider label={label} min={min} max={max} step={step} />;
};

export default declareComponent(BlueSliderWrapper, {
  name: 'BlueSlider',
  description: 'Blue slider that controls the inverse red slider value via Zustand store',
  group: 'Interactive',
  props: {
    label: props.Text({
      name: 'Label',
      defaultValue: 'Blue Slider',
      tooltip: 'Label text for the slider',
    }),
    min: props.Number({
      name: 'Minimum Value',
      defaultValue: 0,
      tooltip: 'Minimum slider value',
    }),
    max: props.Number({
      name: 'Maximum Value',
      defaultValue: 100,
      tooltip: 'Maximum slider value',
    }),
    step: props.Number({
      name: 'Step',
      defaultValue: 1,
      tooltip: 'Increment step for slider values',
    }),
  },
});
