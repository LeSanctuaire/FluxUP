<script>
  import CardClip from '../components/CardClip.svelte';
  import { allClips } from '../services/localClips.js';
  import { getTop } from '../services/votesAPI.js';
  import { getVideosStats } from '../services/clipsAPI.js';
  import { playlistStore } from '../core/playlistStore.svelte.js';

  // ── État ─────────────────────────────────────────────────────────────────────
  let search   = $state('');
  /** @type {'date' | 'votes' | 'views'} */
  let sortBy   = $state('date');
  let loading  = $state(false);

  // Pré-active le tri si l'URL contient ?sort=votes (ex: depuis "En Vedette")
  $effect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    const sort = params.get('sort');
    if (sort === 'votes' || sort === 'views') setSort(/** @type {'votes'|'views'} */ (sort));
  });

  // La pill "Vues" nécessite VITE_YOUTUBE_API_KEY
  const hasYoutubeKey = !!(import.meta.env?.VITE_YOUTUBE_API_KEY);

  // Maps chargées à la demande (cache en mémoire)
  /** @type {Map<string, number>} */
  let votesMap      = $state(new Map());
  /** @type {Map<string, number>} */
  let viewsMap      = $state(new Map());
  let viewsLoaded   = $state(false); // évite de boucler si le Map reste vide

  // ── Chargement des données de tri ─────────────────────────────────────────
  async function loadVotes() {
    if (votesMap.size > 0) return;
    loading = true;
    try {
      const top = await getTop(500);
      const m = new Map();
      for (const entry of top) m.set(entry.youtube_id, entry.vote_count);
      votesMap = m;
    } finally {
      loading = false;
    }
  }

  async function loadViews() {
    if (viewsLoaded) return;
    loading = true;
    try {
      const ids = allClips.map(c => c.youtubeId);
      viewsMap   = await getVideosStats(ids);
      viewsLoaded = true;
    } finally {
      loading = false;
    }
  }

  /** Change le critère de tri et charge les données nécessaires.
   * @param {'date' | 'votes' | 'views'} val */
  async function setSort(val) {
    if (val === 'views' && !hasYoutubeKey) return; // désactivé sans clé
    sortBy = val;
    if (val === 'votes') await loadVotes();
    if (val === 'views') await loadViews();
  }

  // ── Filtrage + tri dérivé ─────────────────────────────────────────────────
  let filtered = $derived(
    !search
      ? allClips
      : allClips.filter(c =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.artist.toLowerCase().includes(search.toLowerCase())
        )
  );

  let sorted = $derived.by(() => {
    const list = [...filtered];
    if (sortBy === 'votes') {
      list.sort((a, b) => (votesMap.get(b.youtubeId) ?? 0) - (votesMap.get(a.youtubeId) ?? 0));
    } else if (sortBy === 'views') {
      list.sort((a, b) => (viewsMap.get(b.youtubeId) ?? 0) - (viewsMap.get(a.youtubeId) ?? 0));
    } else {
      // 'date' → ordre inverse d'insertion (plus récents en tête)
      list.reverse();
    }
    return list;
  });

  // ── Labels des pills ──────────────────────────────────────────────────────
  /** @type {Array<{ id: 'date' | 'votes' | 'views', label: string, icon: string }>} */
  const SORT_OPTIONS = [
    { id: 'date',  label: 'Récents',  icon: '🕐' },
    { id: 'votes', label: 'Votes',    icon: '🔥' },
    { id: 'views', label: 'Vues',     icon: '👁' },
  ];

  /** Emoji du bouton selon le filtre actif */
  let launchIcon = $derived(SORT_OPTIONS.find(o => o.id === sortBy)?.icon ?? '▶');

  /** Lance la sélection triée : stocke la playlist et navigue vers le 1er clip */
  function launchSelection() {
    if (!sorted.length) return;
    playlistStore.launch(
      sorted.map(c => ({ youtubeId: c.youtubeId, title: c.title, artist: c.artist }))
    );
    window.location.hash = `#/clip/${sorted[0].youtubeId}`;
  }
</script>

