<script>
  import { onMount } from 'svelte';
  import SharePanel from '../components/SharePanel.svelte';
  import { findClip } from '../services/localClips.js';
  import { postVote, getVotes, hasVotedLocally } from '../services/votesAPI.js';
  import { playlistStore } from '../core/playlistStore.svelte.js';

  /** @type {{ id: string | null }} */
  let { id } = $props();

  let meta     = $derived(id ? (findClip(id) ?? null) : null);
  let embedUrl = $derived(id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null);

  // ── État du vote ────────────────────────────────────────────────────────────
  let votes       = $state(0);
  let hasVoted    = $state(false);
  let voting      = $state(false);
  let showPlusOne = $state(false);

  // ── Player YT (mode playlist) ─────────────────────────────────────────────
  /** @type {any} */
  let ytPlayer = null;

  onMount(() => {
    // Charge le SDK YouTube une seule fois
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id  = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    // Lance le player si on arrive directement en mode playlist
    if (id && playlistStore.isActive) {
      setTimeout(() => initPlayer(id), 60);
    }
    return () => {
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
    };
  });

  /** @param {string} videoId */
  function initPlayer(videoId) {
    /** @type {any} */
    const w = window;
    const create = () => {
      if (ytPlayer) { try { ytPlayer.destroy(); } catch(_) {} ytPlayer = null; }
      ytPlayer = new w.YT.Player('clip-yt-player', {
        width: '100%', height: '100%',
        videoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange(/** @type {any} */ e) {
            // Fin de vidéo → clip suivant automatiquement
            if (e.data === 0) goToNext();
          },
        },
      });
    };
    if (w.YT?.Player) {
      create();
    } else {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { if (prev) prev(); create(); };
    }
  }

  // Charge le score/vote et gère le player quand l'id change
  $effect(() => {
    if (!id) return;
    hasVoted = hasVotedLocally(id);
    getVotes(id).then(n => { votes = n; });

    if (playlistStore.isActive) {
      playlistStore.syncId(id);
      // Si le player existe déjà, change juste la vidéo ; sinon l'initialise
      if (ytPlayer) {
        ytPlayer.loadVideoById(id);
      }
    }
  });

  function goToNext() {
    const next = playlistStore.advance();
    if (next) window.location.hash = `#/clip/${next.youtubeId}`;
  }

  async function handleVote() {
    if (!id || hasVoted || voting) return;
    voting = true;

    const result = await postVote(id);

    if (result.success) {
      votes    = result.votes;
      hasVoted = true;
      // Déclenche l'animation +1
      showPlusOne = true;
      setTimeout(() => { showPlusOne = false; }, 900);
    } else if (result.error === 'already_voted') {
      // Le serveur confirme : déjà voté (ex: autre appareil même IP)
      hasVoted = true;
      if (result.votes) votes = result.votes;
    }
    // error 'no_api' ou 'network' : feedback silencieux (pas de console.error)

    voting = false;
  }
</script>

