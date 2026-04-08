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
  import LaCrypte from './pages/LaCrypte.svelte';
  import ReggaeDub from './pages/ReggaeDub.svelte';
  import Classement from './pages/Classement.svelte';
  import BeatsOnly from './pages/BeatsOnly.svelte';
  import FAQ from './pages/FAQ.svelte';
  import MentionsLegales from './pages/MentionsLegales.svelte';
  import Streams24 from './pages/Streams24.svelte';
  import ClassiquesRapFR from './pages/ClassiquesRapFR.svelte';
  import { surpriseStore } from './core/surpriseStore.svelte.js';
  import { radioSearchStore } from './core/radioSearchStore.svelte.js';
  import RadioSearchModal from './components/RadioSearchModal.svelte';
  import { postVote, hasVotedLocally } from './services/votesAPI.js';

  // ----- Routeur hash simple -----
  let currentRoute = $state(window.location.hash || '#/');
  let clipId  = $state(null);
  let beatId  = $state(null);

  // ----- Bouton scroll-to-top -----
  let showScrollTop = $state(false);

  function onScroll() {
    showScrollTop = window.scrollY > 300;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function parseHash(hash) {
    const clipMatch = hash.match(/^#\/clip\/(.+)$/);
    if (clipMatch) { clipId = clipMatch[1]; beatId = null; return '#/clip'; }
    const beatMatch = hash.match(/^#\/beats\/(.+)$/);
    if (beatMatch) { beatId = beatMatch[1]; clipId = null; return '#/beats'; }
    clipId = null; beatId = null;
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

  // ── État vote dans la modal surprise ────────────────────────────────────────
  let sVoted   = $state(false);
  let sVoting  = $state(false);
  let sPlusOne = $state(false);

  // Réinitialise quand le clip change (bouton "Un autre clip")
  $effect(() => {
    const yId = surpriseStore.currentClip?.youtubeId;
    if (yId) {
      sVoted  = hasVotedLocally(yId);
      sVoting = false;
    }
  });

  async function handleSurpriseVote() {
    const yId = surpriseStore.currentClip?.youtubeId;
    if (!yId || sVoted || sVoting) return;
    sVoting = true;
    const result = await postVote(yId);
    if (result.success) {
      sVoted   = true;
      sPlusOne = true;
      setTimeout(() => { sPlusOne = false; }, 900);
    } else if (result.error === 'already_voted') {
      sVoted = true;
    }
    sVoting = false;
  }

  /** Ferme les modals sur Échap */
  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape') {
      if (radioSearchStore.show) radioSearchStore.close();
      else if (surpriseStore.showModal) surpriseStore.close();
    }
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
  {:else if currentRoute === '#/crypte'}
    <LaCrypte />
  {:else if currentRoute === '#/reggae-dub'}
    <ReggaeDub />
  {:else if currentRoute === '#/classement'}
    <Classement />
  {:else if currentRoute === '#/beats'}
    <BeatsOnly autoPlayId={beatId} />
  {:else if currentRoute === '#/faq'}
    <FAQ />
  {:else if currentRoute === '#/mentions-legales'}
    <MentionsLegales />
  {:else if currentRoute === '#/streams'}
    <Streams24 />
  {:else if currentRoute === '#/classiques-rap-fr'}
    <ClassiquesRapFR />
  {:else}
    <div class="page container fade-in" style="text-align:center; padding-top:5rem;">
      <h2 style="font-size:var(--text-3xl); color:var(--accent-gold);">404</h2>
      <p style="color:var(--text-secondary); margin-top:1rem;">Page introuvable</p>
      <a href="#/" style="margin-top:2rem; display:inline-block;" class="badge">Retour à l'accueil</a>
    </div>
  {/if}
</main>

<PlayerAudio />
<Footer />
<RadioSearchModal />

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
        <!-- Ligne 1 : voter + classement -->
        <div class="surprise-vote-row">
          <div class="svote-wrap">
            <button
              class="sbtn sbtn--vote"
              class:sbtn--voted={sVoted}
              onclick={handleSurpriseVote}
              disabled={sVoted || sVoting}
              aria-label={sVoted ? 'Déjà voté' : 'Voter pour ce clip'}
            >
              {#if sVoting}
                <span class="svote-spinner" aria-hidden="true"></span>Envoi…
              {:else if sVoted}
                ✓ Voté
              {:else}
                ▲ Voter
              {/if}
            </button>
            {#if sPlusOne}
              <span class="splus-one" aria-hidden="true">+1</span>
            {/if}
          </div>
          <a
            href="#/classement"
            class="sbtn sbtn--gold"
            onclick={() => surpriseStore.close()}
          >
            Classement
          </a>
        </div>

        <!-- Ligne 2 : abonner / autre clip / fermer -->
        {#if surpriseStore.currentClip.channelId}
          <a
            class="sbtn sbtn--yt"
            href="https://www.youtube.com/channel/{surpriseStore.currentClip.channelId}?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="S'abonner à la chaîne YouTube"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
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

  /* Bouton S'abonner — YouTube rouge */
  .sbtn--yt {
    background: #FF0000;
    color: #fff;
    border: none;
  }
  .sbtn--yt:hover {
    background: #CC0000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.45);
  }

  .sbtn--orange {
    background: #FF6B00;
    color: #080808;
  }
  .sbtn--orange:hover {
    background: #2a2a2a;
    color: var(--accent-orange);
  }

  /* Ligne vote + classement */
  .surprise-vote-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
    justify-content: center;
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .svote-wrap {
    position: relative;
    display: inline-flex;
  }

  /* Bouton voter (dans la modal) */
  .sbtn--vote {
    background: transparent;
    color: #4CAF50;
    border: 1px solid #4CAF50;
  }
  .sbtn--vote:hover:not(:disabled) {
    background: rgba(76, 175, 80, 0.10);
    color: #fff;
    box-shadow: 0 0 14px rgba(76, 175, 80, 0.30);
  }
  .sbtn--voted {
    opacity: 0.7;
    cursor: default;
  }

  /* Spinner inline */
  .svote-spinner {
    display: inline-block;
    width: 11px;
    height: 11px;
    border: 1.5px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: sspin 0.6s linear infinite;
    margin-right: 6px;
    flex-shrink: 0;
  }
  @keyframes sspin { to { transform: rotate(360deg); } }

  /* +1 flottant */
  .splus-one {
    position: absolute;
    top: -4px;
    right: -10px;
    font-size: var(--text-sm);
    font-weight: 800;
    color: var(--accent-neon);
    pointer-events: none;
    animation: sfloat 0.85s ease forwards;
    text-shadow: 0 0 8px var(--accent-neon-glow);
  }
  @keyframes sfloat {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    60%  { opacity: 1; transform: translateY(-16px) scale(1.15); }
    100% { opacity: 0; transform: translateY(-28px) scale(0.9); }
  }

  /* Bouton "Voir le classement" — jaune/or (même style que ClipDetail) */
  .sbtn--gold {
    background: transparent;
    color: #F5C400;
    border: 1px solid #F5C400;
    text-shadow: 0 0 8px rgba(245, 196, 0, 0.35);
    box-shadow: 0 0 10px rgba(245, 196, 0, 0.2);
  }
  .sbtn--gold:hover {
    background: rgba(245, 196, 0, 0.1);
    color: #fff;
    box-shadow: 0 0 20px rgba(245, 196, 0, 0.45);
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
    .surprise-vote-row { flex-wrap: nowrap; justify-content: center; }
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
