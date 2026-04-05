<script>
  import { debounce } from '../core/utils.js';
  import { searchRadios, getFeaturedRadios, getFrenchIndieRadios, CURATED_STATIONS, PAGE_SIZE } from '../services/radioAPI.js';
  import { player } from '../core/player.svelte.js';

  // Mode : 'curated' = sélection FluxUP, 'fr' = radios françaises indé, 'world' = top mondial
  let mode = $state('curated');

  // État pagination
  let currentPage = $state(1);
  let hasMore     = $state(true);

  // Données
  let featured      = $state([]);
  let searchResults = $state([]);
  let query         = $state('');
  let loading       = $state(false);
  let prevQuery     = '';

  // Station active dérivée du player global
  let activeStation = $derived(
    player.isRadio && player.currentTrack?.meta ? player.currentTrack.meta : null
  );

  // Erreur flux dérivée du player
  let streamError = $derived(player.isRadio && player.hasError);

  // Chargement initial + rechargement au changement de mode
  $effect(() => {
    const m = mode; // track la dépendance réactive
    loadDefault(1, m);
  });

  /** @param {number} page @param {string} m */
  async function loadDefault(page, m) {
    // Mode curation : données locales, pas d'appel API
    if (m === 'curated') {
      featured    = CURATED_STATIONS;
      hasMore     = false;
      currentPage = 1;
      scrollToTop();
      return;
    }
    loading = true;
    const offset = (page - 1) * PAGE_SIZE;
    const results = m === 'fr'
      ? await getFrenchIndieRadios(PAGE_SIZE, offset)
      : await getFeaturedRadios(PAGE_SIZE, offset);
    featured    = results;
    hasMore     = results.length === PAGE_SIZE;
    currentPage = page;
    loading     = false;
    scrollToTop();
  }

  /** Bascule entre les modes France / Monde. @param {string} m */
  function switchMode(m) {
    if (m === mode) return;
    query         = '';
    searchResults = [];
    prevQuery     = '';
    mode          = m; // déclenche le $effect ci-dessus
  }

  // Recherche avec debounce — réinitialise la page à 1 si la query change
  const doSearch = debounce(async (q) => {
    if (!q.trim()) { searchResults = []; hasMore = true; return; }
    loading = true;
    if (q !== prevQuery) {
      currentPage = 1;
      prevQuery   = q;
    }
    const offset  = (currentPage - 1) * PAGE_SIZE;
    const results = await searchRadios(q, PAGE_SIZE, offset);
    searchResults = results;
    hasMore       = results.length === PAGE_SIZE;
    loading       = false;
    scrollToTop();
  }, 400);

  $effect(() => { doSearch(query); });

  /** @param {number} page */
  async function goToPage(page) {
    if (page < 1) return;
    currentPage = page;
    if (query.trim()) {
      loading = true;
      const offset  = (page - 1) * PAGE_SIZE;
      const results = await searchRadios(query, PAGE_SIZE, offset);
      searchResults = results;
      hasMore       = results.length === PAGE_SIZE;
      loading       = false;
      scrollToTop();
    } else {
      await loadDefault(page, mode);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Charge et joue une station dans le player global. @param {import('../services/radioAPI.js').Station} station */
  function playStation(station) {
    player.play({
      id:        station.stationuuid,
      title:     station.name,
      artist:    [station.country, station.tags].filter(Boolean).join(' · '),
      src:       station.url_resolved,
      thumbnail: station.favicon || null,
      isRadio:   true,
      meta:      station,
    });
  }

  /** Arrête la radio et libère le player. */
  function stopStation() {
    player.stop();
  }

  let displayList = $derived(query.trim() ? searchResults : featured);

  // Fenêtre glissante de numéros de page (±2 autour de la courante)
  let pageNumbers = $derived(() => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(1, currentPage - range); i <= currentPage + range; i++) {
      pages.push(i);
      if (!hasMore && i >= currentPage) break;
    }
    return pages;
  });

  // Label du sous-titre selon le contexte
  let subtitle = $derived(
    query.trim()
      ? 'résultats de recherche'
      : mode === 'curated'
        ? 'sélection éditoriale FluxUP'
        : mode === 'fr'
          ? 'radios Françaises'
          : 'top votes mondial'
  );
</script>

