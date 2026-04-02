<script>
  import CardClip from '../components/CardClip.svelte';
  import Button from '../components/Button.svelte';
  import { getFeaturedClips, getRecentClips } from '../services/localClips.js';
  import { surpriseStore } from '../core/surpriseStore.svelte.js';

  const featured = getFeaturedClips(6);
  const recentClips = getRecentClips(12);

  /** @type {HTMLElement | null} */
  let sliderEl = $state(null);
  let isPaused = $state(false);

  const CARD_STEP = 296;   // 280px card + ~16px gap
  const SPEED    = 0.6;    // px/frame → ~36px/s à 60fps

  let rafId = 0;
  let manualScrolling = false;

  /** Boucle RAF : scroll linéaire continu, reset instantané en bout de liste */
  function tick() {
    if (sliderEl && !isPaused && !manualScrolling) {
      const max = sliderEl.scrollWidth - sliderEl.clientWidth;
      if (sliderEl.scrollLeft >= max - 1) {
        sliderEl.scrollLeft = 0;
      } else {
        sliderEl.scrollLeft += SPEED;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  /** Défile manuellement de ±3 cards (smooth), suspend l'auto pendant l'animation */
  function slideBy(/** @type {number} */ direction) {
    if (!sliderEl) return;
    manualScrolling = true;
    const max    = sliderEl.scrollWidth - sliderEl.clientWidth;
    const target = Math.max(0, Math.min(sliderEl.scrollLeft + direction * CARD_STEP * 3, max));
    sliderEl.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(() => { manualScrolling = false; }, 650);
  }

  $effect(() => {
    if (!sliderEl) return;
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  });
</script>

<div class="page fade-in">
  <!-- ======= HERO ======= -->
  <section class="hero">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="container hero-content">
      <span class="badge hero-badge">Nouveau · FluxUP</span>
      <h1 class="hero-title">
        Découvrez la <span class="neon">musique</span><br />
        autrement.
      </h1>
      <p class="hero-sub">
        Clips, radios et playlists en un seul endroit.
      </p>
      <div class="hero-actions">
        <Button size="lg" variant="primary" href="#/clips">Explorer les clips</Button>

        <!-- Bouton Me Surprendre → accent orange + dé 3D animé -->
        <button class="btn btn--surprise btn--lg btn--compact" type="button"
          onclick={() => surpriseStore.trigger()}>
          <span class="dice-wrap" aria-hidden="true">
            <span class="dice-cube">
              <span class="dice-face dice-front">⚀</span>
              <span class="dice-face dice-back">⚅</span>
              <span class="dice-face dice-right">⚂</span>
              <span class="dice-face dice-left">⚃</span>
              <span class="dice-face dice-top">⚄</span>
              <span class="dice-face dice-bottom">⚁</span>
            </span>
          </span>
          Me Surprendre
        </button>

        <Button size="lg" variant="secondary" href="#/radio">Radios en direct</Button>
      </div>
    </div>
    <div class="hero-glow" aria-hidden="true"></div>
  </section>

  <!-- ======= RADAR DES SORTIES ======= -->
  <section class="container section-radar">
    <div class="section-header">
      <div>
        <h2 class="section-title">Radar des <span class="neon">Sorties</span></h2>
        <p class="section-sub">Les dernières sorties à ne pas manquer</p>
      </div>
      <div class="slider-nav">
        <button class="slider-btn" onclick={() => slideBy(-1)} aria-label="Précédent">‹</button>
        <button class="slider-btn" onclick={() => slideBy(1)}  aria-label="Suivant">›</button>
      </div>
    </div>

    <!-- Slider horizontal scroll-snap — pause au survol/touch -->
    <div class="slider" bind:this={sliderEl} role="region" aria-label="Slider clips récents"
      onmouseenter={() => isPaused = true}
      onmouseleave={() => isPaused = false}
      ontouchstart={() => isPaused = true}
      ontouchend={() => { isPaused = false; }}
    >
      {#each recentClips as clip}
        <div class="slider-item">
          <CardClip {clip} />
        </div>
      {/each}
    </div>
  </section>

  <!-- ======= CLIPS EN VEDETTE ======= -->
  <section class="container section-clips">
    <div class="section-header">
      <h2 class="section-title">En <span>vedette</span></h2>
      <Button variant="ghost" size="sm" href="#/clips">Voir tout →</Button>
    </div>
    <div class="grid-clips">
      {#each featured as clip}
        <CardClip {clip} />
      {/each}
    </div>
  </section>

  <!-- ======= BLOC RADIO ======= -->
  <section class="container section-radio">
    <div class="radio-card">
      <div class="radio-info">
        <span class="badge">Live</span>
        <h2>Radio Flux</h2>
        <p>Écoutez des webradios soigneusement sélectionnées ou explorez notre catalogue complet.</p>
        <Button variant="primary" href="#/radio">Ouvrir Radio Flux</Button>
      </div>
      <div class="radio-visual" aria-hidden="true">
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
      </div>
    </div>
  </section>
</div>

<style>
  /* ---- Hero ---- */
  .hero {
    position: relative;
    min-height: 520px;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-bottom: var(--space-2xl);
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 60% at 70% 50%, rgba(0,229,204,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 20% 80%, rgba(255,107,43,0.05) 0%, transparent 70%);
  }

  .hero-glow {
    position: absolute;
    top: -80px; right: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,204,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    padding: var(--space-2xl) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    max-width: 640px;
  }

  .hero-badge { align-self: flex-start; }

  .hero-title {
    font-size: clamp(var(--text-2xl), 5vw, var(--text-3xl));
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }
  .hero-title .neon { color: var(--accent-neon); }

  .hero-sub {
    font-size: var(--text-md);
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: nowrap;
  }

  /* ── Bouton "Me Surprendre" (natif, harmonisé avec Button.svelte) ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-base);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
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
  .btn:active { transform: scale(0.97); }
  .btn--lg {
    font-size: var(--text-md);
    padding: var(--space-md) var(--space-2xl);
    border-radius: var(--radius-lg);
  }
  .btn--compact { padding-left: var(--space-lg); padding-right: var(--space-lg); }

  .btn--surprise {
    background: var(--accent-orange);
    color: var(--bg-primary);
  }
  .btn--surprise:hover {
    background: #ff7722;
    box-shadow: 0 0 24px var(--accent-orange-glow);
  }

  /* ── Dé 3D animé ─────────────────────────────────────────────────────── */
  .dice-wrap {
    perspective: 60px;
    display: inline-block;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
  .dice-cube {
    display: inline-block;
    width: 22px;
    height: 22px;
    position: relative;
    transform-style: preserve-3d;
    animation: dice-spin 4s linear infinite;
  }
  .dice-face {
    position: absolute;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    line-height: 1;
    backface-visibility: visible;
    animation: dice-color 3s ease-in-out infinite;
  }
  .dice-front  { transform: translateZ(11px); animation: none; filter: invert(1) drop-shadow(0 0 5px rgba(255,255,255,0.95)); }
  .dice-back   { transform: rotateY(180deg) translateZ(11px); }
  .dice-right  { transform: rotateY(90deg)  translateZ(11px); }
  .dice-left   { transform: rotateY(-90deg) translateZ(11px); }
  .dice-top    { transform: rotateX(90deg)  translateZ(11px); }
  .dice-bottom { transform: rotateX(-90deg) translateZ(11px); }

  @keyframes dice-spin {
    0%   { transform: rotateX(0deg)   rotateY(0deg); }
    25%  { transform: rotateX(90deg)  rotateY(-90deg); }
    50%  { transform: rotateX(180deg) rotateY(-180deg); }
    75%  { transform: rotateX(270deg) rotateY(-270deg); }
    100% { transform: rotateX(360deg) rotateY(-360deg); }
  }
  @keyframes dice-color {
    0%   { filter: invert(1) drop-shadow(0 0 5px rgba(124,58,237,1)); }
    50%  { filter: invert(1) drop-shadow(0 0 5px rgba(0,229,204,1)); }
    100% { filter: invert(1) drop-shadow(0 0 5px rgba(124,58,237,1)); }
  }

  /* ---- Radar des Sorties ---- */
  .section-radar { margin-bottom: var(--space-2xl); }

  .section-sub {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-top: 4px;
  }

  /* Boutons nav slider */
  .slider-nav {
    display: flex;
    gap: var(--space-sm);
    flex-shrink: 0;
  }
  .slider-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    line-height: 1;
    padding: 0;
  }
  .slider-btn:hover {
    background: rgba(0,229,204,0.08);
    border-color: var(--accent-neon);
    color: var(--accent-neon);
  }

  /* Slider horizontal */
  .slider {
    display: flex;
    align-items: flex-start; /* chaque card garde sa hauteur naturelle */
    gap: var(--space-md);
    overflow-x: auto;
    /* scroll-snap retiré : incompatible avec le scroll RAF pixel par pixel */
    scroll-padding-left: 0;
    padding-bottom: var(--space-sm);  /* espace pour la scrollbar */
    /* Masque la scrollbar tout en gardant le scroll fonctionnel */
    scrollbar-width: none;
  }
  .slider::-webkit-scrollbar { display: none; }

  .slider-item {
    flex: 0 0 280px;
    /* scroll-snap-align retiré avec scroll-snap-type */
  }

  /* ---- Section clips ---- */
  .section-clips { margin-bottom: var(--space-2xl); }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  /* ---- Bloc radio ---- */
  .section-radio { margin-bottom: var(--space-2xl); }

  .radio-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xl);
    background: var(--bg-card);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-xl);
    padding: var(--space-xl) var(--space-2xl);
    box-shadow: 0 0 40px var(--accent-neon-glow);
    overflow: hidden;
  }

  .radio-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-width: 500px;
  }
  .radio-info h2 { font-size: var(--text-2xl); font-weight: 900; color: var(--text-primary); }
  .radio-info p  { color: var(--text-secondary); line-height: 1.6; }

  .radio-visual {
    display: flex;
    align-items: flex-end;
    gap: 5px;
    height: 60px;
    flex-shrink: 0;
  }
  .wave-bar {
    width: 6px;
    background: var(--accent-neon);
    border-radius: var(--radius-full);
    animation: wave 1.2s ease-in-out infinite;
    opacity: 0.8;
  }
  .wave-bar:nth-child(1) { animation-delay: 0s;    height: 30%; }
  .wave-bar:nth-child(2) { animation-delay: 0.15s; height: 70%; }
  .wave-bar:nth-child(3) { animation-delay: 0.3s;  height: 100%; background: var(--accent-orange); }
  .wave-bar:nth-child(4) { animation-delay: 0.45s; height: 60%; }
  .wave-bar:nth-child(5) { animation-delay: 0.6s;  height: 40%; }

  @keyframes wave {
    0%, 100% { transform: scaleY(1); }
    50%       { transform: scaleY(0.3); }
  }

  @media (max-width: 768px) {
    .radio-visual { display: none; }
    .radio-card   { flex-direction: column; padding: var(--space-xl); }
    .hero-actions { flex-wrap: wrap; }
    /* Cards plus étroites sur mobile pour voir le suivant */
    .slider-item  { flex: 0 0 240px; }
  }
</style>
