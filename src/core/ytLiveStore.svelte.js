/**
 * core/ytLiveStore.svelte.js
 * Singleton réactif pour les Streams YouTube 24/7 (FluxUP).
 * Gère l'API IFrame YouTube, le watchdog anti-freeze et les retries.
 */

import { player } from './player.svelte.js';

// ── Catalogue des streams ──────────────────────────────────────────────────
export const STREAMS = [
  {
    id:      'rap-fr',
    videoId: '3uzJeBBBI1E',
    label:   "Rap Fr 90's",
    genre:   'Old school · Boom Bap',
    emoji:   '🎤',
    color:   '#F5C400',
    glow:    'rgba(245,196,0,0.22)',
  },
  {
    id:      'reggae-dub',
    videoId: 'NQsQbq1JAIY',
    label:   'Riddims & Dubplates',
    genre:   'Reggae · Dub',
    emoji:   '🌿',
    color:   '#0ABFA3',
    glow:    'rgba(10,191,163,0.22)',
  },
  {
    id:      'hiphop-chill',
    videoId: 'L8cb7j-ojPA',
    label:   'HipHop Chill US',
    genre:   'Rap Hip-Hop hits',
    emoji:   '🎧',
    color:   '#C8631A',
    glow:    'rgba(200,99,26,0.28)',
  },
  {
    id:      'beats-sleep',
    videoId: 'rPjez8z61rI',
    label:   'Beats to Sleep',
    genre:   'Sleep · Study · Relax',
    emoji:   '🌙',
    color:   '#6C63FF',
    glow:    'rgba(108,99,255,0.25)',
  },
  {
    id:      'Essentials',
    videoId: 'WEh4EiIQ0Po',
    label:   'Essentials Radio',
    genre:   'Jazzy · Lofi Hip-Hop',
    emoji:   '☕',
    color:   '#FF9A3C',
    glow:    'rgba(255,154,60,0.25)',
  },
  {
    id:      'dreamgaze',
    videoId: 'P25UFyozJDA',
    label:   'Dreamgaze FM',
    genre:   'Dream Pop · Indie Rock',
    emoji:   '🌌',
    color:   '#E040FB',
    glow:    'rgba(224,64,251,0.25)',
  },
];

// ── Constantes watchdog ────────────────────────────────────────────────────
const WATCHDOG_MS  = 8000; // intervalle de vérification
const FREEZE_DELTA = 0.5;  // avance minimale en secondes pour ne pas être considéré comme gelé
const MAX_RETRIES  = 3;
const RETRY_DELAY  = 4000; // ms avant de recharger

