<script>
  import { onMount } from 'svelte';
  import CardClip from '../components/CardClip.svelte';
  import { allClips } from '../services/localClips.js';
  import { getTop } from '../services/votesAPI.js';

  /**
   * Construit le classement depuis les scores réels de l'API.
   * Les clips sans vote ont 0 — triés en bas du classement.
   * @param {Array<{ youtube_id: string, vote_count: number }>} apiScores
   */
  function buildRanked(apiScores) {
    const scoreMap = new Map(apiScores.map(s => [s.youtube_id, s.vote_count]));
    return allClips
      .map(c => ({ ...c, votes: scoreMap.get(c.youtubeId) ?? 0 }))
      .sort((a, b) => b.votes - a.votes);
  }

  // ── État réactif ─────────────────────────────────────────────────────────────
  let loading = $state(true);
  let ranked  = $state(/** @type {ReturnType<typeof buildRanked>} */ ([]));

  let top3 = $derived(ranked.slice(0, 3));
  let list = $derived(ranked.slice(3, 12));

  onMount(async () => {
    const apiScores = await getTop(12);
    ranked  = buildRanked(apiScores);
    loading = false;
  });

  // Couleurs et libellés de médailles
  const medals = [
    { label: '1', color: '#FFD700', glow: 'rgba(255,215,0,0.35)', crown: '♛' },
    { label: '2', color: '#C0C0C0', glow: 'rgba(192,192,192,0.25)', crown: '♜' },
    { label: '3', color: '#CD7F32', glow: 'rgba(205,127,50,0.25)', crown: '♝' },
  ];

  /** Formate le nombre de votes : 3 412 → "3 412" */
  function fmtVotes(n) {
    return n.toLocaleString('fr-FR');
  }
</script>

