import RedSlider from './RedSlider';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

import '@/lib/styles/globals.css';

interface WebflowRedSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
}

const RedSliderWrapper = ({ label, min, max, step }: WebflowRedSliderProps) => {
  return <RedSlider label={label} min={min} max={max} step={step} />;
};

export default declareComponent(RedSliderWrapper, {
  name: 'RedSlider',
  description: 'Red slider that displays the inverse of blue slider value via Zustand store',
  group: 'Interactive',
  props: {
    label: props.Text({
      name: 'Label',
      defaultValue: 'Red Slider',
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
