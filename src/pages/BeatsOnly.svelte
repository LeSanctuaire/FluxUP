<script>
  import { onMount } from 'svelte';
  import { allBeats } from '../services/localBeats.js';
  import { createSmartPlaylist } from '../core/smartPlaylist.js';
  import SharePanel from '../components/SharePanel.svelte';

  /** @type {{ autoPlayId?: string | null }} */
  let { autoPlayId = null } = $props();

  // ── Shuffle Fisher-Yates (pour l'affichage visuel de la grille uniquement) ─
  /** @param {typeof allBeats} arr */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Ordre aléatoire à chaque affichage de la grille ──────────────────────
  let displayedBeats = $state(shuffle(allBeats));

  // ── Smart playlist : évite les répétitions avant 80 % des titres entendus ─
  const smartPlaylist = createSmartPlaylist(allBeats, b => b.youtubeId);

  // ── État ──────────────────────────────────────────────────────────────────
  let search    = $state('');
  let modalOpen  = $state(false);
  let launched   = $state(false);

  /** Beat en cours de lecture (affiché dans le header modal) */
  /** @type {{ title: string, artist: string, channelId?: string, youtubeId: string } | null} */
  let currentBeat = $state(null);

  /** @type {any} instance YT.Player */
  let ytPlayer = null;

  // ── Filtrage ──────────────────────────────────────────────────────────────
  let filtered = $derived(
    !search
      ? displayedBeats
      : displayedBeats.filter(b =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.artist.toLowerCase().includes(search.toLowerCase())
        )
  );

  // ── SDK YouTube ───────────────────────────────────────────────────────────
  onMount(() => {
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id  = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    // Auto-launch si on arrive via une URL partagée (#/beats/{id})
    if (autoPlayId) {
      const beat = allBeats.find(/** @param {(typeof allBeats)[0]} b */ b => b.youtubeId === autoPlayId);
      if (beat) launchFrom(beat);
    }

    return () => {
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
    };
  });

  // ── Player vidéo individuel ───────────────────────────────────────────────
  /** @param {string} videoId */
  function initPlayer(videoId) {
    /** @type {any} */
    const w = window;

    const create = () => {
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }

      ytPlayer = new w.YT.Player('beats-player-inner', {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange(/** @type {any} */ e) {
            // Fin de vidéo → avance automatiquement au suivant
            if (e.data === 0) advance();
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

  /** Passe au beat suivant via le smart playlist */
  function advance() {
    const next = smartPlaylist.next();
    currentBeat = { title: next.title, artist: next.artist, channelId: next.channelId, youtubeId: next.youtubeId };
    if (ytPlayer) ytPlayer.loadVideoById(next.youtubeId);
  }

  /** Clic sur une card → enregistre le choix manuel et lance le player */
  /** @param {{ youtubeId: string, title: string, artist: string, channelId?: string }} beat */
  function launchFrom(beat) {
    smartPlaylist.playNow(beat);
    currentBeat = { title: beat.title, artist: beat.artist, channelId: beat.channelId, youtubeId: beat.youtubeId };
    modalOpen   = true;
    launched    = false;
    setTimeout(() => { launched = true; initPlayer(beat.youtubeId); }, 60);
  }

  /** Bouton "Lancer la sélection" → premier titre aléatoire via smart playlist */
  function launchRandom() {
    const beat  = smartPlaylist.next();
    currentBeat = { title: beat.title, artist: beat.artist, channelId: beat.channelId, youtubeId: beat.youtubeId };
    modalOpen   = true;
    launched    = false;
    setTimeout(() => { launched = true; initPlayer(beat.youtubeId); }, 60);
  }

  /**
   * URL de la chaîne YouTube du producteur.
   * Si channelId connu → page chaîne avec pop-up abonnement.
   * Sinon → recherche YouTube sur le nom du producteur.
   * @param {string} artist
   * @param {string | undefined} channelId
   */
  function artistChannelUrl(artist, channelId) {
    if (channelId) return `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(artist)}`;
  }

  function nextBeat() { advance(); }

  function closeModal() {
    if (ytPlayer) { try { ytPlayer.stopVideo(); ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
    smartPlaylist.reset();
    modalOpen   = false;
    launched    = false;
    currentBeat = null;
  }

  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape' && modalOpen) closeModal();
  }

  function onBackdropClick(/** @type {MouseEvent} */ e) {
    if (e.target === e.currentTarget) closeModal();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- ══════════════════════════ BEATS ONLY ══════════════════════════ -->
<div class="page fade-in">
  <div class="container">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="page-header">
      <h1 class="section-title">Beats <span class="accent-beats">Only</span></h1>
      <p class="page-sub">Écoute. Vibre. Rejoue.</p>
    </div>

    <!-- ── Toolbar : recherche + bouton lancer ──────────────────────────────── -->
    <div class="toolbar">
      <input
        class="search-input"
        type="search"
        placeholder="Rechercher un beat, un producteur…"
        bind:value={search}
        aria-label="Rechercher un beat"
      />

      <button class="btn-launch" onclick={launchRandom}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 2l9 5-9 5z" fill="currentColor"/>
        </svg>
        Lancer la sélection
      </button>
    </div>

    <!-- ── Grille des beats ─────────────────────────────────────────────────── -->
    {#if filtered.length > 0}
      <div class="grid-beats">
        {#each filtered as beat, i}
          <div
            class="beat-card fade-in"
            style="animation-delay: {i * 30}ms"
            role="button"
            tabindex="0"
            onclick={() => launchFrom(beat)}
            onkeydown={(e) => e.key === 'Enter' && launchFrom(beat)}
            aria-label="Lancer {beat.title}"
          >
            <div class="beat-thumb">
              <img
                src={beat.thumbnail}
                alt={beat.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                width="320" height="180"
                onerror={(e) => { const img = /** @type {HTMLImageElement} */ (e.currentTarget); img.style.display = 'none'; img.parentElement?.classList.add('thumb-fallback'); }}
              />
              <div class="thumb-icon" aria-hidden="true">♪</div>
              <div class="play-overlay" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="17" stroke="var(--accent-beats)" stroke-width="1.5" fill="rgba(0,0,0,0.6)"/>
                  <path d="M15 12l11 6-11 6z" fill="var(--accent-beats)"/>
                </svg>
              </div>
            </div>
            <div class="beat-info">
              <p class="beat-title" title={beat.title}>{beat.title}</p>
              {#if beat.artist}
                <p class="beat-artist">{beat.artist}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else if search}
      <p class="empty-state">Aucun beat trouvé pour « {search} »</p>
    {:else}
      <!-- Aucun beat dans beats.json → invite à lancer la sélection -->
      <div class="empty-launch">
        <p class="empty-hint">Lance la sélection pour démarrer une session beats.</p>
        <button class="btn-launch btn-launch--big" onclick={launchRandom}>
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 2l9 5-9 5z" fill="currentColor"/>
          </svg>
          Lancer la sélection
        </button>
      </div>
    {/if}

  </div>
</div>

<!-- ══════════════════════════ MODAL PLAYER ══════════════════════════ -->
{#if modalOpen}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Beats Only — Player"
    tabindex="-1"
    onclick={onBackdropClick}
    onkeydown={null}
  >
    <div class="modal-box">

      <!-- En-tête modal -->
      <div class="modal-header">
        <div class="modal-title-wrap">
          <span class="modal-badge">Beats Only</span>
          {#if currentBeat}
            <span class="modal-current-title">{currentBeat.title}</span>
            {#if currentBeat.artist}
              <a
                class="modal-current-artist"
                href={artistChannelUrl(currentBeat.artist, currentBeat.channelId)}
                target="_blank"
                rel="noopener noreferrer"
                title="Voir la chaîne YouTube"
              >{currentBeat.artist}</a>
            {/if}
          {:else}
            <span class="modal-hint">Mode aléatoire · Enchaînement automatique</span>
          {/if}
        </div>
        <button class="modal-close" onclick={closeModal} aria-label="Fermer">✕</button>
      </div>

      <!-- Player 16/9 -->
      <div class="player-wrap">
        <div class="player-inner">
          <div id="beats-player-inner"></div>
          <!-- Placeholder visible uniquement avant le lancement -->
          {#if !launched}
            <div class="player-placeholder" aria-hidden="true">
              <span class="placeholder-icon">♪</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Contrôles -->
      <div class="modal-actions">
        <button class="btn-next" onclick={nextBeat}>
          Beat suivant
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 3l7 5-7 5V3z" fill="currentColor"/>
            <rect x="12" y="3" width="2" height="10" rx="1" fill="currentColor"/>
          </svg>
        </button>

        <button class="btn-stop" onclick={closeModal}>
          <span aria-hidden="true">■</span> Fermer
        </button>

        {#if currentBeat}
          <SharePanel
            id={currentBeat.youtubeId}
            title={currentBeat.title}
            url="{window.location.origin}{window.location.pathname.replace(/\/$/, '')}#/beats/{currentBeat.youtubeId}"
            text="{currentBeat.title} — Beat sur FluxUP"
          />
        {/if}
      </div>

    </div>
  </div>
{/if}

<style>
  /* ── Variables locales couleur beats ────────────────────────────────────── */
  :root {
    --accent-beats: #F5C400;
    --accent-beats-glow: rgba(245, 196, 0, 0.25);
    --accent-beats-dim: rgba(245, 196, 0, 0.12);
  }

  /* ── Page ───────────────────────────────────────────────────────────────── */
  .accent-beats { color: var(--accent-beats); }

  .page-header { margin-bottom: var(--space-xl); }

  .page-sub {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-top: var(--space-xs);
  }

  /* ── Toolbar ─────────────────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 180px;
    max-width: 440px;
    padding: var(--space-md) var(--space-lg);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    font-size: var(--text-sm);
    font-family: var(--font-base);
    outline: none;
    transition: border-color var(--transition-fast);
  }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input:focus { border-color: var(--accent-beats); }

  /* ── Bouton Lancer ───────────────────────────────────────────────────────── */
  .btn-launch {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 11px var(--space-xl);
    background: var(--accent-beats);
    color: #0a0a0f;
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    white-space: nowrap;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }
  .btn-launch:hover {
    background: #ffd32a;
    box-shadow: 0 0 22px var(--accent-beats-glow);
  }
  .btn-launch:active { transform: scale(0.97); }

  .btn-launch--big {
    padding: 14px var(--space-2xl, 2rem);
    font-size: var(--text-base);
  }

  /* ── Grille beats ────────────────────────────────────────────────────────── */
  .grid-beats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--space-lg);
  }

  /* ── Card beat ───────────────────────────────────────────────────────────── */
  .beat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition:
      transform var(--transition-base),
      border-color var(--transition-base),
      box-shadow var(--transition-base);
  }
  .beat-card {
    cursor: pointer;
    outline: none;
  }
  .beat-card:hover,
  .beat-card:focus-visible {
    transform: translateY(-4px);
    border-color: var(--accent-beats);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 14px var(--accent-beats-glow);
  }

  /* Thumbnail */
  .beat-thumb {
    position: relative;
    width: 100%;
    height: 112px;
    background: var(--bg-secondary);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .beat-thumb img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }
  .beat-card:hover .beat-thumb img,
  .beat-card:focus-visible .beat-thumb img { transform: scale(1.05); }

  /* Overlay play */
  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-base);
  }
  .beat-card:hover .play-overlay,
  .beat-card:focus-visible .play-overlay { opacity: 1; }

  /* Icône décorative toujours présente (visible si image absent) */
  .thumb-icon {
    font-size: 2rem;
    color: rgba(245, 196, 0, 0.18);
    pointer-events: none;
    z-index: 0;
    user-select: none;
  }
  /* Quand l'image charge, masque l'icône */
  .beat-thumb img + .thumb-icon { display: none; }
  /* Si image en erreur (.thumb-fallback ajoutée via JS), réaffiche l'icône */
  .beat-thumb:global(.thumb-fallback) .thumb-icon { display: block; }

  /* Info */
  .beat-info {
    padding: var(--space-md);
    min-height: 64px;
    min-width: 0;
    overflow: hidden;
  }
  .beat-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    margin: 0 0 4px;
  }
  .beat-artist {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    margin: 0;
  }

  /* ── Empty states ────────────────────────────────────────────────────────── */
  .empty-state {
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-2xl) 0;
    font-size: var(--text-md);
  }

  .empty-launch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    padding: var(--space-2xl) 0 var(--space-3xl, 5rem);
  }
  .empty-hint {
    color: var(--text-secondary);
    font-size: var(--text-md);
    text-align: center;
    margin: 0;
  }

  /* ══ MODAL ══════════════════════════════════════════════════════════════════ */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    animation: mFadeIn 0.18s ease;
  }
  @keyframes mFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal-box {
    background: var(--bg-card);
    border: 1px solid var(--accent-beats);
    border-radius: var(--radius-xl);
    box-shadow: 0 0 60px var(--accent-beats-glow);
    width: 100%;
    max-width: 720px;
    overflow: hidden;
    animation: mSlideUp 0.22s ease;
  }
  @keyframes mSlideUp {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* En-tête modal */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-xl);
    border-bottom: 1px solid rgba(245, 196, 0, 0.2);
  }
  .modal-title-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
  }
  .modal-badge {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent-beats);
    background: var(--accent-beats-dim);
    border: 1px solid rgba(245, 196, 0, 0.3);
    border-radius: var(--radius-sm);
    padding: 3px 8px;
  }
  .modal-hint {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
  .modal-current-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 340px;
  }
  .modal-current-artist {
    font-size: var(--text-xs);
    color: var(--accent-beats);
    opacity: 0.8;
    white-space: nowrap;
    text-decoration: none;
    border-bottom: 1px dashed rgba(245, 196, 0, 0.4);
    transition: opacity var(--transition-fast), border-color var(--transition-fast);
  }
  .modal-current-artist:hover {
    opacity: 1;
    border-bottom-color: var(--accent-beats);
  }
  .modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-lg);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-md);
    transition: color var(--transition-fast), background var(--transition-fast);
    flex-shrink: 0;
  }
  .modal-close:hover { color: var(--text-primary); background: rgba(255,255,255,0.08); }

  /* Player 16/9 */
  .player-wrap {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #000;
  }
  .player-inner {
    position: absolute;
    inset: 0;
  }
  /* Le SDK YT injecte l'iframe — on la cible via :global */
  .player-wrap :global(iframe) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  .player-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    pointer-events: none;
    z-index: 0;
  }
  .placeholder-icon {
    font-size: 3.5rem;
    color: rgba(245, 196, 0, 0.1);
  }

  /* Contrôles modal */
  .modal-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-xl);
    flex-wrap: wrap;
  }

  .btn-next {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 11px var(--space-xl);
    background: var(--accent-beats);
    color: #0a0a0f;
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    white-space: nowrap;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }
  .btn-next:hover {
    background: #ffd32a;
    box-shadow: 0 0 20px var(--accent-beats-glow);
  }
  .btn-next:active { transform: scale(0.97); }

  .btn-stop {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 11px var(--space-xl);
    background: transparent;
    color: #ff3b3b;
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    border: 1px solid #ff3b3b;
    border-radius: var(--radius-md);
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 0 10px rgba(255,59,59,0.35), inset 0 0 10px rgba(255,59,59,0.05);
    transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  }
  .btn-stop:hover {
    box-shadow: 0 0 22px rgba(255,59,59,0.7), inset 0 0 14px rgba(255,59,59,0.1);
  }
  .btn-stop:active { transform: scale(0.97); }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .toolbar { flex-direction: column; align-items: stretch; }
    .search-input { max-width: 100%; }
    .btn-launch { justify-content: center; }
    .modal-actions { flex-direction: column; align-items: stretch; }
    .btn-next, .btn-stop { justify-content: center; }
    .grid-beats { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  }
</style>
