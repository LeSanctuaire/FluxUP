<script>
  import { ytLiveStore, STREAMS } from '../core/ytLiveStore.svelte.js';

  /** Stream actif dérivé du store */
  let activeId   = $derived(ytLiveStore.currentStream?.id ?? null);
  let isLoading  = $derived(ytLiveStore.isLoading);
  let isPlaying  = $derived(ytLiveStore.isPlaying);
  let hasError   = $derived(ytLiveStore.hasError);
  let videoData  = $derived(ytLiveStore.videoData);

  function handlePlay(stream) {
    if (activeId === stream.id) {
      // Déjà actif → toggle play/pause
      ytLiveStore.toggle();
    } else {
      ytLiveStore.playLive(stream);
    }
  }

  function handleStop(e) {
    e.stopPropagation();
    ytLiveStore.stop();
  }

  /**
   * Action Svelte : défile doucement si le texte dépasse la largeur du parent.
   * Doit être posé sur un <span> inline-block à l'intérieur du <p> clip.
   * @param {HTMLElement} node
   */
  function marquee(node) {
    function update() {
      const parent = node.parentElement;
      if (!parent) return;
      const overflow = node.scrollWidth - parent.clientWidth;
      if (overflow > 4) {
        node.style.setProperty('--marquee-dist', `-${overflow}px`);
        node.setAttribute('data-marquee', '');
      } else {
        node.style.removeProperty('--marquee-dist');
        node.removeAttribute('data-marquee');
      }
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node.parentElement ?? node);
    // Observe aussi la card parente pour détecter l'apparition de card-video-data
    const card = node.closest('.stream-card');
    if (card) ro.observe(card);
    return { destroy() { ro.disconnect(); } };
  }
</script>

