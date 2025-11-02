import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simplified continent data (dots forming land masses)
const continentDots = [
  // North America
  ...Array.from({ length: 150 }, (_, i) => ({
    lat: 25 + Math.random() * 45,
    lon: -120 + Math.random() * 60,
  })),
  // South America
  ...Array.from({ length: 100 }, (_, i) => ({
    lat: -35 + Math.random() * 50,
    lon: -80 + Math.random() * 40,
  })),
  // Europe
  ...Array.from({ length: 120 }, (_, i) => ({
    lat: 40 + Math.random() * 30,
    lon: -10 + Math.random() * 50,
  })),
  // Africa
  ...Array.from({ length: 130 }, (_, i) => ({
    lat: -30 + Math.random() * 60,
    lon: -15 + Math.random() * 60,
  })),
  // Asia
  ...Array.from({ length: 200 }, (_, i) => ({
    lat: 20 + Math.random() * 50,
    lon: 60 + Math.random() * 80,
  })),
  // Australia
  ...Array.from({ length: 60 }, (_, i) => ({
    lat: -40 + Math.random() * 25,
    lon: 120 + Math.random() * 40,
  })),
];

function DottedGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Convert lat/lon to 3D coordinates on sphere
  const dots = useMemo(() => {
    const radius = 2;
    return continentDots.map(({ lat, lon }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      return new THREE.Vector3(x, y, z);
    });
  }, []);

  // Auto-rotate the globe
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
    // Pulse the glow
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow ring */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.3, 64, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Bright outer ring */}
      <mesh>
        <ringGeometry args={[2.25, 2.35, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dark sphere base */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Continent dots */}
      {dots.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Highlighted active user dots */}
      {[
        { lat: 40, lon: -95 },
        { lat: 51, lon: 0 },
        { lat: 35, lon: 105 },
        { lat: -33, lon: 151 },
        { lat: -23, lon: -46 },
      ].map(({ lat, lon }, i) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 2.05;

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return (
          <group key={`active-${i}`}>
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Pulsing ring around active user */}
            <mesh position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.05, 0.08, 32]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.3 + Math.sin(Date.now() * 0.003 + i) * 0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Ambient light effect on front */}
      <mesh position={[-1, 1, 0.5]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

export default function Globe3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <DottedGlobe />
      </Canvas>
    </div>
  );
}
