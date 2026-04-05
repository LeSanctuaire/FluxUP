/**
 * Store de playlist pour "Lancer la sélection" depuis LesClips.
 * Persiste la liste et la position lors de la navigation entre pages ClipDetail.
 */

/** @type {{ youtubeId: string, title: string, artist?: string }[]} */
let clips = $state([]);
let idx   = $state(-1);

export const playlistStore = {
  get isActive() { return clips.length > 0 && idx >= 0; },
  get hasNext()  { return idx >= 0 && idx < clips.length - 1; },
  get current()  { return clips[idx] ?? null; },
  get nextClip() { return clips[idx + 1] ?? null; },
  get position() { return idx + 1; },
  get total()    { return clips.length; },

  /** Lance la playlist depuis un index donné */
  /** @param {{ youtubeId: string, title: string, artist?: string }[]} list */
  launch(list, startIdx = 0) {
    clips = list;
    idx   = startIdx;
  },

  /** Synchronise l'index si l'utilisateur navigue vers un clip déjà dans la playlist */
  /** @param {string} youtubeId */
  syncId(youtubeId) {
    const i = clips.findIndex(c => c.youtubeId === youtubeId);
    if (i >= 0) idx = i;
  },

  /** Avance au clip suivant, retourne le clip ou null */
  advance() {
    if (idx < clips.length - 1) {
      idx++;
      return clips[idx];
    }
    return null;
  },

  clear() {
    clips = [];
    idx   = -1;
  },
};