<div class="page fade-in">
  <div class="container">
    <!-- En-tête -->
    <div class="page-header">
      <h1 class="section-title">Radio <span>Flux</span></h1>
      <p class="page-sub">Webradios en direct — {subtitle}</p>
    </div>

    <!-- Station active -->
    {#if activeStation}
      <div class="now-playing" class:error={streamError}>
        <div class="np-waves" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="np-info">
          {#if streamError}
            <span class="badge badge-error">Flux indisponible</span>
          {:else}
            <span class="badge">En cours</span>
          {/if}
          <p class="np-name">{activeStation.name}</p>
          <p class="np-tags">{activeStation.tags ?? ''}</p>
        </div>
        <button class="np-stop" onclick={stopStation} aria-label="Arrêter">⏹ Stop</button>
      </div>
    {/if}

    <!-- Toggle Curation / France / Monde -->
    <div class="mode-toggle" role="group" aria-label="Sélection du mode">
      <button
        class="mode-btn mode-btn--curated"
        class:active={mode === 'curated'}
        onclick={() => switchMode('curated')}
      >✦ Sélection FluxUP</button>
      <button
        class="mode-btn"
        class:active={mode === 'fr'}
        onclick={() => switchMode('fr')}
      ><span class="flag-fr" aria-hidden="true"></span> France</button>
      <button
        class="mode-btn"
        class:active={mode === 'world'}
        onclick={() => switchMode('world')}
      ><span class="flag-world" aria-hidden="true">◉</span> Top mondial</button>
    </div>

    <!-- Recherche + infos page -->
    <div class="search-row">
      <input
        class="search-input"
        type="search"
        placeholder="Rechercher une radio (nom, genre, pays…)"
        bind:value={query}
        aria-label="Rechercher une radio"
      />
      {#if loading}
        <span class="loading-dot" aria-live="polite">Recherche…</span>
      {:else if displayList.length}
        <span class="page-info">Page {currentPage} · {displayList.length} radios</span>
      {/if}
    </div>

    <!-- Liste radios -->
    {#if displayList.length}
      <div class="radio-grid">
        {#each displayList as station}
          <div
            class="radio-card"
            class:active={activeStation?.stationuuid === station.stationuuid}
            role="button"
            tabindex="0"
            aria-label={`Écouter ${station.name}`}
            onclick={() => playStation(station)}
            onkeydown={(e) => e.key === 'Enter' && playStation(station)}
          >
            <div class="radio-favicon">
              {#if station.favicon}
                <img src={station.favicon} alt="" width="40" height="40" loading="lazy"
                  onerror={(e) => { /** @type {HTMLImageElement} */ (e.target).style.display='none'; }} />
              {:else}
                <span aria-hidden="true">📻</span>
              {/if}
            </div>
            <div class="radio-info">
              <p class="radio-name">{station.name}</p>
              <p class="radio-meta">{[station.country, station.tags].filter(Boolean).join(' · ')}</p>
              {#if station.bitrate}
                <span class="badge">{station.bitrate} kbps</span>
              {/if}
            </div>
            <button
              class="play-btn"
              aria-label={activeStation?.stationuuid === station.stationuuid ? 'En lecture' : 'Lire'}
            >
              {activeStation?.stationuuid === station.stationuuid ? '⏸' : '▶'}
            </button>
          </div>
        {/each}
      </div>

      <!-- Pagination — masquée en mode curation (liste locale fixe) -->
      {#if mode !== 'curated' && !query.trim()}
        <nav class="pagination" aria-label="Navigation des pages">
          <button
            class="page-btn"
            onclick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            aria-label="Page précédente"
          >‹ Préc.</button>

          {#each pageNumbers() as p}
            <button
              class="page-btn"
              class:current={p === currentPage}
              onclick={() => goToPage(p)}
              disabled={loading}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >{p}</button>
          {/each}

          <button
            class="page-btn"
            onclick={() => goToPage(currentPage + 1)}
            disabled={!hasMore || loading}
            aria-label="Page suivante"
          >Suiv. ›</button>
        </nav>
      {/if}

    {:else if !loading}
      <p class="empty-state">
        {query ? `Aucune radio trouvée pour « ${query} »` : 'Chargement des radios…'}
      </p>
    {:else}
      <p class="empty-state loading-dot">Chargement…</p>
    {/if}
  </div>
</div>

<style>
  /* ── Thème violet — surcharge locale des variables neon pour la page radio ── */
  .page {
    --accent-neon:       #9D00FF;
    --accent-neon-glow:  rgba(157, 0, 255, 0.25);
    --border-accent:     rgba(157, 0, 255, 0.35);
  }

  .page-header { margin-bottom: var(--space-lg); }
  .page-sub { color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-xs); }

  /* Now playing */
  .now-playing {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    background: var(--bg-card);
    border: 1px solid var(--accent-neon);
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-xl);
    margin-bottom: var(--space-xl);
    box-shadow: 0 0 20px var(--accent-neon-glow);
  }

  .np-waves {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 28px;
    flex-shrink: 0;
  }
  .np-waves span {
    width: 4px;
    background: var(--accent-neon);
    border-radius: var(--radius-full);
    animation: wave 1s ease-in-out infinite;
  }
  .np-waves span:nth-child(1) { animation-delay: 0s;    height: 40%; }
  .np-waves span:nth-child(2) { animation-delay: 0.1s;  height: 80%; }
  .np-waves span:nth-child(3) { animation-delay: 0.2s;  height: 100%; }
  .np-waves span:nth-child(4) { animation-delay: 0.3s;  height: 60%; }
  .np-waves span:nth-child(5) { animation-delay: 0.4s;  height: 30%; }

  @keyframes wave {
    0%, 100% { transform: scaleY(1); }
    50%       { transform: scaleY(0.2); }
  }

  .np-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .np-name  { font-size: var(--text-md); font-weight: 700; color: var(--text-primary); }
  .np-tags  { font-size: var(--text-xs); color: var(--text-secondary); }

  .now-playing.error {
    border-color: #ff4d4d;
    box-shadow: 0 0 20px rgba(255, 77, 77, 0.2);
  }
  .now-playing.error .np-waves span {
    background: #ff4d4d;
    animation-play-state: paused;
  }
  .badge-error {
    background: rgba(255, 77, 77, 0.15);
    color: #ff4d4d;
    border: 1px solid rgba(255, 77, 77, 0.3);
  }

  .np-stop {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--transition-fast);
  }
  .np-stop:hover { border-color: #ff4d4d; color: #ff4d4d; }

  /* Toggle France / Monde */
  .mode-toggle {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .mode-btn {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-lg);
    cursor: pointer;
    font-size: var(--text-sm);
    font-family: var(--font-base);
    transition: all var(--transition-fast);
  }
  .mode-btn:hover { border-color: #9D00FF; color: #B540FF; }
  .mode-btn.active {
    background: #9D00FF;
    border-color: #9D00FF;
    color: #fff;
    font-weight: 700;
    box-shadow: 0 0 12px rgba(157, 0, 255, 0.35);
  }

  /* Bouton curation FluxUP — accent neon distinct */
  .mode-btn--curated:hover { border-color: var(--accent-neon); color: var(--accent-neon); }
  .mode-btn--curated.active {
    background: var(--accent-neon);
    border-color: var(--accent-neon);
    box-shadow: 0 0 12px var(--accent-neon-glow);
  }

  /* Mini drapeau français CSS tricolore */
  .flag-fr {
    display: inline-block;
    width: 18px;
    height: 12px;
    border-radius: 2px;
    overflow: hidden;
    vertical-align: middle;
    position: relative;
    background: linear-gradient(to right, #002395 33.3%, #fff 33.3% 66.6%, #ed2939 66.6%);
    border: 1px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
    margin-right: 2px;
    transform: translateX(-3px);
  }

  .flag-world {
    font-size: 0.85em;
    vertical-align: middle;
  }

  /* Recherche */
  .search-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .search-input {
    flex: 1;
    max-width: 500px;
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
  .search-input:focus { border-color: var(--accent-neon); }

  .loading-dot {
    font-size: var(--text-xs);
    color: var(--text-muted);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .page-info {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  /* Grid radios */
  .radio-grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .radio-card {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .radio-card:hover { background: var(--bg-hover); }
  .radio-card.active {
    background: var(--bg-card);
    border-color: var(--accent-neon);
    box-shadow: 0 0 12px var(--accent-neon-glow);
  }

  .radio-favicon {
    width: 44px; height: 44px;
    border-radius: var(--radius-md);
    background: var(--bg-card);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    font-size: 1.2rem;
  }
  .radio-favicon img { width: 100%; height: 100%; object-fit: cover; }

  .radio-info { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
  .radio-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .radio-meta { font-size: var(--text-xs); color: var(--text-secondary); }

  .play-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    width: 34px; height: 34px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }
  .play-btn:hover {
    border-color: var(--accent-neon);
    color: var(--accent-neon);
    box-shadow: 0 0 8px var(--accent-neon-glow);
  }

  /* Pagination */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    margin-top: var(--space-2xl);
    padding-bottom: var(--space-xl);
    flex-wrap: wrap;
  }

  .page-btn {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--text-sm);
    font-family: var(--font-base);
    min-width: 40px;
    transition: all var(--transition-fast);
  }
  .page-btn:hover:not(:disabled) {
    border-color: var(--accent-neon);
    color: var(--accent-neon);
  }
  .page-btn.current {
    background: var(--accent-neon);
    border-color: var(--accent-neon);
    color: #fff;
    font-weight: 700;
  }
  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .empty-state {
    text-align: center;
    padding: var(--space-2xl) 0;
    color: var(--text-muted);
    font-size: var(--text-md);
  }
</style>
