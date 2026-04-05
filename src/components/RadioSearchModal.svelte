<script>
  import { radioSearchStore } from '../core/radioSearchStore.svelte.js';
  import { searchRadios, getRadiosByTag } from '../services/radioAPI.js';
  import { player } from '../core/player.svelte.js';

  // Mots-clés suggérés
  const SUGGESTIONS = [
    'Jazz', 'Reggae', 'Techno', 'Ambient', 'Hip-Hop',
    'Classical', 'Metal', 'Lofi', 'Soul', 'Punk',
    'Electronic', 'Rock', 'Funk', 'Dub', 'Drum and Bass',
  ];

  let query      = $state('');
  let results    = $state([]);
  let loading    = $state(false);
  let noResult   = $state(false);
  let inputEl    = $state(null);
  let searchTimer = null;

  // Autofocus à l'ouverture
  $effect(() => {
    if (radioSearchStore.show) {
      query    = '';
      results  = [];
      noResult = false;
      setTimeout(() => inputEl?.focus(), 90);
    }
  });

  function close() {
    radioSearchStore.close();
    clearTimeout(searchTimer);
    query   = '';
    results = [];
    noResult = false;
  }

  function onBackdropClick(/** @type {MouseEvent} */ e) {
    if (e.target === e.currentTarget) close();
  }

  async function doSearch(q) {
    if (!q.trim()) { results = []; noResult = false; return; }
    loading  = true;
    noResult = false;
    try {
      const res = await searchRadios(q.trim(), 24);
      results  = res;
      noResult = res.length === 0;
    } catch {
      results  = [];
      noResult = true;
    } finally {
      loading = false;
    }
  }

  function onInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => doSearch(query), 400);
  }

  /** Clic sur un mot-clé suggéré */
  async function pickSuggestion(tag) {
    query    = tag;
    loading  = true;
    noResult = false;
    results  = [];
    try {
      const res = await getRadiosByTag(tag.toLowerCase(), 24);
      results  = res;
      noResult = res.length === 0;
    } catch {
      results  = [];
      noResult = true;
    } finally {
      loading = false;
    }
  }

  /** Lance la radio dans le player global et ferme la modal */
  function playStation(/** @type {object} */ station) {
    player.play({
      id:        station.stationuuid,
      title:     station.name,
      artist:    [station.country, station.tags].filter(Boolean).join(' · '),
      src:       station.url_resolved,
      thumbnail: station.favicon || null,
      isRadio:   true,
      meta:      station,
    });
    close();
  }

  function isActive(/** @type {object} */ station) {
    return player.isRadio && player.currentTrack?.id === station.stationuuid;
  }
</script>