// ── Store ──────────────────────────────────────────────────────────────────
function createYtLiveStore() {
  // État réactif Svelte 5
  let currentStream = $state(/** @type {typeof STREAMS[0]|null} */ (null));
  let isPlaying     = $state(false);
  let isLoading     = $state(false);
  let hasError      = $state(false);
  let retryCount    = $state(0);

  /**
   * Données live récupérées via IFrame API + oEmbed.
   * @type {{ title: string, author: string, channelUrl: string, thumbnail: string } | null}
   */
  let videoData = $state(null);

  /** @type {any} instance YT.Player */
  let ytPlayer = null;

  /** @type {ReturnType<typeof setInterval>|null} */
  let watchdogTimer = null;

  /** @type {ReturnType<typeof setTimeout>|null} */
  let retryTimer = null;

  /** @type {HTMLElement|null} Conteneur off-screen pour l'iframe YT */
  let container = null;

  /** Dernière valeur de getCurrentTime() pour la détection de freeze */
  let lastTime = /** @type {number|null} */ (null);

  // ── Helpers DOM ──────────────────────────────────────────────────────────

  /** Charge l'API IFrame YouTube une seule fois */
  function ensureApiScript() {
    if (document.getElementById('yt-iframe-api')) return;
    const tag = document.createElement('script');
    tag.id  = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  /** Crée (ou réutilise) le conteneur off-screen dans le body */
  function ensureContainer() {
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.id = 'yt-live-offscreen';
    // Positionné hors-écran : le player YT a besoin d'un nœud visible dans le DOM
    Object.assign(container.style, {
      position:      'fixed',
      bottom:        '0',
      right:         '0',
      width:         '2px',
      height:        '2px',
      overflow:      'hidden',
      opacity:       '0',
      pointerEvents: 'none',
      zIndex:        '0',
    });
    document.body.appendChild(container);
    return container;
  }

  /** Supprime le conteneur off-screen */
  function removeContainer() {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  }

  // ── Watchdog ─────────────────────────────────────────────────────────────

  function startWatchdog() {
    stopWatchdog();
    lastTime = null;
    watchdogTimer = setInterval(() => {
      if (!ytPlayer) return;
      try {
        const state = ytPlayer.getPlayerState(); // 1 = PLAYING
        if (state === 1) {
          const t = ytPlayer.getCurrentTime();
          if (lastTime !== null && (t - lastTime) < FREEZE_DELTA) {
            console.warn('[YtLive] Freeze détecté — rechargement dans', RETRY_DELAY, 'ms');
            scheduleRetry();
          }
          lastTime = t;
        }
      } catch (_) { /* player détruit entre temps */ }
    }, WATCHDOG_MS);
  }

  function stopWatchdog() {
    if (watchdogTimer !== null) { clearInterval(watchdogTimer); watchdogTimer = null; }
    if (retryTimer    !== null) { clearTimeout(retryTimer);     retryTimer    = null; }
  }

  function scheduleRetry() {
    stopWatchdog(); // évite les retries en cascade
    if (retryCount >= MAX_RETRIES) {
      console.warn('[YtLive] Max retries atteint');
      hasError  = true;
      isPlaying = false;
      return;
    }
    retryCount++;
    retryTimer = setTimeout(() => {
      if (currentStream) initPlayer(currentStream.videoId);
    }, RETRY_DELAY);
  }

  // ── Player YT ─────────────────────────────────────────────────────────────

  /**
   * Récupère titre, auteur et URL chaîne via YouTube oEmbed (sans clé API).
   * @param {string} videoId
   */
  async function fetchVideoData(videoId) {
    try {
      // 1) oEmbed → title + author_name + thumbnail_url
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!res.ok) throw new Error('oEmbed failed');
      const data = await res.json();

      videoData = {
        title:      data.title       ?? '',
        author:     data.author_name ?? '',
        // oEmbed ne donne pas l'ID de chaîne directement ; on construit le lien
        // via author_url (ex: https://www.youtube.com/@Channel)
        channelUrl: data.author_url  ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(data.author_name ?? '')}`,
        thumbnail:  data.thumbnail_url ?? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    } catch (_) {
      // Fallback minimaliste si oEmbed échoue (CORS en dev possible)
      videoData = {
        title:      '',
        author:     '',
        channelUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail:  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    }
  }

  /**
   * @param {string} videoId
   */
  function initPlayer(videoId) {
    const w = /** @type {any} */ (window);

    const doCreate = () => {
      // Détruit l'instance précédente
      if (ytPlayer) {
        try { ytPlayer.destroy(); } catch (_) {}
        ytPlayer = null;
      }

      // Prépare un nœud cible frais
      const c = ensureContainer();
      c.innerHTML = '';
      const inner = document.createElement('div');
      inner.id = 'yt-live-inner-' + Date.now();
      c.appendChild(inner);

      ytPlayer = new w.YT.Player(inner.id, {
        width:  '2',
        height: '2',
        videoId,
        playerVars: {
          autoplay:       1,
          controls:       0,
          rel:            0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady(/** @type {any} */ _e) {
            isLoading = false;
            isPlaying = true;
            hasError  = false;
            // Synchronise le volume YT avec le volume du player central (0–1 → 0–100)
            try { ytPlayer.setVolume(Math.round(player.volume * 100)); } catch (_) {}
            startWatchdog();
            fetchVideoData(videoId);
          },
          onStateChange(/** @type {any} */ e) {
            // YT.PlayerState : -1 non démarré, 0 terminé, 1 lecture, 2 pause, 3 buffer
            if (e.data === 1) {
              isPlaying = true;
              hasError  = false;
            } else if (e.data === 2) {
              isPlaying = false;
            } else if (e.data === 0) {
              // Stream terminé → recharge
              isPlaying = false;
              scheduleRetry();
            }
          },
          onError(/** @type {any} */ _e) {
            hasError  = true;
            isPlaying = false;
            isLoading = false;
            scheduleRetry();
          },
        },
      });
    };

    if (w.YT?.Player) {
      doCreate();
    } else {
      // L'API n'est pas encore prête : on s'accroche au callback global
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        doCreate();
      };
    }
  }

  // ── API publique ──────────────────────────────────────────────────────────

  /**
   * Lance un stream YouTube 24/7.
   * Stoppe le player audio global pour éviter les conflits.
   * @param {typeof STREAMS[0]} stream
   */
  function playLive(stream) {
    // Stoppe l'audio classique (webradio / beats)
    player.stop();

    stopWatchdog();
    hasError      = false;
    retryCount    = 0;
    isLoading     = true;
    isPlaying     = false;
    currentStream = stream;

    ensureApiScript();
    initPlayer(stream.videoId);
  }

  /** Arrêt complet du stream en cours */
  function stop() {
    stopWatchdog();
    if (ytPlayer) {
      try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch (_) {}
      ytPlayer = null;
    }
    removeContainer();
    currentStream = null;
    isPlaying     = false;
    isLoading     = false;
    hasError      = false;
    retryCount    = 0;
    videoData     = null;
  }

  /** Bascule play / pause sur le stream actif */
  function toggle() {
    if (!ytPlayer || !currentStream) return;
    try {
      const state = ytPlayer.getPlayerState();
      if (state === 1) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } catch (_) {}
  }

  /**
   * Applique un volume au player YT (appelé depuis le player central).
   * @param {number} val — 0 à 1
   */
  function setVolume(val) {
    if (!ytPlayer) return;
    try { ytPlayer.setVolume(Math.round(Math.max(0, Math.min(1, val)) * 100)); } catch (_) {}
  }

  /** Reconnexion manuelle (recharge le stream depuis zéro) */
  function reconnect() {
    if (!currentStream) return;
    retryCount = 0;
    hasError   = false;
    isLoading  = true;
    initPlayer(currentStream.videoId);
  }

  return {
    get currentStream() { return currentStream; },
    get isPlaying()     { return isPlaying; },
    get isLoading()     { return isLoading; },
    get hasError()      { return hasError; },
    get retryCount()    { return retryCount; },
    get videoData()     { return videoData; },
    get streams()       { return STREAMS; },
    playLive, stop, toggle, reconnect, setVolume,
  };
}

export const ytLiveStore = createYtLiveStore();
