import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import Terrain from './Terrain'
import Road from './Road'
import Trees from './Trees'
import Buildings from './Buildings'
import QuebecCity from './QuebecCity'
import Vehicle from './Vehicle'
import Walker from './Walker'
import Sky from './Sky'
import CinematicIntro from './CinematicIntro'
import InteriorScene from './InteriorScene'
import EtherWorldCity from './EtherWorldCity'
import { writeSave, type SaveData } from '../hooks/useSaveSystem'
import { getBuildingDoors, type DoorZone, type BuildingDef } from '../data/quebecBuildings'
import { startJob, getState as getGameState } from '../store/gameState'

enum Controls {
  forward = 'forward',
  back    = 'back',
  left    = 'left',
  right   = 'right',
  brake   = 'brake',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp',    'KeyW'] },
  { name: Controls.back,    keys: ['ArrowDown',  'KeyS'] },
  { name: Controls.left,    keys: ['ArrowLeft',  'KeyA'] },
  { name: Controls.right,   keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.brake,   keys: ['Space'] },
]

// Zone entrée dans EtherWorld City (z ≈ +800)
const CITY_ENTRY_Z = 800

// Zones de la route + ville
const ALL_ZONES = [
  { zMin: -950, zMax: -600, name: 'Québec — Route 138 Ouest' },
  { zMin: -600, zMax: -350, name: 'Donnacona · Neuville' },
  { zMin: -350, zMax: -150, name: 'Cap-Santé · Grondines' },
  { zMin: -150, zMax:  150, name: 'Portneuf — Village' },
  { zMin:  150, zMax:  400, name: 'Saint-Casimir · Batiscan' },
  { zMin:  400, zMax:  600, name: 'Champlain — Bord du Fleuve' },
  { zMin:  600, zMax:  800, name: 'Trois-Rivières — Approche' },
  // ── EtherWorld City ──
  { zMin:  800, zMax:  950, name: '🏙️ EtherWorld — Centre-Ville' },
]

interface InteriorState {
  id: string
  interiorId: string
  doorPos: [number, number, number]
  job?: BuildingDef['job']
}

interface GameProps {
  onSpeedChange:   (speed: number) => void
  onZoneChange:    (zone: string) => void
  onModeChange:    (mode: 'driving' | 'walking') => void
  onSaveStatus:    (status: 'saved' | 'saving' | 'idle') => void
  onNearBuilding?: (zone: DoorZone | null) => void
  onInteriorPrompt?: (label: string | null) => void
  onIsInInterior?: (v: boolean) => void
  initialSave?:    SaveData | null
  isNewPlayer?:    boolean
}

interface SceneProps extends GameProps {
  cinematicDone:       boolean
  onCinematicComplete: () => void
}

const BUILDING_ZONES = getBuildingDoors()

// ════════════════════════════════════════════════════════════════
// SCÈNE PRINCIPALE
// ════════════════════════════════════════════════════════════════

