'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import LaserFlowHero from '@/components/react-bits/laser-flow/hero';

interface LaserFlowHeroWrapperProps {
  title?: string;
  wispDensity?: number;
  dpr?: number;
  mouseSmoothTime?: number;
  mouseTiltStrength?: number;
  horizontalBeamOffset?: number;
  verticalBeamOffset?: number;
  flowSpeed?: number;
  verticalSizing?: number;
  horizontalSizing?: number;
  fogIntensity?: number;
  fogScale?: number;
  wispSpeed?: number;
  wispIntensity?: number;
  flowStrength?: number;
  decay?: number;
  falloffStart?: number;
  fogFallSpeed?: number;
  color?: string;
}

export function LaserFlowHeroWrapper(props: LaserFlowHeroWrapperProps) {
  return (
    <WebflowProvidersWrapper>
      <LaserFlowHero
        title={props.title}
        wispDensity={props.wispDensity}
        dpr={props.dpr}
        mouseSmoothTime={props.mouseSmoothTime}
        mouseTiltStrength={props.mouseTiltStrength}
        horizontalBeamOffset={props.horizontalBeamOffset}
        verticalBeamOffset={props.verticalBeamOffset}
        flowSpeed={props.flowSpeed}
        verticalSizing={props.verticalSizing}
        horizontalSizing={props.horizontalSizing}
        fogIntensity={props.fogIntensity}
        fogScale={props.fogScale}
        wispSpeed={props.wispSpeed}
        wispIntensity={props.wispIntensity}
        flowStrength={props.flowStrength}
        decay={props.decay}
        falloffStart={props.falloffStart}
        fogFallSpeed={props.fogFallSpeed}
        color={props.color}
      />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(LaserFlowHeroWrapper, {
  name: 'LaserFlow Hero',
  description: 'Interactive hero section with laser beam effects and customizable title',
  group: 'Interactive',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Flowcode',
      tooltip: 'Text displayed in the hero box'
    }),
    wispDensity: props.Number({
      name: 'Wisp Density',
      defaultValue: 1,
      tooltip: 'Density of animated wisps (0-2)'
    }),
    mouseSmoothTime: props.Number({
      name: 'Mouse Smooth Time',
      defaultValue: 0.0,
      tooltip: 'Mouse movement smoothing factor'
    }),
    mouseTiltStrength: props.Number({
      name: 'Mouse Tilt Strength',
      defaultValue: 0.01,
      tooltip: 'How much mouse movement affects the tilt'
    }),
    horizontalBeamOffset: props.Number({
      name: 'Horizontal Beam Offset',
      defaultValue: 0.1,
      tooltip: 'Horizontal offset of the beam'
    }),
    verticalBeamOffset: props.Number({
      name: 'Vertical Beam Offset',
      defaultValue: 0.0,
      tooltip: 'Vertical offset of the beam'
    }),
    flowSpeed: props.Number({
      name: 'Flow Speed',
      defaultValue: 0.35,
      tooltip: 'Speed of the flowing animation'
    }),
    verticalSizing: props.Number({
      name: 'Vertical Sizing',
      defaultValue: 2.0,
      tooltip: 'Vertical size factor of the beam'
    }),
    horizontalSizing: props.Number({
      name: 'Horizontal Sizing',
      defaultValue: 0.5,
      tooltip: 'Horizontal size factor of the beam'
    }),
    fogIntensity: props.Number({
      name: 'Fog Intensity',
      defaultValue: 0.45,
      tooltip: 'Intensity of the volumetric fog effect'
    }),
    fogScale: props.Number({
      name: 'Fog Scale',
      defaultValue: 0.3,
      tooltip: 'Scale of the fog texture'
    }),
    wispSpeed: props.Number({
      name: 'Wisp Speed',
      defaultValue: 15.0,
      tooltip: 'Speed of the wisp animation'
    }),
    wispIntensity: props.Number({
      name: 'Wisp Intensity',
      defaultValue: 5.0,
      tooltip: 'Brightness intensity of wisps'
    }),
    flowStrength: props.Number({
      name: 'Flow Strength',
      defaultValue: 0.25,
      tooltip: 'Strength of the flow modulation'
    }),
    decay: props.Number({
      name: 'Decay',
      defaultValue: 1.1,
      tooltip: 'Beam decay factor'
    }),
    falloffStart: props.Number({
      name: 'Falloff Start',
      defaultValue: 1.2,
      tooltip: 'Where the beam falloff starts'
    }),
    fogFallSpeed: props.Number({
      name: 'Fog Fall Speed',
      defaultValue: 0.6,
      tooltip: 'Speed of the falling fog effect'
    }),
    color: props.Text({
      name: 'Color',
      defaultValue: '#FF79C6',
      tooltip: 'Hex color of the laser effect (e.g., #FF79C6)'
    })
  }
});
