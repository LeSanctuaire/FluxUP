<script>
  import { onMount } from 'svelte';

  const PLAYLIST_ID = 'PLnV2rehNHJEW5Jwo4MLYcs4xbS37g9tHr';

  let launched = $state(false);

  /** @type {any} instance YT.Player */
  let ytPlayer = null;

  onMount(() => {
    // Charge le SDK IFrame YouTube une seule fois
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id  = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    return () => {
      // Nettoyage si on quitte la page
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
    };
  });

  /** Crée (ou recrée) le player YouTube avec shuffle activé */
  function initPlayer() {
    /** @type {any} */
    const w = window;

    const create = () => {
      // Détruit l'instance précédente si elle existe
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }

      // #yt-player-inner est toujours dans le DOM (pas de {#if})
      ytPlayer = new w.YT.Player('yt-player-inner', {
        width: '100%',
        height: '100%',
        playerVars: {
          listType:       'playlist',
          list:           PLAYLIST_ID,
          autoplay:       1,
          rel:            0,
          modestbranding: 1,
        },
        events: {
          onReady(/** @type {any} */ e) {
            e.target.setShuffle(true);
            e.target.nextVideo();
          },
          onStateChange(/** @type {any} */ e) {
            // État 0 = fin de vidéo → passe au suivant automatiquement
            if (e.data === 0) e.target.nextVideo();
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
    // Appel direct — conserver le geste utilisateur pour que l'autoplay fonctionne
    initPlayer();
  }

  function nextVideo() {
    if (ytPlayer) ytPlayer.nextVideo();
  }
</script>

<!-- ══════════════════════════ LA CRYPTE ══════════════════════════ -->
<div class="crypte-page page fade-in">

  <!-- ── Card immersive intro ─────────────────────────────────────────────── -->
  <div class="crypte-intro-card">
    <p class="intro-lines">
      Fréquences profondes.<br />
      Pression constante.
    </p>
    <p class="intro-welcome">Bienvenue dans la Crypte</p>
  </div>

  <!-- ── Section player ───────────────────────────────────────────────────── -->
  <section class="crypte-player-section" aria-label="Sélection de la Crypte">

    <div class="player-header">
      <h2 class="player-title">Playlist Bass Music</h2>
      <span class="player-options">Mode aléatoire&nbsp;·&nbsp;Enchaînement automatique</span>
    </div>

    <!-- Wrapper 16/9 — le SDK YT injecte l'iframe dans #yt-player-inner -->
    <div class="player-wrap">
      <div class="player-inner">
        <!-- Toujours présent dans le DOM — le SDK YT cible cet élément -->
        <div id="yt-player-inner"></div>
        <!-- Placeholder par-dessus, masqué dès le lancement -->
        {#if !launched}
          <div class="player-placeholder" aria-hidden="true">
            <span class="placeholder-icon">▶</span>
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
        <button class="btn-launch btn-launch--active" onclick={launchPlayer}>
          <span class="btn-icon" aria-hidden="true">▶</span>
          Relancer
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
  .crypte-page {
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
  .crypte-intro-card {
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

  /* Ligne décorative en haut de la card */
  .crypte-intro-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-neon) 40%, var(--accent-orange) 60%, transparent);
    opacity: 0.5;
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
    text-shadow: 0 0 18px rgba(0, 229, 204, 0.25);
  }

  /* ── Section player ──────────────────────────────────────────────────────*/
  .crypte-player-section {
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
    color: var(--accent-orange);
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
      0 0 0 1px rgba(0, 229, 204, 0.06),
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
    background: #000;
  }

  .placeholder-icon {
    font-size: 3rem;
    color: rgba(255,255,255,0.08);
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
    background: var(--accent-neon);
    color: var(--bg-primary);
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
    background: var(--accent-orange);
    box-shadow: 0 0 20px var(--accent-orange-glow);
  }
  .btn-launch:active { transform: scale(0.97); }

  .btn-launch--active {
    background: rgba(0, 229, 204, 0.15);
    color: var(--accent-neon);
    border: 1px solid var(--accent-neon);
  }
  .btn-launch--active:hover {
    background: rgba(0, 229, 204, 0.25);
    box-shadow: 0 0 14px var(--accent-neon-glow);
  }

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
    border-color: var(--border-accent);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 0 10px var(--accent-neon-glow);
  }
  .btn-next:active { transform: scale(0.97); }

  /* ── Responsive ──────────────────────────────────────────────────────────*/
  @media (max-width: 600px) {
    .crypte-page {
      padding: 5rem var(--space-md) 4rem;
    }
    .crypte-intro-card {
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