<!-- ══════════════════════════ CLASSEMENT ══════════════════════════ -->
<div class="classement-page page fade-in">

  <!-- ── Intro ──────────────────────────────────────────────────────────────── -->
  <div class="intro-card">
    <!-- Ligne décorative top -->
    <div class="intro-deco" aria-hidden="true"></div>

    <span class="intro-eyebrow">Sanctum Music</span>
    <h1 class="intro-title">Classement <span class="accent-word">Votes</span></h1>
    <p class="intro-body">
      Les clips qui résonnent le plus fort dans la communauté.<br />
      Chaque vote compte — chaque voix façonne le classement.
    </p>
    <p class="intro-disclaimer">
      Votes de la communauté · Mis à jour en temps réel
    </p>
  </div>

  <!-- ── Chargement ───────────────────────────────────────────────────────────── -->
  {#if loading}
    <div class="loading-state" aria-label="Chargement du classement">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>Chargement du classement…</span>
    </div>
  {/if}

  <!-- ── Podium Top 3 ────────────────────────────────────────────────────────── -->
  <section class="podium-section" aria-label="Top 3" class:hidden={loading}>
    <div class="section-header">
      <h2 class="section-label">Top 3 du moment</h2>
      <span class="section-sep" aria-hidden="true"></span>
    </div>

    <div class="podium-grid">
      {#each top3 as clip, i}
        {@const medal = medals[i]}
        <div
          class="podium-item podium-rank-{i + 1}"
          style="--medal-color:{medal.color}; --medal-glow:{medal.glow};"
        >
          <!-- Badge de rang -->
          <div class="rank-badge" aria-label="Rang {i + 1}">
            <span class="rank-crown" aria-hidden="true">{medal.crown}</span>
            <span class="rank-num">#{i + 1}</span>
          </div>

          <!-- Card clip standard -->
          <CardClip {clip} />

          <!-- Barre de votes -->
          <div class="votes-row">
            <span class="votes-icon" aria-hidden="true">▲</span>
            <span class="votes-count">{fmtVotes(clip.votes)} votes</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- ── Liste classée 4-12 ──────────────────────────────────────────────────── -->
  <section class="list-section" aria-label="Classement positions 4 à 12" class:hidden={loading}>
    <div class="section-header">
      <h2 class="section-label">Classement général</h2>
      <span class="section-sep" aria-hidden="true"></span>
    </div>

    <ol class="rank-list" start="4">
      {#each list as clip, i}
        {@const rank = i + 4}
        <li class="rank-row">
          <!-- Numéro de rang -->
          <span class="rank-num-sm" aria-label="Rang {rank}">#{rank}</span>

          <!-- Miniature -->
          <button
            class="rank-thumb"
            onclick={() => { window.location.hash = `#/clip/${clip.id}`; }}
            aria-label="Lire {clip.title}"
            tabindex="0"
          >
            <img
              src={clip.thumbnail}
              alt={clip.title}
              loading="lazy"
              width="96" height="54"
            />
            <span class="rank-play-icon" aria-hidden="true">▶</span>
          </button>

          <!-- Infos -->
          <div class="rank-info">
            <p class="rank-title">{clip.title}</p>
            <p class="rank-artist">{clip.artist}</p>
          </div>

          <!-- Score -->
          <div class="rank-score" aria-label="{clip.votes} votes">
            <span class="score-num">{fmtVotes(clip.votes)}</span>
            <span class="score-label">votes</span>
          </div>
        </li>
      {/each}
    </ol>
  </section>

  <!-- ── CTA bas de page ────────────────────────────────────────────────────── -->
  <div class="cta-block">
    <p class="cta-text">Découvrez tous les clips de la sélection Sanctum</p>
    <a href="#/clips" class="cta-btn">Voir tous les clips</a>
  </div>

</div>

<style>
  /* ── Utilitaires ─────────────────────────────────────────────────────────── */
  .hidden { display: none; }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-2xl) 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    letter-spacing: 0.06em;
  }

  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--border);
    border-top-color: var(--accent-neon);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Page ────────────────────────────────────────────────────────────────── */
  .classement-page {
    min-height: 100vh;
    padding: 6rem var(--space-lg) 5rem;
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
  }

  /* ── Intro card ──────────────────────────────────────────────────────────── */
  .intro-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl, 2.5rem) var(--space-2xl, 2.5rem);
    text-align: center;
    overflow: hidden;
    box-shadow: 0 0 48px rgba(0,0,0,0.5);
  }

  .intro-deco {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--accent-neon) 35%,
      var(--accent-orange) 65%,
      transparent
    );
    opacity: 0.6;
  }

  .intro-eyebrow {
    display: inline-block;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent-neon);
    margin-bottom: var(--space-md);
  }

  .intro-title {
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-primary);
    margin: 0 0 var(--space-lg);
    line-height: 1.1;
  }

  .accent-word {
    color: var(--accent-orange);
    text-shadow: 0 0 24px var(--accent-orange-glow, rgba(255,107,0,0.4));
  }

  .intro-body {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.8;
    margin: 0 0 var(--space-lg);
    max-width: 540px;
    margin-inline: auto;
  }

  .intro-disclaimer {
    font-size: var(--text-xs);
    color: var(--text-muted, #555);
    letter-spacing: 0.04em;
    margin: 0;
    opacity: 0.65;
  }

  /* ── Section header ──────────────────────────────────────────────────────── */
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .section-label {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent-orange);
    margin: 0;
    white-space: nowrap;
  }

  .section-sep {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--border), transparent);
    opacity: 0.5;
  }

  /* ── Podium Top 3 ────────────────────────────────────────────────────────── */
  .podium-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
    align-items: start;
  }

  .podium-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    position: relative;
  }

  /* Glow de médaille autour du clip */
  .podium-rank-1 :global(.card-clip) {
    border-color: #FFD700;
    box-shadow: 0 0 24px rgba(255,215,0,0.25), 0 4px 24px rgba(0,0,0,0.4);
  }
  .podium-rank-2 :global(.card-clip) {
    border-color: rgba(192,192,192,0.5);
    box-shadow: 0 0 16px rgba(192,192,192,0.15), 0 4px 20px rgba(0,0,0,0.4);
  }
  .podium-rank-3 :global(.card-clip) {
    border-color: rgba(205,127,50,0.5);
    box-shadow: 0 0 16px rgba(205,127,50,0.15), 0 4px 20px rgba(0,0,0,0.4);
  }

  /* Badge de rang (au-dessus du card) */
  .rank-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--bg-card);
    border: 1px solid var(--medal-color);
    border-radius: var(--radius-full, 9999px);
    width: fit-content;
    box-shadow: 0 0 12px var(--medal-glow);
  }

  .rank-crown {
    font-size: 0.85rem;
    color: var(--medal-color);
    line-height: 1;
  }

  .rank-num {
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--medal-color);
    text-transform: uppercase;
  }

  /* Barre de votes sous le card */
  .votes-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--space-xs) 0;
  }

  .votes-icon {
    font-size: 0.6rem;
    color: var(--medal-color);
    opacity: 0.8;
  }

  .votes-count {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.06em;
  }

  /* Légèrement plus grand pour le #1 */
  .podium-rank-1 .rank-badge {
    padding: 5px 14px;
  }
  .podium-rank-1 .rank-crown { font-size: 1rem; }
  .podium-rank-1 .rank-num { font-size: var(--text-sm); }

  /* ── Liste classée ───────────────────────────────────────────────────────── */
  .rank-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rank-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .rank-row:hover {
    border-color: var(--border-accent);
    background: rgba(255,255,255,0.02);
    box-shadow: 0 0 16px rgba(0,229,204,0.06);
  }

  .rank-num-sm {
    font-size: var(--text-sm);
    font-weight: 800;
    color: var(--text-muted, #444);
    letter-spacing: 0.06em;
    min-width: 2.4rem;
    text-align: center;
    flex-shrink: 0;
  }

  /* Miniature cliquable */
  .rank-thumb {
    position: relative;
    flex-shrink: 0;
    width: 96px;
    height: 54px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: none;
    padding: 0;
    cursor: pointer;
    background: #000;
  }

  .rank-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity var(--transition-fast);
  }

  .rank-play-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--accent-neon);
    background: rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .rank-thumb:hover .rank-play-icon { opacity: 1; }
  .rank-thumb:hover img { opacity: 0.65; }

  /* Infos clip */
  .rank-info {
    flex: 1;
    min-width: 0;
  }

  .rank-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rank-artist {
    font-size: var(--text-xs);
    color: var(--accent-neon);
    margin: 0;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Score votes */
  .rank-score {
    flex-shrink: 0;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .score-num {
    font-size: var(--text-sm);
    font-weight: 800;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  .score-label {
    font-size: var(--text-xs);
    color: var(--text-muted, #555);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── CTA bas ─────────────────────────────────────────────────────────────── */
  .cta-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) 0 var(--space-sm);
    border-top: 1px solid var(--border);
  }

  .cta-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    letter-spacing: 0.04em;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 11px var(--space-xl);
    background: transparent;
    color: var(--accent-neon);
    border: 1px solid var(--accent-neon);
    border-radius: var(--radius-md);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
  }

  .cta-btn:hover {
    background: rgba(0,229,204,0.1);
    box-shadow: 0 0 18px var(--accent-neon-glow);
  }

  .cta-btn:active { transform: scale(0.97); }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 780px) {
    .podium-grid {
      grid-template-columns: 1fr;
      max-width: 380px;
      margin: 0 auto;
    }
  }

  @media (max-width: 600px) {
    .classement-page {
      padding: 5rem var(--space-md) 4rem;
      gap: 2.5rem;
    }

    .intro-card {
      padding: var(--space-xl) var(--space-lg);
    }

    .rank-row {
      gap: var(--space-sm);
      padding: var(--space-sm);
    }

    .rank-thumb {
      width: 72px;
      height: 40px;
    }

    .rank-num-sm {
      min-width: 1.8rem;
      font-size: var(--text-xs);
    }

    .rank-title {
      font-size: var(--text-xs);
    }

    .rank-score {
      display: none; /* masqué sur très petit écran */
    }
  }
</style>
