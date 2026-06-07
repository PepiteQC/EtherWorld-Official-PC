import { WorldManager } from '@/components/etherworld/world-manager'
import { GameHUD } from '@/components/etherworld/game-hud'
import { DevPanel } from '@/components/etherworld/dev-panel'
import { InventoryPanel } from '@/components/etherworld/inventory-panel'
import { ContextMenu } from '@/components/etherworld/context-menu-rp'

export default function EtherWorldPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      <WorldManager />
      <GameHUD />
      <DevPanel />
      <InventoryPanel />
      <ContextMenu />
    </main>
  )
}
