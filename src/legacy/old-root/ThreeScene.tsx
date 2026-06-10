import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating crystal
function Crystal({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.85}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

// Orbiting rings
function OrbitalRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });



  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.015, 8, 128]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Central ethereal orb
function EtherOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.1}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          color="#4f46e5"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.05}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Floating data particles
function DataParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 1;
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Purple to cyan gradient
      const t = Math.random();
      colors[i * 3] = 0.48 + t * 0.16;
      colors[i * 3 + 1] = 0.23 + t * 0.48;
      colors[i * 3 + 2] = 0.93 + t * 0.05;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// City grid floor
function CityGrid() {
  return (
    <group position={[0, -3.5, 0]} rotation={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30, 30, 30]} />
        <meshStandardMaterial
          color="#050510"
          emissive="#7c3aed"
          emissiveIntensity={0.05}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Mini city buildings
function CityBuildings() {
  const buildings = useMemo(() => {
    const result = [];
    const positions = [
      [-6, -3, -6], [6, -3, -6], [-8, -3, -4], [8, -3, -4],
      [-5, -3, -8], [5, -3, -8], [-7, -3, -7], [7, -3, -7],
    ];
    for (let i = 0; i < positions.length; i++) {
      const h = 0.5 + Math.random() * 2;
      result.push({
        pos: [positions[i][0], positions[i][1] + h / 2, positions[i][2]] as [number, number, number],
        scale: [0.4 + Math.random() * 0.3, h, 0.4 + Math.random() * 0.3] as [number, number, number],
        color: Math.random() > 0.5 ? '#7c3aed' : '#06b6d4',
      });
    }
    return result;
  }, []);

  return (
    <>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos} scale={b.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={b.color}
            emissive={b.color}
            emissiveIntensity={0.15}
            transparent
            opacity={0.4}
            wireframe={i % 2 === 0}
          />
        </mesh>
      ))}
    </>
  );
}

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} color="#7c3aed" intensity={3} />
        <pointLight position={[-5, -5, 5]} color="#06b6d4" intensity={2} />
        <pointLight position={[0, 0, 0]} color="#ffffff" intensity={0.5} />
        
        <Stars radius={80} depth={50} count={3000} factor={3} saturation={0.5} fade speed={1} />
        
        <Suspense fallback={null}>
          <EtherOrb />
          
          <OrbitalRing radius={2.5} color="#7c3aed" speed={0.2} tilt={0.4} />
          <OrbitalRing radius={3.2} color="#06b6d4" speed={-0.15} tilt={1.1} />
          <OrbitalRing radius={4} color="#4f46e5" speed={0.1} tilt={0.8} />
          
          <Crystal position={[-5, 1.5, -3]} color="#7c3aed" scale={0.4} />
          <Crystal position={[5, -1, -4]} color="#06b6d4" scale={0.35} />
          <Crystal position={[-3, -2.5, -2]} color="#a855f7" scale={0.25} />
          <Crystal position={[4, 2.5, -5]} color="#3b82f6" scale={0.3} />
          <Crystal position={[0, 3.5, -4]} color="#8b5cf6" scale={0.2} />
          
          <DataParticles />
          <CityGrid />
          <CityBuildings />
        </Suspense>
      </Canvas>
    </div>
  );
}
