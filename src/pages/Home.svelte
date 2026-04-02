<script>
  import CardClip from '../components/CardClip.svelte';
  import Button from '../components/Button.svelte';
  import { getFeaturedClips } from '../services/localClips.js';

  const featured = getFeaturedClips(6);
</script>

<div class="page fade-in">
  <!-- ======= HERO ======= -->
  <section class="hero">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="container hero-content">
      <span class="badge hero-badge">Nouveau · Sanctum Music</span>
      <h1 class="hero-title">
        Découvrez la <span class="neon">musique</span><br />
        autrement.
      </h1>
      <p class="hero-sub">
        Clips, radios et playlists en un seul endroit.<br />
        Dark. Fluide. Immersif.
      </p>
      <div class="hero-actions">
        <Button size="lg" variant="primary" href="#/clips">Explorer les clips</Button>
        <Button size="lg" variant="secondary" href="#/radio">Radios en direct</Button>
      </div>
    </div>
    <!-- Décoration néon -->
    <div class="hero-glow" aria-hidden="true"></div>
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
    gap: var(--space-md);
    flex-wrap: wrap;
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
  .radio-info h2 {
    font-size: var(--text-2xl);
    font-weight: 900;
    color: var(--text-primary);
  }
  .radio-info p { color: var(--text-secondary); line-height: 1.6; }

  /* Barres d'animation radio */
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
    .radio-card { flex-direction: column; padding: var(--space-xl); }
  }
</style>
