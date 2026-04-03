<script>
  import SharePanel from '../components/SharePanel.svelte';
  import { findClip } from '../services/localClips.js';
  import { postVote, getVotes, hasVotedLocally } from '../services/votesAPI.js';

  /** @type {{ id: string | null }} */
  let { id } = $props();

  let meta     = $derived(id ? (findClip(id) ?? null) : null);
  let embedUrl = $derived(id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null);

  // ── État du vote ────────────────────────────────────────────────────────────
  let votes      = $state(0);
  let hasVoted   = $state(false);
  let voting     = $state(false);
  let showPlusOne = $state(false);

  // Charge le score et l'état local au montage / changement de clip
  $effect(() => {
    if (!id) return;
    hasVoted = hasVotedLocally(id);
    getVotes(id).then(n => { votes = n; });
  });

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
          <iframe
            src={embedUrl}
            title={meta?.title ?? 'Clip vidéo'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
            frameborder="0"
          ></iframe>
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

          <!-- ── Bloc vote ──────────────────────────────────────────────────── -->
          <div class="vote-block">
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

            {#if votes > 0}
              <span class="vote-count">
                {votes.toLocaleString('fr-FR')} vote{votes > 1 ? 's' : ''}
              </span>
            {/if}
          </div>
          <!-- ─────────────────────────────────────────────────────────────── -->

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

  /* ── Bloc vote ────────────────────────────────────────────────────────────*/
  .vote-block {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
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
    background: rgba(0, 229, 204, 0.12);
    box-shadow: 0 0 16px var(--accent-neon-glow);
  }

  .vote-btn:active:not(:disabled) { transform: scale(0.96); }

  /* État : déjà voté */
  .vote-btn.voted {
    background: rgba(0, 229, 204, 0.08);
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
    color: var(--accent-orange);
    border: 1px solid var(--accent-orange);
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    text-shadow: 0 0 8px rgba(255, 107, 43, 0.3);
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }
  .btn-classement:hover {
    background: rgba(255, 107, 43, 0.1);
    box-shadow: 0 0 18px var(--accent-orange-glow);
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
