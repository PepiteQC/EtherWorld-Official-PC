'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'

// Room components
import { RoomArchitecture, RoomLighting, SpawnParticles } from './room-architecture'
import { SecurityDoor, BathroomFixtures } from './door-system'
import { HotelCorridor3D, PLAYER_DOOR_Z } from './corridor-3d'
import { CeilingLight } from './furniture'

export function EtherWorldRoom() {
  const [showSpawnParticles, setShowSpawnParticles] = useState(true)
  
  // Hide spawn particles after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpawnParticles(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="w-full h-screen bg-background">
      <Canvas
        shadows
        camera={{ position: [0, 8, 45], fov: 55 }}
        gl={{ 
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.8,
        }}
      >
        <Suspense fallback={null}>
          {/* Environment and lighting */}
          <Environment preset="night" />
          <RoomLighting />
          <fog attach="fog" args={['#0a0a0f', 10, 35]} />
          
          {/* Room structure */}
          <RoomArchitecture />
          
          {/* Spawn effect */}
          <SpawnParticles active={showSpawnParticles} />
          
          {/* === HOTEL CORRIDOR (main structure) === */}
          <HotelCorridor3D />
          
          {/* === PLAYER ROOM - positioned at the back left door === */}
          {/* Room: 12 wide (X) x 14 deep (Z) - VIDE pour le Builder */}
          <group position={[-9, 0, PLAYER_DOOR_Z]} rotation={[0, Math.PI / 2, 0]}>
          
            {/* Room walls - hauteur 5m */}
            {/* Back wall (Z=-7) */}
            <mesh position={[0, 2.5, -7]} castShadow receiveShadow>
              <boxGeometry args={[12, 5, 0.15]} />
              <meshStandardMaterial color="#3a3a5e" roughness={0.9} />
            </mesh>
            {/* Front wall (Z=7) */}
            <mesh position={[0, 2.5, 7]} castShadow receiveShadow>
              <boxGeometry args={[12, 5, 0.15]} />
              <meshStandardMaterial color="#3a3a5e" roughness={0.9} />
            </mesh>
            {/* Left wall (X=-6) */}
            <mesh position={[-6, 2.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.15, 5, 14]} />
              <meshStandardMaterial color="#3a3a5e" roughness={0.9} />
            </mesh>
            {/* Right wall (X=6) */}
            <mesh position={[6, 2.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.15, 5, 14]} />
              <meshStandardMaterial color="#3a3a5e" roughness={0.9} />
            </mesh>
            
            {/* Room floor */}
            <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[12, 14]} />
              <meshStandardMaterial color="#3d3530" roughness={0.7} />
            </mesh>
            
            {/* Room ceiling */}
            <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[12, 14]} />
              <meshStandardMaterial color="#2a2a3e" roughness={0.9} />
            </mesh>
            
            {/* Ceiling light */}
            <CeilingLight position={[0, 4.95, 0]} />
            
            {/* Room light */}
            <pointLight position={[0, 4, 0]} intensity={4} color="#fef3c7" distance={14} />
          </group>
          
          {/* Camera controls */}
          <OrbitControls
            makeDefault
            minDistance={3}
            maxDistance={50}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1, 25]}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
