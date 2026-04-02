/**
 * core/surpriseStore.svelte.js
 * Store global partagé pour la modal "Me Surprendre" (clips aléatoires).
 * Peut être déclenché depuis n'importe quel composant (Navbar, Home…).
 */
import clipsData from '../data/clips.json';

// ── État réactif (singleton Svelte 5) ────────────────────────────────────────
let showModal   = $state(false);
let currentClip = $state(null);
let seenIds     = $state(new Set());

/**
 * Choisit un clip aléatoire non encore vu.
 * Réinitialise quand tous les clips ont été affichés.
 */
function getRandomClip() {
  if (seenIds.size >= clipsData.length) seenIds = new Set();
  const unseen = clipsData.filter(c => !seenIds.has(c.youtubeId));
  const pick   = unseen[Math.floor(Math.random() * unseen.length)];
  seenIds      = new Set([...seenIds, pick.youtubeId]);
  return pick;
}

// ── API publique ─────────────────────────────────────────────────────────────
export const surpriseStore = {
  get showModal()   { return showModal;   },
  get currentClip() { return currentClip; },

  /** Ouvre la modal avec un clip aléatoire */
  trigger() {
    currentClip = getRandomClip();
    showModal   = true;
  },

  /** Passe au clip suivant sans fermer */
  next() {
    currentClip = getRandomClip();
  },

  /** Ferme la modal */
  close() {
    showModal   = false;
    currentClip = null;
  },
};
