/**
 * src/systems/interactions/InteractionSystem.ts
 * Emplacement exact: /home/user/etherworld/src/systems/interactions/InteractionSystem.ts
 * 
 * J5 — Système d'interactions basique.
 * 
 * - Détecte proximité + touche E
 * - Types supportés : "parler", "acheter", "ouvrir", "ramasser"
 * - Connecté au dépanneur (approcher produit → E → ajouter à inventaire)
 * - Prêt à être branché sur réception hôtel, portes, etc.
 * 
 * Utilisation typique :
 *   const interaction = checkInteractions(playerPos, nearbyObjects);
 *   if (interaction && keyPressed('KeyE')) {
 *     handleInteraction(interaction);
 *   }
 */

export type InteractionType = 'parler' | 'acheter' | 'ouvrir' | 'ramasser' | 'checkin' | 'enter_room';

export interface InteractionTarget {
  id: string;
  type: InteractionType;
  label: string;           // texte affiché (ex: "Parler à la réception")
  position: [number, number, number];
  data?: any;              // ex: { productId: 'lays-original' } pour acheter
  distance?: number;
}

const INTERACTION_DISTANCE = 3.2; // mètres

let lastInteractionTime = 0;
const INTERACTION_COOLDOWN = 280; // ms anti-spam

export function checkInteractions(
  playerPosition: [number, number, number],
  targets: InteractionTarget[]
): InteractionTarget | null {
  let closest: InteractionTarget | null = null;
  let minDist = Infinity;

  for (const target of targets) {
    const dx = target.position[0] - playerPosition[0];
    const dy = target.position[1] - playerPosition[1];
    const dz = target.position[2] - playerPosition[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < INTERACTION_DISTANCE && dist < minDist) {
      minDist = dist;
      closest = { ...target, distance: dist };
    }
  }

  return closest;
}

export function canInteractNow(): boolean {
  return Date.now() - lastInteractionTime > INTERACTION_COOLDOWN;
}

export function markInteraction() {
  lastInteractionTime = Date.now();
}

/**
 * Handler principal des interactions.
 * À appeler quand le joueur appuie sur E près d'une cible.
 */
export function handleInteraction(target: InteractionTarget): string {
  if (!canInteractNow()) return 'Trop rapide';

  markInteraction();

  console.log('[InteractionSystem] Interaction déclenchée:', target.type, target.id);

  switch (target.type) {
    case 'acheter': {
      const product = target.data?.productId;
      if (product) {
        // Stub : ajoute au vrai inventaire plus tard (dépanneur inventoryStore)
        console.log('[Interaction] Acheté:', product);
        return `Vous avez acheté : ${product}`;
      }
      return 'Rien à acheter ici';
    }

    case 'parler':
    case 'checkin': {
      // Stub J5 — hôtel réception
      console.log('[Interaction] Check-in / parler à', target.id);
      return 'Check-in effectué. Vous avez reçu la clé de la chambre 204.';
    }

    case 'ouvrir':
      return `Vous ouvrez : ${target.label}`;

    case 'ramasser':
      return `Vous ramassez : ${target.label}`;

    case 'enter_room':
      return 'Vous entrez dans la chambre. (Connexion corridor à venir)';

    default:
      return 'Interaction non gérée';
  }
}

/**
 * Exemple de cibles pour le dépanneur (J5).
 * À générer dynamiquement à partir des produits du store.
 */
export function getDepanneurInteractionTargets(): InteractionTarget[] {
  // Exemple statique — plus tard on lit depuis depanneur inventoryStore
  return [
    {
      id: 'lays-original',
      type: 'acheter',
      label: 'Acheter Lay\'s Original',
      position: [4.2, 1.2, 1.8],
      data: { productId: 'lays-original', price: 4.99 },
    },
    {
      id: 'pepsi-2l',
      type: 'acheter',
      label: 'Acheter Pepsi 2L',
      position: [1.5, 1.1, -2.2],
      data: { productId: 'pepsi-2l', price: 3.29 },
    },
    {
      id: 'reception',
      type: 'checkin',
      label: 'Parler à la réception',
      position: [0, 1.6, 18],
    },
  ];
}
