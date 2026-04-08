<script>
  import { player } from '../core/player.svelte.js';
  import { ytLiveStore } from '../core/ytLiveStore.svelte.js';
  import { getRandomStation } from '../services/radioAPI.js';

  let track       = $derived(player.currentTrack);
  let playing     = $derived(player.playing);
  let volume      = $derived(player.volume);
  let progress    = $derived(player.progress);
  let duration    = $derived(player.duration);
  let currentTime = $derived(player.currentTime);
  let isRadio     = $derived(player.isRadio);
  let hasError    = $derived(player.hasError);

  // ── Mode YouTube Live ────────────────────────────────────────────────────
  let ytMode      = $derived(!!ytLiveStore.currentStream);
  let ytStream    = $derived(ytLiveStore.currentStream);
  let ytPlaying   = $derived(ytLiveStore.isPlaying);
  let ytLoading   = $derived(ytLiveStore.isLoading);
  let ytError     = $derived(ytLiveStore.hasError);
  let ytVideoData = $derived(ytLiveStore.videoData);

  // Quand le player audio reprend une piste, on coupe le YT live
  $effect(() => {
    if (player.currentTrack && ytLiveStore.currentStream) {
      ytLiveStore.stop();
    }
  });

  /** En cours de chargement d'une station aléatoire */
  let radioShuffle = $state(false);

  function formatTime(/** @type {number} */ sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function handleSeek(/** @type {Event} */ e) {
    const pct = Number(/** @type {HTMLInputElement} */ (e.target).value) / 100;
    player.seek(pct);
  }

  function handleVolume(/** @type {Event} */ e) {
    const val = Number(/** @type {HTMLInputElement} */ (e.target).value) / 100;
    player.setVolume(val);
    if (ytMode) ytLiveStore.setVolume(val);
  }

  /** Change pour une autre station radio aléatoire (exclut la station en cours) */
  async function shuffleRadio() {
    if (radioShuffle) return;
    radioShuffle = true;
    try {
      const currentId = track?.id ?? null;
      const station = await getRandomStation(currentId);
      if (!station) return;
      player.play({
        id:        station.stationuuid,
        title:     station.name,
        artist:    [station.country, station.tags].filter(Boolean).join(' · '),
        src:       station.url_resolved,
        thumbnail: station.favicon || null,
        isRadio:   true,
        meta:      station,
      });
    } finally {
      radioShuffle = false;
    }
  }
</script>

<div class="player" class:player--idle={!track && !ytMode} aria-label="Lecteur audio global" role="region">
  <!-- Track info -->
  <div class="player-track">
    {#if ytMode}
      <!-- Mode YouTube Live -->
      <div class="track-thumb-placeholder" aria-hidden="true">{ytStream?.emoji ?? '📡'}</div>
      <div class="track-meta">
        <span class="track-title">
          {ytVideoData?.title || ytStream?.label || 'Stream 24/7'}
        </span>
        {#if ytError}
          <span class="track-error">Stream instable</span>
        {:else}
          <span class="track-artist" style="color:var(--accent-teal)">
            {ytVideoData?.author || ytStream?.genre || ''}
          </span>
        {/if}
      </div>
    {:else if track?.thumbnail}
      <img src={track.thumbnail} alt={track.title} class="track-thumb" width="48" height="48"
        onerror={(e) => { /** @type {HTMLImageElement} */ (e.target).style.display='none'; }} />
      <div class="track-meta">
        <span class="track-title">{track.title}</span>
        {#if hasError}
          <span class="track-error">Flux indisponible</span>
        {:else}
          <span class="track-artist">{track.artist ?? '—'}</span>
        {/if}
      </div>
    {:else if track}
      <div class="track-thumb-placeholder" aria-hidden="true">{isRadio ? '📻' : '♪'}</div>
      <div class="track-meta">
        <span class="track-title">{track.title}</span>
        {#if hasError}
          <span class="track-error">Flux indisponible</span>
        {:else}
          <span class="track-artist">{track.artist ?? '—'}</span>
        {/if}
      </div>
    {:else}
      <div class="track-thumb-placeholder" aria-hidden="true">♪</div>
      <div class="track-meta">
        <span class="track-title">Aucune piste</span>
        <span class="track-artist">—</span>
      </div>
    {/if}
  </div>

  <!-- Contrôles centraux -->
  <div class="player-center">
    {#if ytMode}
      <!-- ── Mode YouTube Live ────────────────────────────────────────── -->
      <div class="controls">
        <button
          class="ctrl-btn play-btn"
          aria-label={ytPlaying ? 'Pause' : 'Reprendre'}
          onclick={() => ytLiveStore.toggle()}
        >
          {#if ytLoading}
            <span class="yt-spinner" aria-hidden="true"></span>
          {:else if ytPlaying}
            ⏸
          {:else}
            ▶
          {/if}
        </button>

        {#if ytError}
          <button
            class="ctrl-btn"
            aria-label="Reconnecter le stream"
            title="Reconnecter"
            onclick={() => ytLiveStore.reconnect()}
            style="font-size:0.75rem; color:#ff6b6b; border:1px solid rgba(255,107,107,0.35); border-radius:var(--radius-sm); padding:2px 8px;"
          >
            ↺ Reconnecter
          </button>
        {/if}

        <button
          class="ctrl-btn stop-btn"
          aria-label="Arrêter le stream"
          title="Stop"
          onclick={() => ytLiveStore.stop()}
        >
          ⏹
        </button>
      </div>

      <div class="live-badge" aria-label="Stream en direct">
        <span class="live-dot" aria-hidden="true"></span>
        STREAM 24/7
      </div>

    {:else if track}
      <!-- ── Mode audio classique ─────────────────────────────────────── -->
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

        {#if isRadio}
          <button
            class="ctrl-btn shuffle-btn"
            class:spinning={radioShuffle}
            aria-label="Station aléatoire"
            title="Station aléatoire"
            disabled={radioShuffle}
            onclick={shuffleRadio}
          >
            {radioShuffle ? '…' : '⇄'}
          </button>
        {/if}

        <button
          class="ctrl-btn stop-btn"
          aria-label="Arrêter la lecture"
          title="Stop"
          onclick={() => player.stop()}
        >
          ⏹
        </button>
      </div>

      {#if isRadio}
        <div class="live-badge" aria-label="Lecture en direct">
          <span class="live-dot" aria-hidden="true"></span>
          EN DIRECT
        </div>
      {:else}
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

    {:else}
      <!-- Aucun flux — bouton de lancement -->
      <button
        class="launch-btn"
        class:loading={radioShuffle}
        disabled={radioShuffle}
        onclick={shuffleRadio}
        aria-label="Lancer un flux radio aléatoire"
      >
        <span>{radioShuffle ? '…' : '▶'}</span>
        {radioShuffle ? 'Chargement…' : 'Lancer un flux radio'}
      </button>
    {/if}
  </div>

  <!-- Volume -->
  <div class="player-right">
    <button class="ctrl-btn" aria-label={volume === 0 ? 'Activer le son' : 'Couper le son'}
      onclick={() => { const val = volume > 0 ? 0 : 0.7; player.setVolume(val); if (ytMode) ytLiveStore.setVolume(val); }}>
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
    transition: height 0.3s ease, opacity 0.3s ease, border-color 0.3s ease;
  }

  /* État idle : aucun flux en lecture */
  .player--idle {
    height: 40px;
    opacity: 0.55;
    border-top-color: var(--border);
  }
  .player--idle:hover {
    opacity: 1;
    height: var(--player-height);
  }
  .player--idle .player-track,
  .player--idle .player-right {
    display: none;
  }

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
  .ctrl-btn:hover:not(:disabled) { color: var(--text-primary); transform: scale(1.15); }
  .ctrl-btn:disabled { opacity: 0.4; cursor: wait; }

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
  .play-btn:hover:not(:disabled) {
    background: var(--accent-neon-glow);
    box-shadow: 0 0 16px var(--accent-neon-glow);
    color: var(--accent-neon);
    transform: scale(1.05);
  }

  /* ── Bouton station aléatoire ────────────────────────────────────────── */
  .shuffle-btn {
    font-size: 1.2rem;
    color: var(--accent-orange);
    width: 30px; height: 30px;
    border: 1px solid rgba(255,107,43,0.35) !important;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-fast), box-shadow var(--transition-fast), color var(--transition-fast);
  }
  .shuffle-btn:hover:not(:disabled) {
    background: rgba(255,107,43,0.12);
    box-shadow: 0 0 12px var(--accent-orange-glow);
    color: #ff8c45;
    transform: scale(1.12);
  }
  .shuffle-btn.spinning {
    animation: spin 0.7s linear infinite;
    color: var(--accent-orange);
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── Bouton "Lancer un flux radio" (état idle) ───────────────────────── */
  .launch-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 8px var(--space-xl);
    background: transparent;
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-full);
    color: var(--accent-neon);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      color var(--transition-fast);
  }
  .launch-btn:hover:not(:disabled) {
    background: var(--accent-neon-glow);
    box-shadow: 0 0 18px var(--accent-neon-glow);
  }
  .launch-btn:disabled { opacity: 0.5; cursor: wait; }

  /* ── Bouton Stop ─────────────────────────────────────────────────────── */
  .stop-btn {
    font-size: 1rem;
    color: var(--text-muted);
    width: 28px; height: 28px;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .stop-btn:hover {
    color: #ff4d4d;
    border-color: rgba(255, 77, 77, 0.5) !important;
    box-shadow: 0 0 8px rgba(255, 77, 77, 0.3);
    transform: scale(1.1);
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

  .live-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.6rem;
    font-weight: 400;
    letter-spacing: 0.06em;
    color: #ff3333;
    padding: 2px 0;
    white-space: nowrap;
  }

  .live-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #ff3333;
    box-shadow: 0 0 6px rgba(255,51,51,0.7);
    animation: pulse-dot 1.4s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
  }

  .track-error {
    font-size: var(--text-xs);
    color: #ff4d4d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Spinner YouTube Live ─────────────────────────────────────────────── */
  .yt-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--accent-neon);
    border-top-color: transparent;
    border-radius: 50%;
    animation: ytSpin 0.65s linear infinite;
  }
  @keyframes ytSpin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .player-track { flex: 0 0 120px; }
    .player-right { display: none; }
    .track-artist { display: none; }
  }
</style>