<div class="page fade-in">
  <div class="container">
    <!-- En-tête -->
    <div class="page-header">
      <h1 class="section-title">Les <span>Clips</span></h1>
      <p class="page-sub">Classement des meilleurs clips du moment</p>
    </div>

    <!-- Barre de recherche + tri -->
    <div class="toolbar">
      <input
        class="search-input"
        type="search"
        placeholder="Rechercher un titre, un artiste…"
        bind:value={search}
        aria-label="Rechercher un clip"
      />

      <div class="sort-pills" role="group" aria-label="Trier les clips">
        {#each SORT_OPTIONS as opt}
          {@const isViewsLocked = opt.id === 'views' && !hasYoutubeKey}
          <button
            class="pill"
            class:active={sortBy === opt.id}
            class:loading={loading && sortBy === opt.id}
            class:locked={isViewsLocked}
            onclick={() => setSort(opt.id)}
            aria-pressed={sortBy === opt.id}
            disabled={isViewsLocked}
            title={isViewsLocked ? 'Nécessite VITE_YOUTUBE_API_KEY dans .env' : undefined}
          >
            {#if loading && sortBy === opt.id}
              <span class="spinner" aria-hidden="true"></span>
            {:else}
              <span class="pill-icon" aria-hidden="true">{opt.icon}</span>
            {/if}
            {opt.label}
            {#if isViewsLocked}<span class="lock-icon" aria-hidden="true">🔑</span>{/if}
          </button>
        {/each}
      </div>

      <button
        class="btn-launch"
        onclick={launchSelection}
        disabled={sorted.length === 0}
        aria-label="Lancer la sélection en lecture"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 2l9 5-9 5z" fill="currentColor"/>
        </svg>
        Lancer la sélection
        <span aria-hidden="true">{launchIcon}</span>
      </button>
    </div>

    <!-- Résultats -->
    {#if sorted.length}
      <div class="grid-clips">
        {#each sorted as clip, i}
          <div style="animation-delay: {i * 30}ms" class="fade-in">
            <CardClip {clip} eager={i === 0} />
          </div>
        {/each}
      </div>
    {:else}
      <p class="empty-state">Aucun clip trouvé pour « {search} »</p>
    {/if}
  </div>
</div>

<style>
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
  .search-input:focus { border-color: var(--accent-neon); }

  /* ── Sort pills ──────────────────────────────────────────────────────────── */
  .sort-pills {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 4px;
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: calc(var(--radius-lg) - 2px);
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-family: var(--font-base);
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  .pill:hover {
    background: rgba(255,255,255,0.06);
    color: var(--text-primary);
  }

  .pill.active {
    background: rgba(var(--accent-neon-rgb, 0, 255, 180), 0.12);
    border-color: var(--accent-neon);
    color: var(--accent-neon);
    box-shadow: 0 0 10px rgba(var(--accent-neon-rgb, 0, 255, 180), 0.18);
  }

  .pill-icon {
    font-size: 11px;
    line-height: 1;
  }

  .pill.locked {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .lock-icon {
    font-size: 10px;
    margin-left: 2px;
    opacity: 0.7;
  }

  /* ── Spinner ─────────────────────────────────────────────────────────────── */
  .spinner {
    display: inline-block;
    width: 11px;
    height: 11px;
    border: 1.5px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Bouton Lancer la sélection ─────────────────────────────────────────── */
  .btn-launch {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px var(--space-xl);
    background: transparent;
    color: var(--accent-orange);
    border: 1px solid var(--accent-orange);
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 0 10px var(--accent-orange-glow), inset 0 0 8px rgba(255,107,43,0.04);
    transition:
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }
  .btn-launch:hover {
    color: #fff;
    box-shadow: 0 0 22px var(--accent-orange-glow), inset 0 0 14px rgba(255,107,43,0.1);
  }
  .btn-launch:active { transform: scale(0.97); }
  .btn-launch:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

  /* ── Empty state ─────────────────────────────────────────────────────────── */
  .empty-state {
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-2xl) 0;
    font-size: var(--text-md);
  }
</style>