function Scene({
  onSpeedChange,
  onZoneChange,
  onModeChange,
  onSaveStatus,
  onNearBuilding,
  onInteriorPrompt,
  onIsInInterior,
  initialSave,
  cinematicDone,
  onCinematicComplete,
}: SceneProps) {
  const [mode, setMode] = useState<'driving' | 'walking'>(
    initialSave?.mode ?? 'driving'
  )
  const [walkerStart, setWalkerStart] = useState<THREE.Vector3>(
    initialSave?.mode === 'walking' && initialSave.walkerPos
      ? new THREE.Vector3(...initialSave.walkerPos)
      : new THREE.Vector3(0, 1, -700)
  )
  const [interior, setInterior] = useState<InteriorState | null>(null)

  const vehicleWorldPos = useRef(new THREE.Vector3(0, 0.5, -700))
  const modeRef         = useRef<'driving' | 'walking'>(initialSave?.mode ?? 'driving')
  const zoneRef         = useRef<string>(initialSave?.zone ?? 'Québec — Route 138 Ouest')

  const vehicleSaveRef = useRef({
    pos:  new THREE.Vector3(...(initialSave?.vehiclePos ?? [0, 0.5, -700])),
    rotY: initialSave?.vehicleRotY ?? 0,
  })
  const walkerSaveRef = useRef<THREE.Vector3>(
    initialSave?.walkerPos
      ? new THREE.Vector3(...initialSave.walkerPos)
      : new THREE.Vector3(0, 1, -700)
  )

  // ── Sauvegarde auto toutes les 30s ──
  useEffect(() => {
    const doSave = () => {
      onSaveStatus('saving')
      writeSave({
        version:     1,
        mode:        modeRef.current,
        vehiclePos:  [vehicleSaveRef.current.pos.x, vehicleSaveRef.current.pos.y, vehicleSaveRef.current.pos.z],
        vehicleRotY: vehicleSaveRef.current.rotY,
        walkerPos:   modeRef.current === 'walking'
          ? [walkerSaveRef.current.x, walkerSaveRef.current.y, walkerSaveRef.current.z]
          : undefined,
        zone:  zoneRef.current,
        money: getGameState().money,
      })
      onSaveStatus('saved')
      setTimeout(() => onSaveStatus('idle'), 2500)
    }
    const interval = setInterval(doSave, 30_000)
    return () => clearInterval(interval)
  }, [onSaveStatus])

  // ── Gestion véhicule / piéton ──
  const handleExitVehicle = useCallback((pos: THREE.Vector3) => {
    setWalkerStart(pos.clone())
    setMode('walking')
    modeRef.current = 'walking'
    onModeChange('walking')
    onSaveStatus('saving')
    writeSave({
      version: 1, mode: 'walking',
      vehiclePos: [vehicleSaveRef.current.pos.x, vehicleSaveRef.current.pos.y, vehicleSaveRef.current.pos.z],
      vehicleRotY: vehicleSaveRef.current.rotY,
      walkerPos: [pos.x + 3, 1, pos.z],
      zone: zoneRef.current,
      money: getGameState().money,
    })
    onSaveStatus('saved')
    setTimeout(() => onSaveStatus('idle'), 2500)
  }, [onModeChange, onSaveStatus])

  const handleEnterVehicle = useCallback(() => {
    setMode('driving')
    modeRef.current = 'driving'
    onModeChange('driving')
    onSpeedChange(0)
    onSaveStatus('saving')
    writeSave({
      version: 1, mode: 'driving',
      vehiclePos: [vehicleSaveRef.current.pos.x, vehicleSaveRef.current.pos.y, vehicleSaveRef.current.pos.z],
      vehicleRotY: vehicleSaveRef.current.rotY,
      zone: zoneRef.current,
      money: getGameState().money,
    })
    onSaveStatus('saved')
    setTimeout(() => onSaveStatus('idle'), 2500)
  }, [onModeChange, onSpeedChange, onSaveStatus])

  const handleZoneChange = useCallback((zone: string) => {
    zoneRef.current = zone
    onZoneChange(zone)
  }, [onZoneChange])

  // ── Bâtiments (Route 138) ──
  const handleInteractBuilding = useCallback((zone: DoorZone) => {
    if (zone.hasInterior && zone.interiorId) {
      setInterior({ id: zone.id, interiorId: zone.interiorId, doorPos: zone.pos, job: zone.job })
      onIsInInterior?.(true)
    } else if (zone.job) {
      startJob(zone.job)
    }
  }, [onIsInInterior])

  const handleExitInterior = useCallback(() => {
    if (interior) {
      setWalkerStart(new THREE.Vector3(...interior.doorPos))
    }
    setInterior(null)
    onIsInInterior?.(false)
    onInteriorPrompt?.(null)
  }, [interior, onIsInInterior, onInteriorPrompt])

  const handleInteriorPrompt = useCallback((_type: string | null, label: string | null) => {
    onInteriorPrompt?.(label)
  }, [onInteriorPrompt])

  const initVehiclePos = (initialSave?.vehiclePos ?? [0, 0.5, -700]) as [number, number, number]
  const initVehicleRotY = initialSave?.vehicleRotY ?? 0

  return (
    <>
      {/* ── Éclairage global ── */}
      <ambientLight intensity={0.55} color="#b0c8e8" />
      <directionalLight
        position={[80, 120, -200]}
        intensity={1.4}
        color="#fff8e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={600}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0003}
      />
      <hemisphereLight args={['#87ceeb', '#3a5a2a', 0.4]} />

      {/* ── Brouillard ── */}
      <fog attach="fog" args={['#7aadda', 80, 600]} />

      {/* ── Environnement Route 138 ── */}
      <Sky />
      <Terrain />
      <Road />
      <Trees />
      <Buildings />
      <QuebecCity />

      {/* ── Sol de base ── */}
      <mesh
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 3000]} />
        <meshLambertMaterial color="#2a4a2a" />
      </mesh>

      {/* ════════════════════════════════════════════════════════
          🏙️ ETHERWORLD CITY — Au bout de la Route 138 (z=+900)
          ════════════════════════════════════════════════════════ */}
      <EtherWorldCity />

      {/* ── Cinématique intro ── */}
      {!cinematicDone && <CinematicIntro onComplete={onCinematicComplete} />}

      {/* ── Véhicule ── */}
      <Vehicle
        active={mode === 'driving' && cinematicDone && !interior}
        onSpeedChange={onSpeedChange}
        onZoneChange={(zone) => {
          // Enrichit le nom de zone avec l'info ville
          const z = vehicleWorldPos.current.z
          if (z > CITY_ENTRY_Z) {
            handleZoneChange('🏙️ EtherWorld — Centre-Ville')
          } else {
            handleZoneChange(zone)
          }
        }}
        onExitVehicle={handleExitVehicle}
        worldPositionRef={vehicleWorldPos}
        initialPosition={initVehiclePos}
        initialRotationY={initVehicleRotY}
        saveRef={vehicleSaveRef}
      />

      {/* ── Piéton ── */}
      {mode === 'walking' && cinematicDone && !interior && (
        <Walker
          startPosition={walkerStart}
          onSpeedChange={onSpeedChange}
          onZoneChange={(zone) => {
            const z = walkerSaveRef.current.z
            if (z > CITY_ENTRY_Z) {
              handleZoneChange('🏙️ EtherWorld — Centre-Ville')
            } else {
              handleZoneChange(zone)
            }
          }}
          onEnterVehicle={handleEnterVehicle}
          vehiclePosition={vehicleWorldPos}
          saveRef={walkerSaveRef}
          buildingZones={BUILDING_ZONES}
          onNearBuilding={onNearBuilding}
          onInteractBuilding={handleInteractBuilding}
        />
      )}

      {/* ── Intérieur bâtiment ── */}
      {interior && (
        <InteriorScene
          interiorId={interior.interiorId}
          buildingJob={interior.job}
          onExit={handleExitInterior}
          onNearInteraction={handleInteriorPrompt}
        />
      )}
    </>
  )
}

