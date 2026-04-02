<script>
  import { findClip } from '../services/localClips.js';

  /** @type {{ id: string | null }} */
  let { id } = $props();

  let meta = $derived(id ? (findClip(id) ?? null) : null);
  let embedUrl = $derived(id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null);
</script>

<div class="page fade-in">
  <div class="container">
    <!-- Retour -->
    <a href="#/clips" class="back-link">← Retour aux clips</a>

    {#if id && embedUrl}
      <div class="clip-layout">
        <!-- Lecteur YouTube -->
        <div class="video-wrap">
          <iframe
            src={embedUrl}
            title={meta?.title ?? 'Clip vidéo'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
            frameborder="0"
          ></iframe>
        </div>

        <!-- Infos -->
        <div class="clip-info">
          {#if meta}
            <h1 class="clip-title">{meta.title}</h1>
            <div class="clip-artists">
              {#each meta.artists as name}
                <span class="tag">{name}</span>
              {/each}
            </div>
          {:else}
            <p class="clip-title">Clip YouTube</p>
            <p class="clip-artist">ID : {id}</p>
          {/if}
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <p>Aucun clip sélectionné.</p>
        <a href="#/clips" class="badge" style="margin-top:1rem; display:inline-block;">Voir les clips</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--space-xl);
    transition: color var(--transition-fast);
    text-decoration: none;
  }
  .back-link:hover { color: var(--accent-neon); }

  .clip-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: var(--space-2xl);
    align-items: start;
  }

  /* Embed YouTube */
  .video-wrap {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .video-wrap iframe {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    border: none;
  }

  /* Info panel */
  .clip-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  .clip-title {
    font-size: var(--text-xl);
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .clip-artist {
    font-size: var(--text-md);
    color: var(--accent-neon);
    font-weight: 600;
  }

  .clip-artists {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    padding-top: var(--space-sm);
  }

  .tag {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    background: var(--bg-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 2px var(--space-sm);
    transition: color var(--transition-fast), border-color var(--transition-fast);
    cursor: pointer;
  }
  .tag:hover { color: var(--accent-neon); border-color: var(--border-accent); }

  .empty-state {
    text-align: center;
    padding: var(--space-2xl) 0;
    color: var(--text-muted);
  }

  @media (max-width: 900px) {
    .clip-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
