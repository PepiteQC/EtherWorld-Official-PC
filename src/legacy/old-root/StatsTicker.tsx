import { useEffect, useRef } from 'react';

const events = [
  { type: 'arrest', icon: '🚔', text: 'Agent Lapointe arrête Marcel Dubois pour vol à main armée — Zone Vieux-Québec' },
  { type: 'deal', icon: '💊', text: 'Transaction suspecte détectée au Marché Souterrain — District Est' },
  { type: 'robbery', icon: '🏦', text: 'Alerte braquage en cours — Banque Nationale, Boulevard René-Lévesque' },
  { type: 'faction', icon: '⚔️', text: 'Conflit territorial entre factions — Quartier Saint-Roch' },
  { type: 'economy', icon: '💰', text: 'Transaction: $45,000 CAD transférés — Compte offshore confirmé' },
  { type: 'join', icon: '🎮', text: 'Nouveau joueur connecté: Alexandre_Mercier — Personnage créé' },
  { type: 'medical', icon: '🚑', text: 'EMS en intervention — 3 blessés critiques, Autoroute 40' },
  { type: 'drug', icon: '🧪', text: 'Saisie de drogue confirmée: 2kg crystal — Labo clandestin neutralisé' },
  { type: 'news', icon: '📰', text: 'Gouvernement annonce: Nouvelles taxes sur les commerces — Effet immédiat' },
];

const typeColors: Record<string, string> = {
  arrest: '#3b82f6',
  deal: '#a855f7',
  robbery: '#ef4444',
  faction: '#f59e0b',
  economy: '#22c55e',
  join: '#06b6d4',
  medical: '#22c55e',
  drug: '#ec4899',
  news: '#f97316',
};

export default function StatsTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pos = 0;
    const speed = 0.5;
    let animId: number;

    const animate = () => {
      pos -= speed;
      const halfWidth = el.scrollWidth / 2;
      if (Math.abs(pos) >= halfWidth) {
        pos = 0;
      }
      el.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const doubled = [...events, ...events];

  return (
    <div className="relative py-3 bg-black/80 border-y border-gray-900/80 overflow-hidden">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10" />
      
      {/* Live badge */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-red-900/80 border border-red-700/50 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
        <span className="font-orbitron text-red-400 font-bold text-[10px] tracking-widest">LIVE</span>
      </div>
      
      <div ref={scrollRef} className="flex items-center gap-12 whitespace-nowrap pl-24 will-change-transform">
        {doubled.map((event, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-base">{event.icon}</span>
            <span
              className="font-rajdhani text-sm font-semibold text-xs"
              style={{ color: typeColors[event.type] || '#9ca3af' }}
            >
              [{event.type.toUpperCase()}]
            </span>
            <span className="font-rajdhani text-gray-400 text-sm">{event.text}</span>
            <span className="text-gray-700 mx-2">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
