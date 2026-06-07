import Game from './components/Game'
import HUD from './components/HUD'
import { useState, useEffect, useRef, useCallback } from 'react'
import { loadSave, deleteSave, type SaveData } from './hooks/useSaveSystem'
import { getActiveJob, subscribe, type ActiveJob } from './store/gameState'
import type { DoorZone } from './data/quebecBuildings'

type Phase = 'menu' | 'game'

export default function App() {
  const [speed,       setSpeed]       = useState(0)
  const [zone,        setZone]        = useState('Québec — Route 138 Ouest')
  const [mode,        setMode]        = useState<'driving' | 'walking'>('driving')
  const [saveStatus,  setSaveStatus]  = useState<'saved' | 'saving' | 'idle'>('idle')
  const [phase,       setPhase]       = useState<Phase>('menu')
  const [fade,        setFade]        = useState(false)
  const [savedGame,   setSavedGame]   = useState<SaveData | null>(null)
  const [isNewPlayer, setIsNewPlayer] = useState(false)
  const [money,       setMoney]       = useState(2500)
  const [activeJob,   setActiveJob]   = useState<ActiveJob | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [nearBuilding, setNearBuilding] = useState<DoorZone | null>(null)
  const [interiorPrompt, setInteriorPrompt] = useState<string | null>(null)
  const [isInInterior, setIsInInterior] = useState(false)

  const saveData = useRef<SaveData | null>(null)

  // Charge la sauvegarde au démarrage
  useEffect(() => {
    saveData.current = loadSave()
    setSavedGame(saveData.current)
  }, [])

  // Abonnement au store de jobs/argent
  useEffect(() => {
    const unsub = subscribe(() => {
      const { money: m } = { money: 2500 } // will be replaced below
      setActiveJob(getActiveJob())
    })

    // Polling léger pour l'argent (toutes les 500ms)
    const interval = setInterval(() => {
      const { money: m } = require('./store/gameState').getState()
      setMoney(m)
      setActiveJob(getActiveJob())
    }, 500)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [])

  // Notification quand un job se termine
  useEffect(() => {
    if (!activeJob && money > 2500) {
      const { money: currentMoney } = require('./store/gameState').getState()
      // Afficher une notification de gain
    }
  }, [activeJob, money])

  const handleStart = useCallback((continueGame: boolean) => {
    if (continueGame && saveData.current) {
      setSavedGame(saveData.current)
      setIsNewPlayer(false)
      setZone(saveData.current.zone)
      setMode(saveData.current.mode)
      setMoney(saveData.current.money ?? 2500)
    } else {
      setSavedGame(null)
      setIsNewPlayer(true)
    }
    setFade(true)
    setTimeout(() => {
      setPhase('game')
      setFade(false)
    }, 600)
  }, [])

  const handleDeleteSave = useCallback(() => {
    deleteSave()
    saveData.current = null
    setSavedGame(null)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a1628', overflow: 'hidden' }}>

      {/* Fondu */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: '#000',
        opacity: fade ? 1 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* ── MENU PRINCIPAL ── */}
      {phase === 'menu' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a1628 0%, #1a3a5c 50%, #0d2438 100%)',
          color: 'white', fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 8, color: '#4a9ede', marginBottom: 8, textTransform: 'uppercase' }}>
            Bienvenue dans
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 4, color: '#ffffff', lineHeight: 1, marginBottom: 4 }}>
            ETHERWORLD
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 12, color: '#3a7ebd', marginBottom: 2 }}>
            QC RP
          </div>
          <div style={{ fontSize: 11, color: '#2a6aa0', letterSpacing: 4, marginBottom: 40 }}>
            QUÉBEC · PORTNEUF · TROIS-RIVIÈRES · ETHERWORLD CITY
          </div>

          <div style={{
            fontSize: 10, color: '#4a8aaa', marginBottom: 36, textAlign: 'center', lineHeight: 1.9,
            border: '1px solid #1a4a6a', padding: '16px 28px', borderRadius: 4,
          }}>
            🚗 &nbsp;WASD / Flèches — Conduire &nbsp;&nbsp;&nbsp; Espace — Freiner<br />
            🚪 &nbsp;E — Sortir / Entrer dans le véhicule ou bâtiment<br />
            🚶 &nbsp;À pied : WASD pour marcher, A/D pour tourner<br />
            🌲 &nbsp;Route 138 de Québec vers EtherWorld City<br />
            🏙️ &nbsp;Laurentides · Fleuve Saint-Laurent · A-40 · Ville complète
          </div>

          {savedGame && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => handleStart(true)}
                style={{
                  background: 'rgba(20,60,20,0.6)', border: '2px solid #3acd6e',
                  color: '#60ef90', padding: '14px 48px', fontSize: 14,
                  letterSpacing: 6, cursor: 'pointer', fontFamily: 'monospace',
                  textTransform: 'uppercase', transition: 'all 0.2s', width: 320,
                }}
              >
                ▶ Continuer
              </button>
              <div style={{ fontSize: 9, color: '#3a7a4a', letterSpacing: 2 }}>
                {savedGame.zone} · {savedGame.mode === 'walking' ? 'À PIED' : 'EN VOITURE'}
                &nbsp;·&nbsp; {savedGame.money?.toLocaleString('fr-CA') ?? '0'}$
                <span style={{ marginLeft: 10, color: '#2a5a3a' }}>
                  {new Date(savedGame.savedAt).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => handleStart(false)}
            style={{
              background: 'transparent', border: '2px solid #3a8ede',
              color: '#5ab0ff', padding: '14px 48px', fontSize: 14,
              letterSpacing: 6, cursor: 'pointer', fontFamily: 'monospace',
              textTransform: 'uppercase', transition: 'all 0.2s',
              width: savedGame ? 320 : undefined,
            }}
          >
            {savedGame ? '✦ Nouvelle Partie' : '▶ Démarrer'}
          </button>

          {savedGame && (
            <button
              onClick={handleDeleteSave}
              style={{
                marginTop: 18, background: 'transparent', border: 'none',
                color: '#3a4a5a', fontSize: 9, cursor: 'pointer',
                fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase',
              }}
            >
              ✕ Effacer la sauvegarde
            </button>
          )}
        </div>
      )}

      {/* ── JEU ── */}
      {phase === 'game' && (
        <>
          <Game
            onSpeedChange={setSpeed}
            onZoneChange={setZone}
            onModeChange={setMode}
            onSaveStatus={setSaveStatus}
            onNearBuilding={setNearBuilding}
            onInteriorPrompt={setInteriorPrompt}
            onIsInInterior={setIsInInterior}
            initialSave={savedGame}
            isNewPlayer={isNewPlayer}
          />

          <HUD
            speed={speed}
            zone={zone}
            mode={mode}
            saveStatus={saveStatus}
            money={money}
            activeJob={activeJob}
            notification={notification}
            nearBuilding={nearBuilding}
            interiorPrompt={interiorPrompt}
            isInInterior={isInInterior}
          />

          {isNewPlayer && <CinematicOverlay />}
        </>
      )}
    </div>
  )
}

// ── Sous-titres cinématique ──
function CinematicOverlay() {
  const [visible, setVisible]     = useState(true)
  const [textPhase, setTextPhase] = useState(0)

  const lines = [
    { delay: 0.5, text: 'Route 138 — Portneuf, Québec' },
    { delay: 2.5, text: 'Un matin de novembre...' },
    { delay: 4.5, text: 'EtherWorld City vous attend...' },
    { delay: 6.5, text: '' },
  ]

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    lines.forEach((line, i) => {
      timers.push(setTimeout(() => setTextPhase(i), line.delay * 1000))
    })
    timers.push(setTimeout(() => setVisible(false), 8000))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute', bottom: 100, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20, textAlign: 'center', fontFamily: 'monospace',
      pointerEvents: 'none',
    }}>
      <div style={{
        color: '#d0e8ff', fontSize: 13, letterSpacing: 4,
        textTransform: 'uppercase',
        textShadow: '0 2px 12px rgba(0,0,0,0.9)',
        opacity: lines[textPhase]?.text ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}>
        {lines[textPhase]?.text}
      </div>
    </div>
  )
}