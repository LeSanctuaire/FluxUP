<script>
  import { getArtistList } from '../services/localClips.js';

  const categories = [
    { label: 'Hip-Hop / Rap',   icon: '🎤', color: 'var(--accent-orange)' },
    { label: 'Électronique',    icon: '🎛',  color: 'var(--accent-neon)'   },
    { label: 'Pop',             icon: '🎵',  color: '#a855f7'              },
    { label: 'Rock',            icon: '🎸',  color: '#ef4444'              },
    { label: 'Afrobeats',       icon: '🥁',  color: '#f59e0b'              },
    { label: 'R&B / Soul',      icon: '🎙',  color: '#ec4899'              },
    { label: 'Classique',       icon: '🎻',  color: '#64748b'              },
    { label: 'Jazz',            icon: '🎺',  color: '#0ea5e9'              },
  ];

  // Artistes réels extraits des clips, triés par nombre de clips
  const artists = getArtistList();
</script>

<div class="page fade-in">
  <div class="container">
    <div class="page-header">
      <h1 class="section-title">Ex<span>plorer</span></h1>
      <p class="page-sub">Parcourez par genre, artiste ou playlist</p>
    </div>

    <!-- Genres -->
    <section class="section-block">
      <h2 class="block-title">Par genre</h2>
      <div class="genre-grid">
        {#each categories as cat}
          <button
            class="genre-card"
            style="--card-color: {cat.color}"
            aria-label={cat.label}
          >
            <span class="genre-icon">{cat.icon}</span>
            <span class="genre-label">{cat.label}</span>
          </button>
        {/each}
      </div>
    </section>

    <!-- Artistes -->
    <section class="section-block">
      <h2 class="block-title">Artistes populaires</h2>
      <div class="artist-list">
        {#each artists as artist, i}
          <div class="artist-row">
            <span class="artist-rank">#{i + 1}</span>
            <div class="artist-avatar" aria-hidden="true">
              {artist.name.charAt(0)}
            </div>
            <div class="artist-info">
              <span class="artist-name">{artist.name}</span>
            </div>
            <span class="artist-clips">{artist.clips} clips</span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .page-header { margin-bottom: var(--space-xl); }
  .page-sub { color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-xs); }

  .section-block { margin-bottom: var(--space-2xl); }

  .block-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--border);
  }

  /* Genre grid */
  .genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-md);
  }

  .genre-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-xl) var(--space-md);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-base);
    color: var(--text-secondary);
    font-family: var(--font-base);
  }

  .genre-card:hover {
    border-color: var(--card-color);
    box-shadow: 0 0 20px color-mix(in srgb, var(--card-color) 25%, transparent);
    transform: translateY(-3px);
    color: var(--text-primary);
  }

  .genre-icon { font-size: 2rem; }
  .genre-label { font-size: var(--text-sm); font-weight: 600; text-align: center; }

  /* Artist list */
  .artist-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .artist-row {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
    cursor: pointer;
  }
  .artist-row:hover { background: var(--bg-hover); }

  .artist-rank {
    width: 28px;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-muted);
    font-family: var(--font-mono);
    text-align: center;
  }

  .artist-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-neon), var(--accent-orange));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--text-md);
    color: var(--bg-primary);
    flex-shrink: 0;
  }

  .artist-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .artist-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }

  .artist-clips {
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-family: var(--font-mono);
  }
</style>
