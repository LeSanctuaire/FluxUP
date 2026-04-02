/**
 * core/player.js
 * Instance unique du lecteur audio global (FluxUP).
 * Utilisé comme singleton réactif via Svelte 5 $state.
 */

function createPlayer() {
  // ---- État réactif ----
  let currentTrack = $state(null);   // { id, title, artist, src, thumbnail, isRadio?, meta? }
  let playlist     = $state([]);
  let playing      = $state(false);
  let volume       = $state(0.7);
  let progress     = $state(0);      // 0–100
  let duration     = $state(0);
  let currentTime  = $state(0);
  let isRadio      = $state(false);  // true si le flux actuel est une webradio
  let hasError     = $state(false);  // true si le flux a échoué

  /** @type {HTMLAudioElement | null} */
  let audio = null;

  // ---- Initialisation de l'élément audio (côté client) ----
  function init() {
    if (typeof window === 'undefined' || audio) return;

    audio = new Audio();
    audio.volume = volume;
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', () => {
      currentTime = audio.currentTime;
      progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    });

    audio.addEventListener('loadedmetadata', () => {
      duration = audio.duration;
    });

    audio.addEventListener('ended', () => {
      // Les flux radio sont continus — ne pas passer à la piste suivante
      if (!isRadio) next();
    });

    audio.addEventListener('play',  () => { playing = true; });
    audio.addEventListener('pause', () => { playing = false; });
    audio.addEventListener('error', () => {
      playing = false;
      hasError = true;
      console.warn('[Player] Erreur de lecture audio');
    });
  }

  // ---- API publique ----

  /**
   * Charge et joue une piste ou un flux radio.
   * @param {{ id: string, title: string, artist: string, src: string, thumbnail?: string, isRadio?: boolean, meta?: object }} track
   * @param {Array}  [newPlaylist]
   */
  function play(track, newPlaylist = null) {
    init();
    if (!audio) return;

    hasError = false;
    isRadio  = !!track.isRadio;
    if (newPlaylist) playlist = newPlaylist;

    currentTrack = track;
    audio.src = track.src;
    audio.load();
    audio.play().catch(console.warn);
  }

  /** Basculer play / pause */
  function toggle() {
    init();
    if (!audio || !currentTrack) return;
    if (playing) audio.pause();
    else audio.play().catch(console.warn);
  }

  /** Arrêt complet */
  function stop() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    playing     = false;
    progress    = 0;
    currentTime = 0;
    isRadio     = false;
    hasError    = false;
    currentTrack = null;
  }

  /** Piste suivante */
  function next() {
    if (!playlist.length || !currentTrack) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const next = playlist[(idx + 1) % playlist.length];
    if (next) play(next);
  }

  /** Piste précédente */
  function prev() {
    if (!playlist.length || !currentTrack) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length];
    if (prev) play(prev);
  }

  /**
   * Se déplacer dans la piste.
   * @param {number} pct — 0 à 1
   */
  function seek(pct) {
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
  }

  /**
   * Régler le volume.
   * @param {number} val — 0 à 1
   */
  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val));
    if (audio) audio.volume = volume;
  }

  // Expose l'état et les méthodes
  return {
    get currentTrack() { return currentTrack; },
    get playing()      { return playing; },
    get volume()       { return volume; },
    get progress()     { return progress; },
    get duration()     { return duration; },
    get currentTime()  { return currentTime; },
    get playlist()     { return playlist; },
    get isRadio()      { return isRadio; },
    get hasError()     { return hasError; },
    play, toggle, stop, next, prev, seek, setVolume, init,
  };
}

// Singleton exporté
export const player = createPlayer();
