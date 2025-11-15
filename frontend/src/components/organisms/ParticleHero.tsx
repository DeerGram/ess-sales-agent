import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as ThreePoints } from 'three';
import { useMemo, useRef } from 'react';
import type { AliveState } from '../../lib/types';

interface ParticleHeroProps {
  aliveState: AliveState;
  statusText: string;
}

const Particles = ({ aliveState }: { aliveState: AliveState }) => {
  const pointsRef = useRef<ThreePoints | null>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(3000 * 3);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (Math.random() - 0.5) * 6;
      arr[i + 1] = (Math.random() - 0.5) * 6;
      arr[i + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    points.rotation.x += delta * aliveState.particles.speed * 2;
    points.rotation.y += delta * aliveState.particles.speed * 4;
  });

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={aliveState.particles.color}
          size={0.06 * aliveState.particles.scale}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const ParticleHero = ({ aliveState, statusText }: ParticleHeroProps) => {
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 5, 5]} intensity={1.2} />
        <Particles aliveState={aliveState} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Alive State</p>
        <h1 className="text-4xl font-semibold">{aliveState.behavior.toUpperCase()}</h1>
        <p className="mt-2 max-w-2xl text-lg text-white/80">{statusText}</p>
      </div>
    </div>
  );
};

export default ParticleHero;