// ════════════════════════════════════════════════════════════════
// EXPORT PRINCIPAL
// ════════════════════════════════════════════════════════════════

export default function Game({
  onSpeedChange,
  onZoneChange,
  onModeChange,
  onSaveStatus,
  onNearBuilding,
  onInteriorPrompt,
  onIsInInterior,
  initialSave,
  isNewPlayer = false,
}: GameProps) {
  const [cinematicDone, setCinematicDone] = useState(!isNewPlayer)
  const handleCinematicComplete = useCallback(() => setCinematicDone(true), [])

  const initPos = initialSave?.vehiclePos ?? [0, 0.5, -700]
  const camZ = initPos[2] + 15

  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        camera={{ position: [0, 5, camZ], fov: 65, near: 0.1, far: 900 }}
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene
          onSpeedChange={onSpeedChange}
          onZoneChange={onZoneChange}
          onModeChange={onModeChange}
          onSaveStatus={onSaveStatus}
          onNearBuilding={onNearBuilding}
          onInteriorPrompt={onInteriorPrompt}
          onIsInInterior={onIsInInterior}
          initialSave={initialSave}
          cinematicDone={cinematicDone}
          onCinematicComplete={handleCinematicComplete}
        />
      </Canvas>
    </KeyboardControls>
  )
}