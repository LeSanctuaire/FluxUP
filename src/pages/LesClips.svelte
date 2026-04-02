<script>
  import CardClip from '../components/CardClip.svelte';
  import { allClips } from '../services/localClips.js';

  let search = $state('');

  let filtered = $derived(
    !search
      ? allClips
      : allClips.filter(c =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.artist.toLowerCase().includes(search.toLowerCase())
        )
  );
</script>

<div class="page fade-in">
  <div class="container">
    <!-- En-tête -->
    <div class="page-header">
      <h1 class="section-title">Les <span>Clips</span></h1>
      <p class="page-sub">Classement des meilleurs clips du moment</p>
    </div>

    <!-- Barre de recherche + filtres -->
    <div class="toolbar">
      <input
        class="search-input"
        type="search"
        placeholder="Rechercher un titre, un artiste…"
        bind:value={search}
        aria-label="Rechercher un clip"
      />
    </div>

    <!-- Résultats -->
    {#if filtered.length}
      <div class="grid-clips">
        {#each filtered as clip, i}
          <div style="animation-delay: {i * 40}ms" class="fade-in">
            <CardClip {clip} />
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

  .toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .search-input {
    width: 100%;
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


  .empty-state {
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-2xl) 0;
    font-size: var(--text-md);
  }
</style>