<!-- ══════════════════════════ STREAMS 24/7 ══════════════════════════ -->
<div class="streams-page page fade-in">

  <!-- En-tête ──────────────────────────────────────────────────────── -->
  <header class="streams-header">
    <span class="badge badge--live">
      <span class="live-dot-badge" aria-hidden="true"></span>
      Lives Radios Youtube
    </span>
    <h1 class="streams-title">
      <span class="live-dot-lg" aria-hidden="true"></span>
      Streams 24/7
    </h1>
    <p class="streams-subtitle">
      Lives YouTube en continu · sélectionnés par FluxUP.<br>
      Lancement direct dans le player central.
    </p>
  </header>

  <!-- Grille de cards ───────────────────────────────────────────────── -->
  <section class="streams-grid" aria-label="Streams disponibles">
    {#each STREAMS as stream (stream.id)}
      {@const isActive   = activeId === stream.id}
      {@const isThisLoading = isActive && isLoading}
      {@const isThisPlaying = isActive && isPlaying}
      {@const isThisError   = isActive && hasError}

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="stream-card"
        class:stream-card--active={isActive}
        style="--card-color:{stream.color};--card-glow:{stream.glow}"
        onclick={() => handlePlay(stream)}
        role="button"
        tabindex="0"
        aria-pressed={isActive}
        aria-label="Lancer le stream {stream.label}"
        onkeydown={(e) => e.key === 'Enter' && handlePlay(stream)}
      >
        <!-- Badge LIVE ──────────────────────────────────────────── -->
        <div class="card-live-badge" class:badge--playing={isThisPlaying}>
          <span class="badge-dot" aria-hidden="true"></span>
          LIVE
        </div>

        <!-- Emoji / Icône genre ─────────────────────────────────── -->
        <div class="card-emoji" aria-hidden="true">{stream.emoji}</div>

        <!-- Infos ───────────────────────────────────────────────── -->
        <div class="card-info">
          <p class="card-genre">{stream.genre}</p>
          <h2 class="card-label">{stream.label}</h2>
        </div>

        <!-- Indicateur d'erreur ─────────────────────────────────── -->
        {#if isThisError}
          <div class="card-error">
            <span>⚠ Stream instable</span>
            <button
              class="btn-reconnect"
              onclick={(e) => { e.stopPropagation(); ytLiveStore.reconnect(); }}
              aria-label="Reconnecter le stream"
            >
              Reconnecter
            </button>
          </div>
        {/if}

        <!-- Contrôles ────────────────────────────────────────────── -->
        <div class="card-controls">
          {#if isActive}
            <!-- Bouton play/pause -->
            <button
              class="btn-play btn-play--active"
              aria-label={isThisPlaying ? 'Pause' : 'Reprendre'}
              onclick={(e) => { e.stopPropagation(); ytLiveStore.toggle(); }}
            >
              {#if isThisLoading}
                <span class="spinner" aria-hidden="true"></span>
              {:else if isThisPlaying}
                ⏸
              {:else}
                ▶
              {/if}
            </button>

            <!-- Bouton stop -->
            <button
              class="btn-stop"
              aria-label="Arrêter le stream"
              onclick={handleStop}
            >
              ⏹
            </button>
          {:else}
            <!-- Bouton lancer -->
            <button
              class="btn-play"
              aria-label="Lancer {stream.label}"
              onclick={(e) => { e.stopPropagation(); handlePlay(stream); }}
            >
              ▶
            </button>
          {/if}
        </div>

        <!-- Nombre de retries si erreur ─────────────────────────── -->
        {#if isThisError && ytLiveStore.retryCount > 0}
          <p class="retry-info" aria-live="polite">
            Tentative {ytLiveStore.retryCount} / 3
          </p>
        {/if}

        <!-- Données live (thumbnail + titre + auteur + S'abonner) ── -->
        {#if isActive && videoData}
          <div class="card-video-data">
            {#if videoData.thumbnail}
              <img class="vd-thumb" src={videoData.thumbnail} alt="thumbnail" width="80" height="45" />
            {/if}
            {#if videoData.title}
              <p class="vd-title"><span use:marquee>{videoData.title}</span></p>
            {/if}
            {#if videoData.author}
              <p class="vd-author"><span use:marquee>par {videoData.author}</span></p>
            {/if}
            <a
              class="btn-subscribe"
              href={videoData.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="S'abonner à la chaîne YouTube"
              onclick={(e) => e.stopPropagation()}
            >
              <svg class="yt-logo" viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              S'abonner
            </a>
          </div>
        {/if}
      </div>
    {/each}
  </section>

  <!-- Note bas de page ─────────────────────────────────────────────── -->
  <p class="streams-note">
    Les streams YouTube 24/7 peuvent être instables. FluxUP tente une reconnexion automatique en cas de coupure.
  </p>

</div>

<style>
  /* ── Page ─────────────────────────────────────────────────────────────── */
  .streams-page {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg) var(--space-2xl);
  }

  /* ── Header ───────────────────────────────────────────────────────────── */
  .streams-header {
    text-align: center;
    margin-bottom: var(--space-2xl);
  }

  /* Badge "Lives Radios Youtube" — même style que badge Live de Home */
  .badge--live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 40, 40, 0.18);
    color: #ff4444;
    border: 1px solid rgba(255, 40, 40, 0.35);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 12px;
    margin-bottom: var(--space-md);
  }

  .live-dot-badge {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff4444;
    box-shadow: 0 0 5px rgba(255, 68, 68, 0.7);
    flex-shrink: 0;
    animation: pulseDot 1.4s ease-in-out infinite;
  }

  .streams-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    font-size: clamp(var(--text-2xl), 5vw, var(--text-3xl));
    font-weight: 900;
    letter-spacing: 0.04em;
    color: var(--text-primary);
    margin: 0 0 var(--space-md);
    text-transform: uppercase;
  }

  /* Gros point LIVE animé dans le titre */
  .live-dot-lg {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff3333;
    box-shadow: 0 0 10px rgba(255, 51, 51, 0.75);
    animation: pulseDot 1.4s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.45; transform: scale(0.7); }
  }

  .streams-subtitle {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
  }

  /* ── Grille ───────────────────────────────────────────────────────────── */
  .streams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  /* ── Card ─────────────────────────────────────────────────────────────── */
  .stream-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: var(--space-xl) var(--space-lg) var(--space-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    cursor: pointer;
    min-width: 0;        /* empêche le grid item de dépasser 1fr sur mobile */
    overflow: hidden;    /* bloque tout débordement interne (texte nowrap) */
    transition:
      border-color var(--transition-base),
      box-shadow   var(--transition-base),
      transform    var(--transition-base),
      background   var(--transition-base);
    outline: none;
    user-select: none;
  }

  .stream-card:hover {
    border-color: var(--card-color, var(--border-accent));
    box-shadow: 0 0 28px var(--card-glow, var(--accent-neon-glow));
    transform: translateY(-3px);
    background: var(--bg-hover);
  }

  .stream-card:focus-visible {
    border-color: var(--card-color);
    box-shadow: 0 0 0 2px var(--card-color);
  }

  .stream-card--active {
    border-color: var(--card-color) !important;
    box-shadow: 0 0 32px var(--card-glow) !important;
    background: color-mix(in srgb, var(--card-color) 5%, var(--bg-card)) !important;
  }

  /* Trait de couleur en haut de la card active */
  .stream-card--active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 2px;
    border-radius: var(--radius-full);
    background: var(--card-color);
    box-shadow: 0 0 12px var(--card-glow);
  }

  /* ── Badge LIVE ───────────────────────────────────────────────────────── */
  .card-live-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .card-live-badge.badge--playing {
    color: #ff3333;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .badge--playing .badge-dot {
    box-shadow: 0 0 5px rgba(255, 51, 51, 0.7);
    animation: pulseDot 1.4s ease-in-out infinite;
  }

  /* ── Emoji ────────────────────────────────────────────────────────────── */
  .card-emoji {
    font-size: 2.8rem;
    line-height: 1;
    filter: drop-shadow(0 0 10px var(--card-glow, transparent));
    transition: transform var(--transition-base), filter var(--transition-base);
  }

  .stream-card:hover .card-emoji,
  .stream-card--active .card-emoji {
    transform: scale(1.1);
    filter: drop-shadow(0 0 16px var(--card-glow));
  }

  /* ── Infos ────────────────────────────────────────────────────────────── */
  .card-info {
    text-align: center;
  }

  .card-genre {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--card-color, var(--accent-neon));
    margin: 0 0 4px;
    opacity: 0.85;
  }

  .card-label {
    font-size: var(--text-lg);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
  }

  /* ── Erreur ───────────────────────────────────────────────────────────── */
  .card-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-xs);
    color: #ff6b6b;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid rgba(255, 107, 107, 0.2);
    border-radius: var(--radius-md);
    background: rgba(255, 77, 77, 0.05);
    text-align: center;
    width: 100%;
  }

  .btn-reconnect {
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #ff6b6b;
    background: transparent;
    border: 1px solid rgba(255, 107, 107, 0.4);
    border-radius: var(--radius-md);
    padding: 4px 12px;
    cursor: pointer;
    transition: background var(--transition-fast), box-shadow var(--transition-fast);
  }
  .btn-reconnect:hover {
    background: rgba(255, 77, 77, 0.1);
    box-shadow: 0 0 8px rgba(255, 77, 77, 0.25);
  }

  /* ── Contrôles ────────────────────────────────────────────────────────── */
  .card-controls {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
  }

  .btn-play {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    border: 1px solid var(--card-color, var(--border-accent));
    background: transparent;
    color: var(--card-color, var(--accent-neon));
    font-size: 1.1rem;
    cursor: pointer;
    transition:
      background   var(--transition-fast),
      box-shadow   var(--transition-fast),
      transform    var(--transition-fast);
  }

  .btn-play:hover {
    background: color-mix(in srgb, var(--card-color) 12%, transparent);
    box-shadow: 0 0 16px var(--card-glow, var(--accent-neon-glow));
    transform: scale(1.08);
  }

  .btn-play--active {
    background: color-mix(in srgb, var(--card-color) 10%, transparent);
    box-shadow: 0 0 18px var(--card-glow, var(--accent-neon-glow));
  }

  .btn-stop {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 0.9rem;
    cursor: pointer;
    transition: color var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .btn-stop:hover {
    color: #ff4d4d;
    border-color: rgba(255, 77, 77, 0.45);
    box-shadow: 0 0 8px rgba(255, 77, 77, 0.25);
    transform: scale(1.08);
  }

  /* Spinner de chargement */
  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Info retries ─────────────────────────────────────────────────────── */
  .retry-info {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin: 0;
    letter-spacing: 0.04em;
  }

  /* ── Données live ─────────────────────────────────────────────────────── */
  .card-video-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    min-width: 0;
    overflow: hidden;
    align-self: stretch; /* force width:100% à se résoudre depuis la card */
    padding: var(--space-sm) var(--space-md);
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    text-align: center;
    animation: fadeIn 0.3s ease both;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .vd-thumb {
    width: 80px;
    height: 45px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }

  /* <p> = clip container, hauteur fixe, jamais agrandie */
  .vd-title,
  .vd-author {
    margin: 0;
    overflow: hidden;
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .vd-title { font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); }
  .vd-author { font-size: var(--text-xs); color: var(--text-secondary); }

  /* <span> = texte en ligne, défile quand data-marquee est posé par l'action */
  .vd-title span,
  .vd-author span {
    display: inline-block;
    white-space: nowrap;
  }

  :global(.vd-title span[data-marquee]) {
    animation: marqueeSlide 12s 1.5s ease-in-out infinite alternate;
  }

  :global(.vd-author span[data-marquee]) {
    animation: marqueeSlide 10s 2s ease-in-out infinite alternate;
  }

  @keyframes marqueeSlide {
    0%, 10%   { transform: translateX(0); }
    90%, 100% { transform: translateX(var(--marquee-dist, 0)); }
  }

  /* Même style que ClipDetail */
  .btn-subscribe {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px var(--space-lg);
    background: #FF0000;
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    transition:
      background var(--transition-fast),
      box-shadow  var(--transition-fast),
      transform   var(--transition-fast);
  }
  .btn-subscribe:hover {
    background: #CC0000;
    box-shadow: 0 0 20px rgba(255,0,0,0.45);
  }
  .btn-subscribe:active { transform: scale(0.97); }

  /* ── Note bas de page ─────────────────────────────────────────────────── */
  .streams-note {
    text-align: center;
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 520px;
    margin: 0 auto;
    padding-top: var(--space-md);
    border-top: 1px solid var(--border);
  }

  /* ── Responsive ───────────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .streams-grid {
      grid-template-columns: 1fr;
    }
    .streams-title {
      font-size: var(--text-xl);
    }
  }
</style>
