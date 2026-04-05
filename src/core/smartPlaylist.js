/**
 * core/smartPlaylist.js
 * Gestionnaire de playlist intelligente pour tous les lecteurs multi-titres.
 *
 * Garantit qu'un titre ne se répète pas avant que `threshold` × total
 * des autres titres aient été entendus (défaut : 80 %).
 *
 * Usage :
 *   const pl = createSmartPlaylist(allBeats, b => b.youtubeId);
 *   const next = pl.next();        // prochain titre aléatoire (respecte la règle)
 *   pl.playNow(beat);              // enregistre un choix manuel comme "joué"
 *   pl.reset();                    // réinitialise l'historique (ex. fermeture player)
 *
 * @template T
 * @param {T[]} tracks              - tableau de tous les titres disponibles
 * @param {(t: T) => string} getKey - retourne un identifiant unique par titre
 * @param {number} [threshold=0.8]  - fraction minimale à entendre avant répétition (0–1)
 * @returns {{ next: () => T, playNow: (t: T) => T, reset: () => void }}
 */
export function createSmartPlaylist(tracks, getKey, threshold = 0.8) {
  if (!tracks.length) throw new Error('smartPlaylist: le tableau de titres est vide');

  // Taille de la fenêtre glissante (nb de titres à ne pas répéter)
  const windowSize = Math.max(1, Math.floor(tracks.length * threshold));

  /** @type {string[]} clés des titres récemment joués (ordre chronologique) */
  const recentKeys = [];

  /**
   * Enregistre `key` dans l'historique ; retire le plus ancien si nécessaire.
   * @param {string} key
   */
  function _register(key) {
    recentKeys.push(key);
    if (recentKeys.length > windowSize) recentKeys.shift();
  }

  /**
   * Prochain titre aléatoire en excluant la fenêtre récente.
   * Si tous les titres sont bloqués (cas limite), pioche parmi tous.
   * @returns {T}
   */
  function next() {
    const blocked = new Set(recentKeys);
    const pool = tracks.filter(t => !blocked.has(getKey(t)));
    const candidates = pool.length > 0 ? pool : tracks;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    _register(getKey(pick));
    return pick;
  }

  /**
   * Enregistre un titre choisi manuellement par l'utilisateur et le retourne.
   * @param {T} track
   * @returns {T}
   */
  function playNow(track) {
    _register(getKey(track));
    return track;
  }

  /** Réinitialise l'historique (à appeler à la fermeture du player). */
  function reset() {
    recentKeys.length = 0;
  }

  return { next, playNow, reset };
}
