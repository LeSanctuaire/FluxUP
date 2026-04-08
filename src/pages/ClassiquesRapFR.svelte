<script>
  import { onMount } from 'svelte';
  import { classiquesStore } from '../core/classiquesStore.svelte.js';

  const PLAYLIST_ID = 'PLnV2rehNHJEVhwoOadKlmYYXvqHGhw9vD';

  let launched = $state(false);

  /** @type {any} instance YT.Player */
  let ytPlayer = null;

  /** true dès qu'une playlist est chargée dans le player (mode ≠ single video) */
  let inPlaylistMode = false;

  onMount(() => {
    // Charge le SDK IFrame YouTube une seule fois
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id  = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    // Si un clip a été demandé depuis le slider Home → lancement auto
    if (classiquesStore.requestedVideoId) {
      launched = true;
      initPlayer(classiquesStore.requestedVideoId);
      classiquesStore.requestedVideoId = null;
    }

    return () => {
      // Nettoyage si on quitte la page
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
    };
  });

  /**
   * Crée (ou recrée) le player YouTube.
   * @param {string|null} [videoId] - si fourni, joue ce clip puis continue la playlist
   */
  function initPlayer(videoId = null) {
    /** @type {any} */
    const w = window;

    const create = () => {
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }

      // videoId est un param de premier niveau, pas dans playerVars
      const ctorOpts = videoId
        ? {
            videoId,
            playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
          }
        : {
            playerVars: { listType: 'playlist', list: PLAYLIST_ID, autoplay: 1, rel: 0, modestbranding: 1 },
          };

      inPlaylistMode = !videoId;

      ytPlayer = new w.YT.Player('yt-rap-player-inner', {
        width: '100%',
        height: '100%',
        ...ctorOpts,
        events: {
          onReady(/** @type {any} */ e) {
            if (!videoId) {
              e.target.setShuffle(true);
              e.target.nextVideo();
            }
          },
          onStateChange(/** @type {any} */ e) {
            if (e.data === 0) {
              if (videoId) {
                // Clip terminé → bascule sur la playlist en shuffle
                e.target.loadPlaylist({ listType: 'playlist', list: PLAYLIST_ID });
                e.target.setShuffle(true);
                videoId = null;
                inPlaylistMode = true;
              } else {
                e.target.nextVideo();
              }
            }
          },
        },
      });
    };

    if (w.YT?.Player) {
      create();
    } else {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { if (prev) prev(); create(); };
    }
  }

  function launchPlayer() {
    launched = true;
    initPlayer();
  }

  function stopPlayer() {
    // pauseVideo() au lieu de stopVideo() : évite de déclencher onStateChange(0)
    // qui appellerait nextVideo() et relancerait la lecture avant destroy()
    if (ytPlayer) { try { ytPlayer.pauseVideo(); ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
    inPlaylistMode = false;
    launched = false;
  }

  function nextVideo() {
    if (!ytPlayer) return;
    if (!inPlaylistMode) {
      // Mode single-video : charge la playlist complète en shuffle
      ytPlayer.loadPlaylist({ listType: 'playlist', list: PLAYLIST_ID });
      ytPlayer.setShuffle(true);
      inPlaylistMode = true;
    } else {
      ytPlayer.nextVideo();
    }
  }
</script>

<!-- ══════════════════════════ CLASSIQUES RAP FR ══════════════════════════ -->
<div class="rap-page page fade-in">

  <!-- ── Card immersive intro ─────────────────────────────────────────────── -->
  <div class="rap-intro-card">
    <p class="intro-lines">
      Des classiques intemporels.<br />
      Une époque. Une énergie.
    </p>
    <p class="intro-welcome">Les sons qui ont <span class="accent-blue">marqué</span> plus d'une <span class="accent-blue">génération.</span></p>
  </div>

  <!-- ── Section player ───────────────────────────────────────────────────── -->
  <section class="rap-player-section" aria-label="Classiques Rap FR">

    <div class="player-header">
      <h2 class="player-title">Classiques Rap FR</h2>
      <span class="player-options">Mode aléatoire&nbsp;·&nbsp;Enchaînement automatique</span>
    </div>

    <!-- Wrapper 16/9 — le SDK YT injecte l'iframe dans #yt-rap-player-inner -->
    <div class="player-wrap">
      <div class="player-inner">
        <!-- Toujours présent dans le DOM — le SDK YT cible cet élément -->
        <div id="yt-rap-player-inner"></div>
        <!-- Placeholder par-dessus, masqué dès le lancement -->
        {#if !launched}
          <div class="player-placeholder" aria-hidden="true">
            <div class="placeholder-content">
              <span class="placeholder-genre">RAP FRANÇAIS</span>
              <span class="placeholder-title">Classiques</span>
              <span class="placeholder-sub">Une époque. Une énergie.</span>
              <span class="placeholder-play">▶</span>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="player-actions">
      {#if !launched}
        <button class="btn-launch" onclick={launchPlayer}>
          <span class="btn-icon" aria-hidden="true">▶</span>
          Lancer la sélection
        </button>
      {:else}
        <button class="btn-stop" onclick={stopPlayer}>
          <span class="btn-icon" aria-hidden="true">■</span>
          STOP
        </button>
      {/if}

      <button class="btn-next" onclick={nextVideo} title="Passer au titre suivant">
        Titre suivant
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 3l7 5-7 5V3z" fill="currentColor"/>
          <rect x="12" y="3" width="2" height="10" rx="1" fill="currentColor"/>
        </svg>
      </button>
    </div>

  </section>

</div>

<style>
  /* ── Page ───────────────────────────────────────────────────────────────── */
  .rap-page {
    min-height: 100vh;
    padding: 6rem var(--space-lg) 5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xl, 3rem);
    max-width: 860px;
    margin: 0 auto;
  }

  /* ── Card intro ──────────────────────────────────────────────────────────*/
  .rap-intro-card {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: var(--space-xl) var(--space-2xl, 2.5rem);
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  }

  /* Ligne décorative en haut de la card — bleu néon profond */
  .rap-intro-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e6fff 40%, #00b4ff 60%, transparent);
    opacity: 0.6;
  }

  .intro-lines {
    font-size: var(--text-base, 1rem);
    color: var(--text-secondary);
    letter-spacing: 0.08em;
    line-height: 1.9;
    margin: 0 0 var(--space-lg);
    text-transform: uppercase;
  }

  .intro-welcome {
    font-size: clamp(var(--text-lg), 4vw, var(--text-2xl));
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
    text-shadow: 0 0 18px rgba(0, 180, 255, 0.25);
  }

  .intro-welcome .accent-blue {
    color: #00b4ff;
    text-shadow: 0 0 14px rgba(0, 180, 255, 0.45);
  }

  /* ── Section player ──────────────────────────────────────────────────────*/
  .rap-player-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .player-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .player-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: #00b4ff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0;
  }

  .player-options {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.5;
  }

  /* Ratio 16/9 */
  .player-wrap {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #000;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow:
      0 0 0 1px rgba(0, 180, 255, 0.08),
      0 8px 48px rgba(0, 0, 0, 0.7);
  }

  /* Le SDK YT injecte lui-même l'iframe — on la cible via :global */
  .player-wrap :global(iframe) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .player-inner {
    position: absolute;
    inset: 0;
  }

  .player-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      linear-gradient(160deg, #050a1a 0%, #0a0f2e 40%, #080d20 70%, #020508 100%);
  }

  /* Grain subtil via SVG data URI */
  .player-placeholder::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
  }

  /* Lueur bleue centrale */
  .player-placeholder::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 55%, rgba(30, 111, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .placeholder-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    padding: 1rem;
  }

  .placeholder-genre {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #00b4ff;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .placeholder-title {
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-primary);
    line-height: 1;
    text-shadow: 0 0 40px rgba(30, 111, 255, 0.3);
  }

  .placeholder-sub {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.45;
    margin-top: 0.25rem;
  }

  .placeholder-play {
    margin-top: 1.5rem;
    font-size: 2rem;
    color: rgba(30, 111, 255, 0.25);
  }

  /* ── Actions ─────────────────────────────────────────────────────────────*/
  .player-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .btn-launch {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 12px var(--space-2xl, 2rem);
    background: #1e6fff;
    color: #fff;
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
  }
  .btn-launch:hover {
    background: #00b4ff;
    box-shadow: 0 0 20px rgba(0, 180, 255, 0.45);
  }
  .btn-launch:active { transform: scale(0.97); }

  .btn-stop {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 12px var(--space-2xl, 2rem);
    background: transparent;
    color: #ff3b3b;
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: 1px solid #ff3b3b;
    border-radius: var(--radius-md);
    cursor: pointer;
    box-shadow: 0 0 10px rgba(255,59,59,0.4), inset 0 0 10px rgba(255,59,59,0.05);
    transition: box-shadow var(--transition-fast), transform var(--transition-fast);
    white-space: nowrap;
  }
  .btn-stop:hover {
    box-shadow: 0 0 20px rgba(255,59,59,0.7), inset 0 0 14px rgba(255,59,59,0.1);
  }
  .btn-stop:active { transform: scale(0.97); }

  .btn-icon { font-size: 0.8em; }

  .btn-next {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 12px var(--space-xl);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast),
      background var(--transition-fast),
      box-shadow var(--transition-fast);
    white-space: nowrap;
  }
  .btn-next:hover {
    color: var(--text-primary);
    border-color: #1e6fff;
    background: rgba(30, 111, 255, 0.07);
    box-shadow: 0 0 10px rgba(0, 180, 255, 0.2);
  }
  .btn-next:active { transform: scale(0.97); }

  /* ── Responsive ──────────────────────────────────────────────────────────*/
  @media (max-width: 600px) {
    .rap-page {
      padding: 5rem var(--space-md) 4rem;
    }
    .rap-intro-card {
      padding: var(--space-lg) var(--space-lg);
    }
    .player-header {
      flex-direction: column;
      gap: var(--space-xs);
    }
    .player-actions {
      flex-direction: column;
      align-items: stretch;
    }
    .btn-launch,
    .btn-next {
      justify-content: center;
      width: 100%;
    }
  }
</style>
