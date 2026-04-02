<script>
  import { player } from '../core/player.svelte.js';

  // État réactif depuis le store player
  let track       = $derived(player.currentTrack);
  let playing     = $derived(player.playing);
  let volume      = $derived(player.volume);
  let progress    = $derived(player.progress);   // 0–100
  let duration    = $derived(player.duration);
  let currentTime = $derived(player.currentTime);
  let isRadio     = $derived(player.isRadio);
  let hasError    = $derived(player.hasError);

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function handleSeek(e) {
    const pct = e.target.value / 100;
    player.seek(pct);
  }

  function handleVolume(e) {
    player.setVolume(Number(e.target.value) / 100);
  }
</script>

<div class="player" aria-label="Lecteur audio global" role="region">
  <!-- Track info -->
  <div class="player-track">
    {#if track?.thumbnail}
      <img src={track.thumbnail} alt={track.title} class="track-thumb" width="48" height="48" />
    {:else}
      <div class="track-thumb-placeholder" aria-hidden="true">{isRadio ? '📻' : '♪'}</div>
    {/if}
    <div class="track-meta">
      <span class="track-title">{track?.title ?? 'Aucune piste'}</span>
      {#if hasError}
        <span class="track-error">Flux indisponible</span>
      {:else}
        <span class="track-artist">{track?.artist ?? '—'}</span>
      {/if}
    </div>
  </div>

  <!-- Contrôles centraux -->
  <div class="player-center">
    <div class="controls">
      {#if !isRadio}
        <button class="ctrl-btn" aria-label="Précédent" onclick={() => player.prev()}>⏮</button>
      {/if}
      <button class="ctrl-btn play-btn" aria-label={playing ? 'Pause' : 'Play'}
        onclick={() => player.toggle()}>
        {playing ? '⏸' : '▶'}
      </button>
      {#if !isRadio}
        <button class="ctrl-btn" aria-label="Suivant" onclick={() => player.next()}>⏭</button>
      {/if}
    </div>

    {#if isRadio}
      <!-- Badge LIVE pour les flux radio -->
      <div class="live-badge" aria-label="Lecture en direct">
        <span class="live-dot" aria-hidden="true"></span>
        EN DIRECT
      </div>
    {:else}
      <!-- Barre de progression (clips uniquement) -->
      <div class="progress-bar">
        <span class="time">{formatTime(currentTime)}</span>
        <input
          type="range" min="0" max="100"
          value={progress}
          oninput={handleSeek}
          aria-label="Progression"
          class="slider progress-slider"
        />
        <span class="time">{formatTime(duration)}</span>
      </div>
    {/if}
  </div>

  <!-- Volume -->
  <div class="player-right">
    <button class="ctrl-btn" aria-label={volume === 0 ? 'Activer le son' : 'Couper le son'}
      onclick={() => player.setVolume(volume > 0 ? 0 : 0.7)}>
      {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
    </button>
    <input
      type="range" min="0" max="100"
      value={Math.round(volume * 100)}
      oninput={handleVolume}
      aria-label="Volume"
      class="slider volume-slider"
    />
  </div>
</div>

<style>
  .player {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: var(--player-height);
    background: rgba(16, 16, 26, 0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--border-accent);
    z-index: var(--z-player);
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: 0 var(--space-xl);
  }

  /* Track info */
  .player-track {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    min-width: 180px;
    flex: 0 0 200px;
    overflow: hidden;
  }

  .track-thumb {
    width: 44px; height: 44px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--border);
  }

  .track-thumb-placeholder {
    width: 44px; height: 44px;
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .track-meta {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .track-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-artist {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Contrôles centraux */
  .player-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .ctrl-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: var(--text-secondary);
    transition: color var(--transition-fast), transform var(--transition-fast);
    padding: 4px;
    border-radius: var(--radius-sm);
    line-height: 1;
  }
  .ctrl-btn:hover { color: var(--text-primary); transform: scale(1.15); }

  .play-btn {
    font-size: 1.4rem;
    color: var(--accent-neon);
    width: 36px; height: 36px;
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-fast), box-shadow var(--transition-fast);
  }
  .play-btn:hover {
    background: var(--accent-neon-glow);
    box-shadow: 0 0 16px var(--accent-neon-glow);
    color: var(--accent-neon);
    transform: scale(1.05);
  }

  /* Progress bar */
  .progress-bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    max-width: 500px;
  }

  .time {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
    width: 34px;
    flex-shrink: 0;
  }

  /* Sliders */
  .slider {
    -webkit-appearance: none;
    appearance: none;
    height: 3px;
    border-radius: var(--radius-full);
    outline: none;
    cursor: pointer;
    transition: height var(--transition-fast);
  }
  .slider:hover { height: 5px; }

  .progress-slider {
    flex: 1;
    background: linear-gradient(
      to right,
      var(--accent-neon) 0%,
      var(--accent-neon) calc(var(--progress, 0) * 1%),
      var(--border) calc(var(--progress, 0) * 1%),
      var(--border) 100%
    );
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--accent-neon);
    cursor: pointer;
    box-shadow: 0 0 6px var(--accent-neon-glow);
  }

  /* Volume */
  .player-right {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 0 0 140px;
    justify-content: flex-end;
  }

  .volume-slider {
    width: 80px;
    background: linear-gradient(
      to right,
      var(--accent-orange) 0%,
      var(--accent-orange) calc(var(--vol, 70) * 1%),
      var(--border) calc(var(--vol, 70) * 1%),
      var(--border) 100%
    );
  }

  /* Badge EN DIRECT */
  .live-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--accent-neon);
    padding: 2px 0;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent-neon);
    box-shadow: 0 0 6px var(--accent-neon-glow);
    animation: pulse-dot 1.4s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
  }

  /* Erreur flux */
  .track-error {
    font-size: var(--text-xs);
    color: #ff4d4d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Mobile : masquer volume et infos piste */
  @media (max-width: 600px) {
    .player-track { flex: 0 0 120px; }
    .player-right { display: none; }
    .track-artist { display: none; }
  }
</style>