<div class="page fade-in">
  <div class="container">
    <!-- Retour -->
    <a href="#/clips" class="back-link">← Retour aux clips</a>

    {#if id && embedUrl}
      <div class="clip-layout">
        <!-- Lecteur YouTube -->
        <div class="video-wrap">
          {#if playlistStore.isActive}
            <!-- Mode playlist : YT IFrame API pour détecter la fin et enchaîner -->
            <div id="clip-yt-player"></div>
          {:else}
            <iframe
              src={embedUrl}
              title={meta?.title ?? 'Clip vidéo'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
              frameborder="0"
            ></iframe>
          {/if}
        </div>

        <!-- Infos + vote -->
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

          <!-- ── Bouton S'abonner ──────────────────────────────────────────── -->
          {#if meta?.channelId}
            <a
              class="btn-subscribe"
              href="https://www.youtube.com/channel/{meta.channelId}?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="S'abonner à la chaîne YouTube"
            >
              <svg class="yt-logo" viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              S'abonner
            </a>
          {/if}

          <!-- ── Bloc vote ──────────────────────────────────────────────────── -->
          <div class="vote-block">
            <!-- Voter + Classement toujours côte à côte -->
            <div class="vote-actions">
              <div class="vote-btn-wrap">
                <button
                  class="vote-btn"
                  class:voted={hasVoted}
                  class:loading={voting}
                  onclick={handleVote}
                  disabled={hasVoted || voting}
                  aria-label={hasVoted ? 'Vous avez déjà voté' : 'Voter pour ce clip'}
                >
                  {#if voting}
                    <span class="vote-spinner" aria-hidden="true"></span>
                    Envoi…
                  {:else if hasVoted}
                    <span class="vote-icon" aria-hidden="true">✓</span>
                    Voté
                  {:else}
                    <span class="vote-icon" aria-hidden="true">▲</span>
                    Voter
                  {/if}
                </button>

                <!-- Animation +1 flottante -->
                {#if showPlusOne}
                  <span class="plus-one" aria-hidden="true">+1</span>
                {/if}
              </div>

              <a href="#/classement" class="btn-classement">
                Classement
              </a>
            </div>

            {#if votes > 0}
              <span class="vote-count">
                {votes.toLocaleString('fr-FR')} vote{votes > 1 ? 's' : ''}
              </span>
            {/if}
          </div>
          <!-- ─────────────────────────────────────────────────────────────── -->

          <!-- ── Playlist : clip suivant ──────────────────────────────────── -->
          {#if playlistStore.isActive && playlistStore.hasNext}
            <div class="playlist-nav">
              <span class="playlist-pos">
                {playlistStore.position} / {playlistStore.total}
              </span>
              <button class="btn-next-clip" onclick={goToNext}>
                Clip suivant
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 3l7 5-7 5V3z" fill="currentColor"/>
                  <rect x="12" y="3" width="2" height="10" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          {/if}

          <div class="clip-share">
            <SharePanel {id} title={meta?.title ?? 'Clip'} />
          </div>
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
  .video-wrap iframe,
  .video-wrap :global(#clip-yt-player),
  .video-wrap :global(#clip-yt-player iframe) {
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

  /* ── Bouton S'abonner (YouTube rouge) ────────────────────────────────────*/
  .btn-subscribe {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px var(--space-lg);
    background: #FF0000;
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    align-self: flex-start;
  }
  .btn-subscribe:hover {
    background: #CC0000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.45);
  }
  .btn-subscribe:active { transform: scale(0.97); }

  /* ── Bloc vote ────────────────────────────────────────────────────────────*/
  .vote-block {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .vote-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
  }

  .vote-btn-wrap {
    position: relative;
    display: inline-flex;
  }

  .vote-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px var(--space-lg);
    background: transparent;
    color: var(--accent-neon);
    border: 1px solid var(--accent-neon);
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
  }

  .vote-btn:hover:not(:disabled) {
    background: rgba(245, 196, 0, 0.10);
    box-shadow: 0 0 16px var(--accent-neon-glow);
  }

  .vote-btn:active:not(:disabled) { transform: scale(0.96); }

  /* État : déjà voté */
  .vote-btn.voted {
    background: rgba(245, 196, 0, 0.08);
    color: var(--accent-neon);
    border-color: var(--accent-neon);
    cursor: default;
    opacity: 0.75;
  }

  /* État : chargement */
  .vote-btn.loading {
    opacity: 0.6;
    cursor: wait;
  }

  .vote-btn:disabled { cursor: default; }

  .vote-icon {
    font-size: 0.75em;
    line-height: 1;
  }

  /* Spinner inline minimaliste */
  .vote-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1.5px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Compteur de votes */
  /* Bouton "Voir le classement" — orange/or */
  .btn-classement {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 9px var(--space-lg);
    background: transparent;
    color: #F5C400;
    border: 1px solid #F5C400;
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    text-shadow: 0 0 8px rgba(245, 196, 0, 0.35);
    box-shadow: 0 0 10px rgba(245, 196, 0, 0.2);
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }
  .btn-classement:hover {
    background: rgba(245, 196, 0, 0.1);
    box-shadow: 0 0 20px rgba(245, 196, 0, 0.45);
  }
  .btn-classement:active { transform: scale(0.97); }

  .vote-count {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
  }

  /* Animation +1 flottante */
  .plus-one {
    position: absolute;
    top: -4px;
    right: -10px;
    font-size: var(--text-sm);
    font-weight: 800;
    color: var(--accent-neon);
    pointer-events: none;
    animation: floatUp 0.85s ease forwards;
    text-shadow: 0 0 8px var(--accent-neon-glow);
  }

  @keyframes floatUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    60%  { opacity: 1; transform: translateY(-18px) scale(1.15); }
    100% { opacity: 0; transform: translateY(-32px) scale(0.9); }
  }

  /* ── Playlist nav ────────────────────────────────────────────────────────*/
  .playlist-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-top: 1px solid var(--border);
  }

  .playlist-pos {
    font-size: var(--text-xs);
    color: var(--text-muted);
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
  }

  .btn-next-clip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px var(--space-lg);
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
  .btn-next-clip:hover {
    box-shadow: 0 0 22px var(--accent-orange-glow), inset 0 0 14px rgba(255,107,43,0.1);
  }
  .btn-next-clip:active { transform: scale(0.97); }

  /* ── Share panel ──────────────────────────────────────────────────────────*/
  .clip-share {
    padding-top: var(--space-md);
    border-top: 1px solid var(--border);
    margin-top: var(--space-sm);
  }

  .empty-state {
    text-align: center;
    padding: var(--space-2xl) 0;
    color: var(--text-muted);
  }

  @media (max-width: 900px) {
    .clip-layout { grid-template-columns: 1fr; }
  }
</style>
