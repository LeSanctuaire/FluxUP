/**
 * core/surpriseStore.svelte.js
 * Store global partagé pour la modal "Me Surprendre" (mode aléatoire global).
 * Sélectionne aléatoirement parmi : Clips, Beats, La Crypte, Classiques Rap FR, Temple du Roots.
 * Peut être déclenché depuis n'importe quel composant (Navbar, Home…).
 */
import { pickRandomSource } from './randomSourceFactory.svelte.js';
import { ytLiveStore } from './ytLiveStore.svelte.js';

// ── État réactif (singleton Svelte 5) ────────────────────────────────────────
let showModal = $state(false);
/** @type {any} */
let currentSource = $state(null);

// ── API publique ─────────────────────────────────────────────────────────────
export const surpriseStore = {
  get showModal()    { return showModal;    },
  get currentSource() { return currentSource; },

  /** Ouvre la modal avec une source aléatoire (clip ou playlist) */
  trigger() {
    ytLiveStore.stop();
    currentSource = pickRandomSource();
    showModal = true;
  },

  /** Sélectionne une autre source sans fermer */
  next() {
    ytLiveStore.stop();
    currentSource = pickRandomSource();
  },

  /** Ferme la modal */
  close() {
    showModal    = false;
    currentSource = null;
  },
};
