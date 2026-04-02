<script>
  import { debounce } from '../core/utils.js';
  import { searchRadios, getFeaturedRadios } from '../services/radioAPI.js';
  import { player } from '../core/player.svelte.js';

  // Radios en vedette — chargées au démarrage
  let featured      = $state([]);
  let searchResults = $state([]);
  let query         = $state('');
  let loading       = $state(false);

  // Station active dérivée du player global — persiste même si l'utilisateur change de page
  let activeStation = $derived(
    player.isRadio && player.currentTrack?.meta ? player.currentTrack.meta : null
  );

  // Erreur flux dérivée du player
  let streamError = $derived(player.isRadio && player.hasError);

  // Chargement initial
  $effect(() => {
    getFeaturedRadios().then(r => (featured = r));
  });

  // Recherche avec debounce
  const doSearch = debounce(async (q) => {
    if (!q.trim()) { searchResults = []; return; }
    loading = true;
    searchResults = await searchRadios(q);
    loading = false;
  }, 400);

  $effect(() => { doSearch(query); });

  /** Charge et joue une station dans le player global. */
  function playStation(station) {
    player.play({
      id:        station.stationuuid,
      title:     station.name,
      artist:    [station.country, station.tags].filter(Boolean).join(' · '),
      src:       station.url_resolved,
      thumbnail: station.favicon || null,
      isRadio:   true,
      meta:      station, // conservé pour restaurer activeStation après navigation
    });
  }

  /** Arrête la radio et libère le player. */
  function stopStation() {
    player.stop();
  }

  let displayList = $derived(query.trim() ? searchResults : featured);
</script>

<div class="page fade-in">
  <div class="container">
    <!-- En-tête -->
    <div class="page-header">
      <h1 class="section-title">Radio <span>Flux</span></h1>
      <p class="page-sub">Webradios en direct — sélectionnées et via Browser Radio API</p>
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

    <!-- Recherche -->
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
    {:else if !loading}
      <p class="empty-state">
        {query ? `Aucune radio trouvée pour « ${query} »` : 'Chargement des radios…'}
      </p>
    {/if}
  </div>
</div>

<style>
  .page-header { margin-bottom: var(--space-xl); }
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

  /* État d'erreur flux */
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

  .empty-state {
    text-align: center;
    padding: var(--space-2xl) 0;
    color: var(--text-muted);
    font-size: var(--text-md);
  }
</style>
