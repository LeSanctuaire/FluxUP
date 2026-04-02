<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import Footer from './components/Footer.svelte';
  import PlayerAudio from './components/PlayerAudio.svelte';
  import Home from './pages/Home.svelte';
  import LesClips from './pages/LesClips.svelte';
  import Explorer from './pages/Explorer.svelte';
  import ClipDetail from './pages/ClipDetail.svelte';
  import RadioFlux from './pages/RadioFlux.svelte';
  import { surpriseStore } from './core/surpriseStore.svelte.js';

  // ----- Routeur hash simple -----
  let currentRoute = $state(window.location.hash || '#/');
  let clipId = $state(null);

  // ----- Bouton scroll-to-top -----
  let showScrollTop = $state(false);

  function onScroll() {
    showScrollTop = window.scrollY > 300;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function parseHash(hash) {
    const match = hash.match(/^#\/clip\/(.+)$/);
    if (match) {
      clipId = match[1];
      return '#/clip';
    }
    clipId = null;
    return hash || '#/';
  }

  onMount(() => {
    const onHashChange = () => {
      currentRoute = parseHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHashChange);
    currentRoute = parseHash(window.location.hash);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  /** Ferme la modal surprise sur Échap */
  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape' && surpriseStore.showModal) surpriseStore.close();
  }

  /** Ferme sur clic du backdrop */
  function onBackdropClick(/** @type {MouseEvent} */ e) {
    if (e.target === e.currentTarget) surpriseStore.close();
  }
</script>

<svelte:window onkeydown={onKeydown} onscroll={onScroll} />

<Navbar {currentRoute} />

<main id="main-content">
  {#if currentRoute === '#/' || currentRoute === '#/home'}
    <Home />
  {:else if currentRoute === '#/clips'}
    <LesClips />
  {:else if currentRoute === '#/explorer'}
    <Explorer />
  {:else if currentRoute === '#/clip'}
    <ClipDetail id={clipId} />
  {:else if currentRoute === '#/radio'}
    <RadioFlux />
  {:else}
    <div class="page container fade-in" style="text-align:center; padding-top:5rem;">
      <h2 style="font-size:var(--text-3xl); color:var(--accent-orange);">404</h2>
      <p style="color:var(--text-secondary); margin-top:1rem;">Page introuvable</p>
      <a href="#/" style="margin-top:2rem; display:inline-block;" class="badge">Retour à l'accueil</a>
    </div>
  {/if}
</main>

<PlayerAudio />
<Footer />

<!-- ── Bouton scroll-to-top ──────────────────────────────────────────────── -->
{#if showScrollTop}
  <button class="scroll-top" onclick={scrollToTop} aria-label="Remonter en haut">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 12V4M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
{/if}

<!-- ======= MODAL GLOBALE "ME SURPRENDRE" ======= -->
<!-- Accessible depuis n'importe quelle page via surpriseStore -->
{#if surpriseStore.showModal && surpriseStore.currentClip}
  <div
    class="surprise-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Clip aléatoire"
    tabindex="-1"
    onclick={onBackdropClick}
    onkeydown={null}
  >
    <div class="surprise-box">
      <!-- En-tête -->
      <div class="surprise-header">
        <div class="surprise-meta">
          <h2 class="surprise-title">{surpriseStore.currentClip.title}</h2>
          <p class="surprise-artists">{surpriseStore.currentClip.artists?.join(', ')}</p>
        </div>
        <button class="surprise-close" onclick={() => surpriseStore.close()} aria-label="Fermer">✕</button>
      </div>

      <!-- Iframe YouTube autoplay -->
      <div class="surprise-video">
        <iframe
          loading="lazy"
          src="https://www.youtube.com/embed/{surpriseStore.currentClip.youtubeId}?autoplay=1&rel=0"
          title={surpriseStore.currentClip.title}
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <!-- Actions -->
      <div class="surprise-actions">
        {#if surpriseStore.currentClip.channelId}
          <a
            class="sbtn sbtn--secondary"
            href="https://www.youtube.com/channel/{surpriseStore.currentClip.channelId}?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            S'abonner
          </a>
        {/if}
        <button class="sbtn sbtn--orange" onclick={() => surpriseStore.next()}>
          Un autre clip
        </button>
        <button class="sbtn sbtn--ghost" onclick={() => surpriseStore.close()}>
          Fermer
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Modal "Me Surprendre" ────────────────────────────────────────────────*/
  .surprise-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    animation: sfadeIn 0.18s ease;
  }

  @keyframes sfadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .surprise-box {
    background: var(--bg-card);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-xl);
    box-shadow: 0 0 60px var(--accent-neon-glow);
    width: 100%;
    max-width: 720px;
    overflow: hidden;
    animation: sslideUp 0.22s ease;
  }

  @keyframes sslideUp {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .surprise-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-xl);
    border-bottom: 1px solid var(--border);
  }

  .surprise-meta { flex: 1; }

  .surprise-title {
    font-size: var(--text-lg);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 4px;
  }

  .surprise-artists {
    font-size: var(--text-sm);
    color: var(--accent-neon);
    margin: 0;
  }

  .surprise-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-lg);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-md);
    transition: color var(--transition-fast), background var(--transition-fast);
    flex-shrink: 0;
  }
  .surprise-close:hover { color: var(--text-primary); background: rgba(255,255,255,0.08); }

  /* Ratio 16/9 */
  .surprise-video {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #000;
  }
  .surprise-video iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .surprise-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-xl);
    flex-wrap: wrap;
  }

  /* Boutons de la modal */
  .sbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-base);
    font-weight: 600;
    font-size: var(--text-sm);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 10px var(--space-xl);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-decoration: none;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
    user-select: none;
  }
  .sbtn:active { transform: scale(0.97); }

  .sbtn--secondary {
    background: transparent;
    color: var(--accent-neon);
    border: 1px solid var(--accent-neon);
  }
  .sbtn--secondary:hover {
    background: var(--accent-neon-glow);
    box-shadow: 0 0 14px var(--accent-neon-glow);
  }

  .sbtn--orange {
    background: var(--accent-orange);
    color: var(--bg-primary);
  }
  .sbtn--orange:hover {
    background: #ff8c45;
    box-shadow: 0 0 20px var(--accent-orange-glow);
  }

  .sbtn--ghost {
    background: rgba(255,255,255,0.05);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .sbtn--ghost:hover {
    background: rgba(255,255,255,0.10);
    color: var(--text-primary);
  }

  @media (max-width: 600px) {
    .surprise-actions { flex-direction: column; align-items: stretch; }
    .surprise-actions .sbtn { text-align: center; }
  }

  /* ── Bouton scroll-to-top ─────────────────────────────────────────────────*/
  .scroll-top {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 500;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 10, 15, 0.92);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    animation: fadeInUp 0.2s ease both;
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast),
      box-shadow var(--transition-fast);
  }
  .scroll-top:hover {
    border-color: var(--accent-neon);
    color: var(--accent-neon);
    box-shadow: 0 0 12px var(--accent-neon-glow);
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
