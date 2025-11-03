'use client';

import LaserFlow from './LaserFlow';
import { useRef } from 'react';

interface LaserFlowHeroProps {
  // Hero-specific props
  title?: string;

  // LaserFlow passthrough props
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

// Image Example Interactive Reveal Effect
export default function LaserFlowHero({
  title = 'Flowcode',
  wispDensity = 1,
  dpr,
  mouseSmoothTime = 0.0,
  mouseTiltStrength = 0.01,
  horizontalBeamOffset = 0.1,
  verticalBeamOffset = 0.0,
  flowSpeed = 0.35,
  verticalSizing = 2.0,
  horizontalSizing = 0.5,
  fogIntensity = 0.45,
  fogScale = 0.3,
  wispSpeed = 15.0,
  wispIntensity = 5.0,
  flowStrength = 0.25,
  decay = 1.1,
  falloffStart = 1.2,
  fogFallSpeed = 0.6,
  color = 'var(--color-primary)'
}: LaserFlowHeroProps) {
  const revealImgRef = useRef<HTMLImageElement>(null);

  return (
    <div
      style={{
        height: '800px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#060010'
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', `${x}px`);
          el.style.setProperty('--my', `${y + rect.height * 0.5}px`);
        }
      }}
      onMouseLeave={() => {
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', '-9999px');
          el.style.setProperty('--my', '-9999px');
        }
      }}
    >
      <LaserFlow
        wispDensity={wispDensity}
        dpr={dpr}
        mouseSmoothTime={mouseSmoothTime}
        mouseTiltStrength={mouseTiltStrength}
        horizontalBeamOffset={horizontalBeamOffset}
        verticalBeamOffset={verticalBeamOffset}
        flowSpeed={flowSpeed}
        verticalSizing={verticalSizing}
        horizontalSizing={horizontalSizing}
        fogIntensity={fogIntensity}
        fogScale={fogScale}
        wispSpeed={wispSpeed}
        wispIntensity={wispIntensity}
        flowStrength={flowStrength}
        decay={decay}
        falloffStart={falloffStart}
        fogFallSpeed={fogFallSpeed}
        color={color}
      />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '86%',
        height: '60%',
        backgroundColor: 'var(--color-background)',
        borderRadius: '20px',
        border: '2px solid var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-foreground)',
        fontSize: '2rem',
        fontWeight: 'bold',
        zIndex: 6
      }}>
        {title}
      </div>

      <img
        ref={revealImgRef}
        src="https://cdn.dribbble.com/userupload/15325964/file/original-25ae735b5d9255a4a31d3471fd1c346a.png?resize=1024x768&vertical=center"
        alt="Reveal effect"
        style={{
          position: 'absolute',
          width: '100%',
          top: '-50%',
          zIndex: 5,
          mixBlendMode: 'lighten',
          opacity: 0.3,
          pointerEvents: 'none',
          '--mx': '-9999px',
          '--my': '-9999px',
          WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
          maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat'
        } as React.CSSProperties}
      />
    </div>
  );
}
