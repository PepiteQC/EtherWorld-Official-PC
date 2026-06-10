import { useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const ruleCategories = [
  {
    id: 'general',
    icon: '🌐',
    title: 'Règles Générales',
    color: '#06b6d4',
    rules: [
      { num: '1.1', title: 'Respect avant tout', desc: 'Insultes, harcèlement, discrimination (racisme, sexisme, homophobie) strictement interdits en et hors jeu.', severity: 'critical' },
      { num: '1.2', title: 'Langue principale', desc: 'Le français est la langue principale. L\'anglais est toléré mais fortement déconseillé.', severity: 'info' },
      { num: '1.3', title: 'Âge minimum', desc: '16 ans minimum pour jouer sur ETHERWORLD RP. Exceptions possibles avec accord de la direction.', severity: 'warning' },
      { num: '1.4', title: 'Pseudo & identité', desc: 'Nom complet réaliste obligatoire (prénom + nom). Les pseudos "xXDarkKillerXx" ne sont pas acceptés.', severity: 'warning' },
    ]
  },
  {
    id: 'roleplay',
    icon: '🎭',
    title: 'Règles de Roleplay',
    color: '#a855f7',
    rules: [
      { num: '2.1', title: 'Rester en personnage (IC)', desc: 'Dès que tu es en jeu, tu es ton personnage. Rester IC en tout temps sauf zones OOC ou urgence réelle.', severity: 'info' },
      { num: '2.2', title: 'Powergaming — INTERDIT', desc: 'Forcer des actions sans laisser réagir l\'autre joueur, ou utiliser des capacités irréalistes. Ex: "/me lui arrache le bras sans réponse"', severity: 'critical' },
      { num: '2.3', title: 'Metagaming — INTERDIT', desc: 'Utiliser des infos hors jeu (Discord, stream) en jeu. Ex: regarder le stream d\'un ami pour le localiser.', severity: 'critical' },
      { num: '2.4', title: 'RDM — INTERDIT', desc: 'Tuer sans raison RP valable. Tout affrontement doit être précédé d\'une interaction RP claire.', severity: 'critical' },
      { num: '2.5', title: 'VDM — INTERDIT', desc: 'Utiliser un véhicule comme arme pour tuer/blesser intentionnellement sans contexte RP.', severity: 'critical' },
      { num: '2.6', title: 'Fear RP', desc: 'Ton personnage doit craindre pour sa vie. Si quelqu\'un te pointe une arme, tu ne peux pas ignorer la situation.', severity: 'warning' },
      { num: '2.7', title: 'New Life Rule (NLR)', desc: 'Après une mort, ton personnage ne se souvient pas des événements. Pas de retour sur les lieux pendant 15 minutes.', severity: 'warning' },
      { num: '2.8', title: 'RP de qualité', desc: 'Un minimum d\'effort dans l\'écriture et l\'interprétation est attendu. Le RP immersif et réaliste est fortement encouragé.', severity: 'info' },
    ]
  },
  {
    id: 'factions',
    icon: '🚔',
    title: 'Règles des Factions',
    color: '#f59e0b',
    rules: [
      { num: '3.1', title: 'Factions officielles', desc: 'Police, EMS, Gouvernement doivent respecter leurs protocoles internes en plus du règlement général.', severity: 'warning' },
      { num: '3.2', title: 'Organisations criminelles', desc: 'Les gangs doivent être enregistrés auprès du staff. Activités non affiliées tolérées dans la mesure du raisonnable.', severity: 'info' },
      { num: '3.3', title: 'Équilibre civil/criminel', desc: 'Un maximum de joueurs criminels actifs sera établi selon le nombre de joueurs en ligne pour maintenir l\'équilibre.', severity: 'info' },
    ]
  },
  {
    id: 'combat',
    icon: '🔫',
    title: 'Combat & Criminalité',
    color: '#ef4444',
    rules: [
      { num: '4.1', title: 'Initiation RP obligatoire', desc: 'Toute violence nécessite une interaction RP préalable. Menace verbale, ultimatum ou mise en scène requis.', severity: 'critical' },
      { num: '4.2', title: 'Prises d\'otage', desc: 'Autorisées dans un cadre RP strict. L\'otage doit être consentant. Il peut refuser hors RP si trop mal à l\'aise.', severity: 'warning' },
      { num: '4.3', title: 'Braquages', desc: 'Autorisés selon règles du staff. Un minimum de joueurs en ligne peut être requis selon le type de braquage.', severity: 'info' },
      { num: '4.4', title: 'Zones sécurisées', desc: 'Hôpital et spawn initial sont des Safe Zones. Aucun acte de violence n\'y est toléré sous aucun prétexte.', severity: 'critical' },
    ]
  },
  {
    id: 'sanctions',
    icon: '⚠️',
    title: 'Système de Sanctions',
    color: '#f97316',
    rules: [
      { num: '⚪ Palier 1', title: 'Avertissement verbal', desc: 'Petit écart RP, oubli de règle mineure.', severity: 'info' },
      { num: '🟡 Palier 2', title: 'Warn officiel', desc: 'RDM mineur, metagaming léger.', severity: 'warning' },
      { num: '🟠 Palier 3', title: 'Kick / Suspension 24-72h', desc: 'Récidive, VDM, powergaming.', severity: 'warning' },
      { num: '🔴 Palier 4', title: 'Ban temporaire 1-30 jours', desc: 'Récidive grave, toxicité envers la communauté.', severity: 'critical' },
      { num: '⛔ Palier 5', title: 'Ban permanent', desc: 'Hack, cheat, harcèlement grave, discrimination.', severity: 'critical' },
    ]
  },
];

const severityStyles = {
  critical: { bg: 'bg-red-900/20', border: 'border-red-700/30', dot: 'bg-red-500', label: 'Critique', color: 'text-red-400' },
  warning: { bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', dot: 'bg-yellow-500', label: 'Important', color: 'text-yellow-400' },
  info: { bg: 'bg-blue-900/10', border: 'border-blue-800/30', dot: 'bg-blue-500', label: 'Info', color: 'text-blue-400' },
};

export default function RulesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.05 });
  const [activeTab, setActiveTab] = useState('general');
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeCategory = ruleCategories.find(c => c.id === activeTab) || ruleCategories[0];

  return (
    <section id="rules" ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050509] to-black" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-700/40 text-xs font-rajdhani text-yellow-400 tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            RÈGLEMENT OFFICIEL v1.0
          </div>
          <h2 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl text-white mb-4">
            LES <span className="gradient-text">RÈGLES</span> DU JEU
          </h2>
          <p className="font-rajdhani text-xl text-gray-400 max-w-2xl mx-auto">
            En rejoignant ETHERWORLD RP, tu acceptes l'ensemble de ce règlement. 
            L'ignorance d'une règle ne dispense pas de la respecter.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Category tabs */}
          <div className={`lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {ruleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveTab(cat.id); setExpanded(null); }}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${
                  activeTab === cat.id
                    ? 'border-purple-600/60 bg-purple-900/30 text-white'
                    : 'border-gray-800/60 bg-black/40 text-gray-400 hover:border-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xl flex-shrink-0">{cat.icon}</span>
                <span className="font-rajdhani font-semibold text-sm whitespace-nowrap lg:whitespace-normal">{cat.title}</span>
                <span className="ml-auto flex-shrink-0 text-xs font-orbitron text-gray-600">{cat.rules.length}</span>
              </button>
            ))}
          </div>

          {/* Rules list */}
          <div className={`flex-1 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl">{activeCategory.icon}</span>
              <div>
                <h3 className="font-orbitron font-black text-xl text-white">{activeCategory.title}</h3>
                <div className="text-xs font-rajdhani text-gray-500">{activeCategory.rules.length} règles</div>
              </div>
              <div className="ml-auto w-16 h-0.5 rounded-full"
                style={{ background: `linear-gradient(to right, ${activeCategory.color}, transparent)` }} />
            </div>

            <div className="space-y-3">
              {activeCategory.rules.map((rule, i) => {
                const sev = severityStyles[rule.severity as keyof typeof severityStyles];
                const isOpen = expanded === rule.num;
                return (
                  <button
                    key={rule.num}
                    onClick={() => setExpanded(isOpen ? null : rule.num)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${sev.bg} ${sev.border} hover:brightness-110`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sev.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`font-orbitron text-xs font-bold ${sev.color} flex-shrink-0`}>{rule.num}</span>
                            <span className="font-rajdhani font-bold text-white truncate">{rule.title}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`hidden sm:block text-xs font-rajdhani ${sev.color} px-2 py-0.5 rounded-full`}
                              style={{ background: `${sev.dot.replace('bg-', '#')}15` }}>
                              {sev.label}
                            </span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {isOpen && (
                          <p className="font-rajdhani text-gray-300 mt-3 leading-relaxed text-sm">
                            {rule.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="mt-8 p-4 rounded-xl bg-black/60 border border-gray-800/40 flex items-start gap-3">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-rajdhani text-sm text-gray-400 leading-relaxed">
                  Les sanctions peuvent être contestées via un ticket sur le Discord officiel dans un délai de <strong className="text-white">72 heures</strong>. 
                  Le règlement peut être modifié à tout moment — les mises à jour sont annoncées sur Discord.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
