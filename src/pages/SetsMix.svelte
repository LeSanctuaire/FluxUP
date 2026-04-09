<script>
  import moodsData from '../data/moodsMix.json';

  // État global pour la modal
  let selectedMood = $state(null);
  let currentSetIndex = $state(0);

  function openMood(/** @type {any} */ mood) {
    selectedMood = mood;
    currentSetIndex = 0;
  }

  function closeMood() {
    selectedMood = null;
    currentSetIndex = 0;
  }

  function selectSet(/** @type {number} */ index) {
    currentSetIndex = index;
  }

  function randomSet() {
    if (!selectedMood) return;
    currentSetIndex = Math.floor(Math.random() * selectedMood.sets.length);
  }

  function nextSet() {
    if (!selectedMood) return;
    currentSetIndex = (currentSetIndex + 1) % selectedMood.sets.length;
  }

  function prevSet() {
    if (!selectedMood) return;
    currentSetIndex = (currentSetIndex - 1 + selectedMood.sets.length) % selectedMood.sets.length;
  }

  // Récupère le set courant
  const getCurrentSet = () => {
    if (!selectedMood || !selectedMood.sets[currentSetIndex]) return null;
    return selectedMood.sets[currentSetIndex];
  };

  // Ferme la modal au clic sur Échap
  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape' && selectedMood) closeMood();
  }

  // Ferme au clic sur le backdrop
  function onBackdropClick(/** @type {MouseEvent} */ e) {
    if (e.target === e.currentTarget) closeMood();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="page fade-in">
  <div class="container">
    <!-- En-tête de la page -->
    <div class="page-header">
      <h1 class="section-title">Sets <span>&</span> Mix</h1>
      <p class="page-sub">Mixs & DJ Sets par mood</p>
    </div>

    <!-- Grille de moods -->
    <div class="moods-grid">
      {#each moodsData as mood (mood.id)}
        <button
          class="mood-card"
          style="--mood-color: {mood.color}"
          onclick={() => openMood(mood)}
          aria-label={`Ouvrir ${mood.title}`}
        >
          <div class="mood-emoji">{mood.emoji}</div>
          <h3 class="mood-title">{mood.title}</h3>
          <p class="mood-count">{mood.sets.length} mix{mood.sets.length > 1 ? '' : ''}</p>
          <div class="mood-btn" aria-hidden="true">Découvrir les Mix</div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- ════════════════════════════ MODAL ════════════════════════════ -->
{#if selectedMood && getCurrentSet()}
  <div class="modal-backdrop" onclick={onBackdropClick} onkeydown={null} role="dialog" aria-modal="true" aria-label="Sets & Mix" tabindex="-1">
    <div class="modal-content">
      <!-- En-tête de la modal -->
      <div class="modal-header">
        <div class="mood-info">
          <h2 class="modal-title">Sets & Mix {selectedMood.title}</h2>
          <p class="modal-subtitle">{selectedMood.sets.length} mix disponibles</p>
        </div>
        <button class="modal-close" onclick={closeMood} aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Player iframe -->
      <div class="player-section">
        <div class="player-wrapper">
          {#key getCurrentSet().id}
            <iframe
              title={`Player: ${getCurrentSet().title}`}
              scrolling="no"
              style="border-radius: 8px;"
              width="100%"
              height="166"
              src={getCurrentSet().url}
              frameborder="0"
              allowtransparency
              allow="autoplay"
            ></iframe>
          {/key}
        </div>
      </div>

      <!-- Contrôles du player -->
      <div class="player-controls">
        <button class="control-btn" onclick={prevSet} aria-label="Set précédent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button class="control-btn control-btn--primary" onclick={randomSet} title="Aléatoire">
          🎲
        </button>
        <button class="control-btn" onclick={nextSet} aria-label="Set suivant">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <!-- Liste des sets -->
      <div class="sets-list">
        <h3 class="sets-title">Tous les sets</h3>
        <div class="sets-scroll">
          {#each selectedMood.sets as set, index (set.id)}
            <button
              class="set-item"
              class:set-item--active={currentSetIndex === index}
              onclick={() => selectSet(index)}
              aria-label={`${set.title} par ${set.artist}`}
              aria-pressed={currentSetIndex === index ? 'true' : 'false'}
            >
              <div class="set-index">{index + 1}</div>
              <div class="set-meta">
                <div class="set-name">{set.title}</div>
                <div class="set-artist">{set.artist}</div>
              </div>
              {#if currentSetIndex === index}
                <div class="set-indicator" aria-hidden="true">▶</div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ──────────────────────────── PAGE PRINCIPALE ──────────────────────────── */
  .page-header {
    margin-bottom: var(--space-2xl);
  }

  .section-title {
    font-size: var(--text-3xl);
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-neon));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    letter-spacing: -1px;
  }

  .section-title span {
    color: var(--text-secondary);
    font-weight: 400;
  }

  .page-sub {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-top: var(--space-xs);
  }

  /* Grille de moods */
  .moods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }

  /* Carte mood */
  .mood-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-xl);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-base);
    text-align: center;
    font-family: var(--font-base);
  }

  .mood-card:hover {
    border-color: var(--mood-color);
    box-shadow: 0 0 20px rgba(219, 183, 0, 0.15);
    transform: translateY(-4px);
  }

  .mood-emoji {
    font-size: 2.5rem;
    margin-bottom: var(--space-xs);
  }

  .mood-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .mood-count {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
  }

  .mood-btn {
    margin-top: var(--space-md);
    padding: 8px 16px;
    background: rgba(219, 183, 0, 0.1);
    border: 1px solid var(--mood-color);
    border-radius: var(--radius-md);
    color: var(--mood-color);
    font-size: var(--text-xs);
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    transition: all var(--transition-fast);
  }

  .mood-card:hover .mood-btn {
    background: var(--mood-color);
    color: #000;
    box-shadow: 0 0 12px var(--mood-color);
  }

  /* ──────────────────────────── MODAL ──────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    animation: backdropFadeIn 0.18s ease;
  }

  @keyframes backdropFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: var(--bg-card);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-xl);
    box-shadow: 0 0 60px rgba(219, 183, 0, 0.2);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modalSlideUp 0.22s ease;
  }

  @keyframes modalSlideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* En-tête modal */
  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border);
  }

  .mood-info {
    flex: 1;
  }

  .modal-title {
    font-size: var(--text-xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 4px;
  }

  .modal-subtitle {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.08);
  }

  /* Section player */
  .player-section {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border);
  }

  .player-wrapper {
    overflow: hidden;
    border-radius: 8px;
  }

  .player-wrapper iframe {
    display: block;
  }

  /* Contrôles */
  .player-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border);
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(219, 183, 0, 0.1);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 1rem;
  }

  .control-btn:hover {
    border-color: var(--accent-gold);
    color: var(--accent-gold);
    box-shadow: 0 0 12px rgba(219, 183, 0, 0.3);
  }

  .control-btn--primary {
    background: rgba(219, 183, 0, 0.15);
    border-color: var(--accent-gold);
  }

  .control-btn--primary:hover {
    background: rgba(219, 183, 0, 0.25);
  }

  /* Liste des sets */
  .sets-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sets-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    padding: var(--space-md) var(--space-lg) var(--space-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border);
  }

  .sets-scroll {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-md);
    max-height: 240px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Scrollbar custom */
  .sets-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .sets-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .sets-scroll::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
  .sets-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--border-accent);
  }

  /* Item set */
  .set-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    font-family: var(--font-base);
    font-size: var(--text-sm);
  }

  .set-item:hover {
    background: rgba(219, 183, 0, 0.08);
    border-color: var(--border);
    color: var(--text-primary);
  }

  .set-item--active {
    background: rgba(219, 183, 0, 0.15);
    border-color: var(--accent-gold);
    color: var(--accent-gold);
  }

  .set-index {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(219, 183, 0, 0.1);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: 700;
    flex-shrink: 0;
  }

  .set-item--active .set-index {
    background: var(--accent-gold);
    color: #000;
  }

  .set-meta {
    flex: 1;
    min-width: 0;
  }

  .set-name {
    font-weight: 600;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .set-artist {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .set-item--active .set-artist {
    color: rgba(255, 255, 255, 0.6);
  }

  .set-indicator {
    font-size: var(--text-xs);
    color: var(--accent-gold);
    animation: playPulse 0.8s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes playPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .moods-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
    }

    .modal-content {
      max-width: 100%;
      max-height: 85vh;
    }

    .sets-scroll {
      max-height: 180px;
    }
  }

  @media (max-width: 480px) {
    .moods-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .modal-header {
      padding: var(--space-md);
    }

    .player-section {
      padding: var(--space-md);
    }

    .player-controls {
      padding: var(--space-md);
      gap: var(--space-sm);
    }

    .control-btn {
      width: 36px;
      height: 36px;
    }

    .sets-scroll {
      max-height: 150px;
      padding: var(--space-sm);
    }
  }
</style>
