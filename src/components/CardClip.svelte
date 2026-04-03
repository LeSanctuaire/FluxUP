<script>
  /**
   * @typedef {{ id: string, title: string, artist: string, thumbnail: string, duration?: string, genre?: string, views?: string }} Clip
   */

  /** @type {{ clip: Clip, onclick?: (clip: Clip) => void, eager?: boolean }} */
  let { clip, onclick = null, eager = false } = $props();

  function handleClick() {
    if (onclick) onclick(clip);
    else window.location.hash = `#/clip/${clip.id}`;
  }
</script>

<div class="card-clip" role="button" tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
  aria-label={`Lire ${clip.title} de ${clip.artist}`}
>
  <!-- Thumbnail -->
  <div class="card-thumb">
    <img
      src={clip.thumbnail}
      alt={clip.title}
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : 'auto'}
      width="320" height="180"
    />
    {#if clip.duration}
      <span class="duration">{clip.duration}</span>
    {/if}
    <div class="play-overlay" aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="var(--accent-neon)" stroke-width="1.5" fill="rgba(0,0,0,0.6)"/>
        <path d="M13 10.5l10 5.5-10 5.5z" fill="var(--accent-neon)"/>
      </svg>
    </div>
  </div>

  <!-- Info -->
  <div class="card-info">
    <p class="card-title" title={clip.title}>{clip.title}</p>
    <p class="card-artist">{clip.artist}</p>
    <div class="card-meta">
      {#if clip.genre}
        <span class="badge">{clip.genre}</span>
      {/if}
      {#if clip.views}
        <span class="views">👁 {clip.views}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .card-clip {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition:
      transform var(--transition-base),
      border-color var(--transition-base),
      box-shadow var(--transition-base);
    outline: none;
    width: 100%; /* force la card à rester dans les 200px du slider-item */
  }

  .card-clip:hover,
  .card-clip:focus-visible {
    transform: translateY(-4px);
    border-color: var(--border-accent);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 12px var(--accent-neon-glow);
  }

  /* Thumbnail — hauteur fixe pour garantir l'uniformité quelle que soit la source */
  .card-thumb {
    position: relative;
    width: 100%;
    height: 112px; /* 200px card × 9/16 ≈ 112px — même hauteur pour toutes les vignettes */
    flex-shrink: 0;
    overflow: hidden;
    background: var(--bg-secondary);
  }

  .card-thumb img {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }

  .card-clip:hover .card-thumb img {
    transform: scale(1.05);
  }

  .duration {
    position: absolute;
    bottom: var(--space-sm);
    right: var(--space-sm);
    background: rgba(0,0,0,0.75);
    color: var(--text-primary);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    backdrop-filter: blur(4px);
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  .card-clip:hover .play-overlay { opacity: 1; }

  /* Info — hauteur min fixe pour que toutes les cards aient la même taille totale */
  .card-info {
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 82px;
    min-width: 0;    /* propagate la contrainte de largeur vers les enfants */
    overflow: hidden;
  }

  .card-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0; /* flex child : empêche le texte long d'élargir la card */
  }

  .card-artist {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
    flex-wrap: wrap;
  }

  .views {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
</style>
