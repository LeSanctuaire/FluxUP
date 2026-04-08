/**
 * core/classiquesStore.svelte.js
 * Transmet l'ID d'un clip classique sélectionné depuis le slider Home
 * vers la page ClassiquesRapFR pour lancement immédiat.
 */

export const classiquesStore = $state({ requestedVideoId: /** @type {string|null} */ (null) });