{#if radioSearchStore.show}
  <!-- Backdrop -->
  <div
    class="rsm-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Rechercher une radio"
    tabindex="-1"
    onclick={onBackdropClick}
    onkeydown={null}
  >
    <!-- Boîte modale -->
    <div class="rsm-box">

      <!-- ── En-tête ── -->
      <div class="rsm-header">
        <div class="rsm-header-left">
          <span class="rsm-icon" aria-hidden="true">📡</span>
          <h2 class="rsm-title">Rechercher une Radio</h2>
        </div>
        <button class="rsm-close" onclick={close} aria-label="Fermer">✕</button>
      </div>

      <!-- ── Barre de recherche ── -->
      <div class="rsm-search-wrap">
        <span class="rsm-search-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <input
          bind:this={inputEl}
          bind:value={query}
          oninput={onInput}
          type="search"
          class="rsm-input"
          placeholder="Nom de la radio, pays, genre…"
          autocomplete="off"
          spellcheck="false"
          aria-label="Rechercher une radio"
        />
        {#if loading}
          <span class="rsm-spinner" aria-hidden="true"></span>
        {/if}
      </div>

      <!-- ── Suggestions de mots-clés ── -->
      {#if !query}
        <div class="rsm-suggestions">
          <p class="rsm-suggestions-label">Suggestions</p>
          <div class="rsm-chips">
            {#each SUGGESTIONS as tag}
              <button class="rsm-chip" onclick={() => pickSuggestion(tag)}>
                {tag}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- ── Résultats ── -->
      {#if results.length > 0}
        <div class="rsm-results">
          {#each results as station}
            {@const active = isActive(station)}
            <button
              class="rsm-station"
              class:rsm-station--active={active}
              onclick={() => playStation(station)}
              aria-label={active ? `${station.name} — en cours` : `Écouter ${station.name}`}
            >
              <!-- Favicon -->
              <span class="rsm-favicon-wrap">
                {#if station.favicon}
                  <img
                    src={station.favicon}
                    alt=""
                    class="rsm-favicon"
                    loading="lazy"
                    onerror={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                {:else}
                  <span class="rsm-favicon-fallback" aria-hidden="true">📻</span>
                {/if}
              </span>

              <!-- Infos -->
              <span class="rsm-station-info">
                <span class="rsm-station-name">{station.name}</span>
                <span class="rsm-station-meta">
                  {#if station.country}{station.country}{/if}
                  {#if station.country && station.tags} · {/if}
                  {#if station.tags}{station.tags.split(',').slice(0, 3).join(', ')}{/if}
                </span>
              </span>

              <!-- Badges -->
              <span class="rsm-station-right">
                {#if station.bitrate > 0}
                  <span class="rsm-badge">{station.bitrate}k</span>
                {/if}
                {#if active}
                  <span class="rsm-waves" aria-hidden="true">
                    <span></span><span></span><span></span>
                  </span>
                {:else}
                  <span class="rsm-play-icon" aria-hidden="true">▶</span>
                {/if}
              </span>
            </button>
          {/each}
        </div>
      {:else if noResult && !loading}
        <p class="rsm-empty">Aucune radio trouvée pour « {query} »</p>
      {:else if !query && !loading}
        <p class="rsm-hint">Tape un nom ou sélectionne un genre ci-dessus.</p>
      {/if}

    </div>
  </div>
{/if}

<style>
  /* ── Thème violet — surcharge locale des variables neon pour la modal radio ── */
  .rsm-backdrop {
    --accent-neon:       #9D00FF;
    --accent-neon-glow:  rgba(157, 0, 255, 0.25);
    --border-accent:     rgba(157, 0, 255, 0.35);
  }

  /* ── Backdrop ──────────────────────────────────────────────────────────────*/
  .rsm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2100;
    background: rgba(0, 0, 0, 0.80);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 80px var(--space-lg) var(--space-lg);
    animation: rsm-fade 0.18s ease both;
  }
  @keyframes rsm-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Boîte ─────────────────────────────────────────────────────────────────*/
  .rsm-box {
    width: 100%;
    max-width: 640px;
    max-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    background: var(--bg-card, #0e0e16);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-xl);
    box-shadow:
      0 0 0 1px rgba(157, 0, 255, 0.10),
      0 32px 80px rgba(0, 0, 0, 0.7),
      0 0 60px var(--accent-neon-glow);
    overflow: hidden;
    animation: rsm-slide 0.22s ease both;
  }
  @keyframes rsm-slide {
    from { transform: translateY(-20px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }

  /* ── En-tête ───────────────────────────────────────────────────────────────*/
  .rsm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-xl);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .rsm-header-left {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .rsm-icon { font-size: 1.2rem; }

  .rsm-title {
    font-size: var(--text-lg);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.04em;
  }

  .rsm-close {
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
  .rsm-close:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.08);
  }

  /* ── Barre de recherche ────────────────────────────────────────────────────*/
  .rsm-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    padding: var(--space-md) var(--space-xl);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .rsm-search-icon {
    position: absolute;
    left: calc(var(--space-xl) + 12px);
    color: var(--text-muted);
    pointer-events: none;
    display: flex;
  }

  .rsm-input {
    width: 100%;
    padding: 10px 40px 10px 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-base);
    font-size: var(--text-base);
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    -webkit-appearance: none;
  }
  .rsm-input::placeholder { color: var(--text-muted); }
  .rsm-input:focus {
    border-color: var(--border-accent);
    box-shadow: 0 0 0 2px rgba(157, 0, 255, 0.15);
  }
  /* Masquer le X natif de <input type="search"> */
  .rsm-input::-webkit-search-cancel-button { display: none; }

  .rsm-spinner {
    position: absolute;
    right: calc(var(--space-xl) + 12px);
    width: 16px;
    height: 16px;
    border: 2px solid var(--border);
    border-top-color: var(--accent-neon);
    border-radius: 50%;
    animation: rsm-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes rsm-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Suggestions ───────────────────────────────────────────────────────────*/
  .rsm-suggestions {
    padding: var(--space-md) var(--space-xl);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .rsm-suggestions-label {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--accent-neon);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 var(--space-sm);
  }

  .rsm-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .rsm-chip {
    padding: 4px 12px;
    background: rgba(157, 0, 255, 0.07);
    border: 1px solid rgba(157, 0, 255, 0.22);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast);
  }
  .rsm-chip:hover {
    background: rgba(157, 0, 255, 0.16);
    border-color: var(--accent-neon);
    color: var(--accent-neon);
  }

  /* ── Résultats ─────────────────────────────────────────────────────────────*/
  .rsm-results {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-sm) 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .rsm-station {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
    padding: 10px var(--space-xl);
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
  }
  .rsm-station:last-child { border-bottom: none; }
  .rsm-station:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  .rsm-station--active {
    background: rgba(157, 0, 255, 0.08);
  }
  .rsm-station--active:hover {
    background: rgba(157, 0, 255, 0.14);
  }

  /* Favicon */
  .rsm-favicon-wrap {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .rsm-favicon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .rsm-favicon-fallback { font-size: 1.1rem; }

  /* Infos station */
  .rsm-station-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .rsm-station-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rsm-station-meta {
    font-size: var(--text-xs);
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }

  /* Droite : badge + icône */
  .rsm-station-right {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
  }

  .rsm-badge {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 1px 5px;
    letter-spacing: 0.04em;
  }

  .rsm-play-icon {
    font-size: 0.75rem;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }
  .rsm-station:hover .rsm-play-icon {
    color: var(--accent-neon);
  }

  /* Ondes animées pour la station active */
  .rsm-waves {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
  }
  .rsm-waves span {
    display: block;
    width: 3px;
    background: var(--accent-neon);
    border-radius: 2px;
    animation: rsm-wave 0.9s ease-in-out infinite;
  }
  .rsm-waves span:nth-child(1) { animation-delay: 0s;    height: 6px; }
  .rsm-waves span:nth-child(2) { animation-delay: 0.15s; height: 12px; }
  .rsm-waves span:nth-child(3) { animation-delay: 0.3s;  height: 8px; }
  @keyframes rsm-wave {
    0%, 100% { transform: scaleY(0.4); }
    50%       { transform: scaleY(1);   }
  }

  /* ── États vides ───────────────────────────────────────────────────────────*/
  .rsm-empty,
  .rsm-hint {
    padding: var(--space-xl);
    text-align: center;
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  /* ── Mobile ────────────────────────────────────────────────────────────────*/
  @media (max-width: 600px) {
    .rsm-backdrop {
      padding: 62px var(--space-sm) var(--space-sm);
    }
    .rsm-box {
      max-height: calc(100vh - 80px);
    }
    .rsm-header,
    .rsm-search-wrap,
    .rsm-suggestions {
      padding-left: var(--space-md);
      padding-right: var(--space-md);
    }
    .rsm-station {
      padding-left: var(--space-md);
      padding-right: var(--space-md);
    }
    .rsm-search-icon {
      left: calc(var(--space-md) + 12px);
    }
    .rsm-spinner {
      right: calc(var(--space-md) + 12px);
    }
  }
</style>
