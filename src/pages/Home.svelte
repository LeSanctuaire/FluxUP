<script>
  import CardClip from '../components/CardClip.svelte';
  import Button from '../components/Button.svelte';
  import { getFeaturedClips, getRecentClips, allClips } from '../services/localClips.js';
  import { getTop } from '../services/votesAPI.js';
  import { surpriseStore } from '../core/surpriseStore.svelte.js';
  import { CURATED_STATIONS } from '../services/radioAPI.js';
  import { player } from '../core/player.svelte.js';
  import { allBeats } from '../services/localBeats.js';
  import { fetchClassiquesRapFR } from '../services/localClassiques.js';
  import { classiquesStore } from '../core/classiquesStore.svelte.js';

  const recentClips = getRecentClips(12);

  // ── Classiques Rap FR — chargés depuis la playlist YouTube ──────────────
  /** @type {import('../services/localClassiques.js').ClassiqueClip[]} */
  let classiquesRapFR = $state([]);
  fetchClassiquesRapFR(25).then(clips => { classiquesRapFR = clips; }).catch(() => {});

  // ── En Vedette : clips les plus votés (fallback → featured si pas encore de votes) ──
  let featuredClips = $state(getFeaturedClips(12));

  $effect(() => {
    getTop(12).then(apiScores => {
      if (!apiScores.length) return; // pas encore de votes → garder les featured
      const scoreMap = new Map(apiScores.map(s => [s.youtube_id, s.vote_count]));
      featuredClips = allClips
        .map(c => ({ ...c, votes: scoreMap.get(c.youtubeId) ?? 0 }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 12);
    });
  });

  /* ── Radios vedette (bloc home) — sélection curation FluxUP ─────────── */
  const homeRadios = CURATED_STATIONS.slice(0, 9);

  /** Joue une station dans le player global */
  function playStation(/** @type {import('../services/radioAPI.js').Station} */ station) {
    player.play({
      id:        station.stationuuid,
      title:     station.name,
      artist:    [station.country, station.tags].filter(Boolean).join(' · '),
      src:       station.url_resolved,
      thumbnail: station.favicon || null,
      isRadio:   true,
      meta:      station,
    });
  }

  let activeStationId = $derived(player.isRadio ? player.currentTrack?.id : null);

  const CARD_STEP = 216;   // 200px card + ~16px gap
  const SPEED    = 0.6;    // px/frame → ~36px/s à 60fps

  /* ── Slider "Radar des Sorties" ─────────────────────────────────────── */
  /** @type {HTMLElement | null} */
  let sliderEl = $state(null);
  let isPaused = $state(false);
  let rafId = 0;
  let manualScrolling = false;

  function tick() {
    if (sliderEl && !isPaused && !manualScrolling) {
      const max = sliderEl.scrollWidth - sliderEl.clientWidth;
      if (sliderEl.scrollLeft >= max - 1) sliderEl.scrollLeft = 0;
      else sliderEl.scrollLeft += SPEED;
    }
    rafId = requestAnimationFrame(tick);
  }

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

  /* ── Slider "Beats Only" ────────────────────────────────────────────── */
  // Sélection aléatoire de 12 beats pour la vitrine home
  const homeBeats = [...allBeats].sort(() => Math.random() - 0.5).slice(0, 12);

  /** @type {HTMLElement | null} */
  let beatsSliderEl = $state(null);
  let isPausedBeats = $state(false);
  let rafIdBeats = 0;
  let manualScrollingBeats = false;

  function tickBeats() {
    if (beatsSliderEl && !isPausedBeats && !manualScrollingBeats) {
      const max = beatsSliderEl.scrollWidth - beatsSliderEl.clientWidth;
      if (beatsSliderEl.scrollLeft >= max - 1) beatsSliderEl.scrollLeft = 0;
      else beatsSliderEl.scrollLeft += SPEED;
    }
    rafIdBeats = requestAnimationFrame(tickBeats);
  }

  function slideByBeats(/** @type {number} */ direction) {
    if (!beatsSliderEl) return;
    manualScrollingBeats = true;
    const max    = beatsSliderEl.scrollWidth - beatsSliderEl.clientWidth;
    const target = Math.max(0, Math.min(beatsSliderEl.scrollLeft + direction * CARD_STEP * 3, max));
    beatsSliderEl.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(() => { manualScrollingBeats = false; }, 650);
  }

  $effect(() => {
    if (!beatsSliderEl) return;
    rafIdBeats = requestAnimationFrame(tickBeats);
    return () => cancelAnimationFrame(rafIdBeats);
  });

  /* ── Slider "En Vedette" ─────────────────────────────────────────────── */
  /** @type {HTMLElement | null} */
  let featuredSliderEl = $state(null);
  let isPausedFeatured = $state(false);
  let rafIdFeatured = 0;
  let manualScrollingFeatured = false;

  function tickFeatured() {
    if (featuredSliderEl && !isPausedFeatured && !manualScrollingFeatured) {
      const max = featuredSliderEl.scrollWidth - featuredSliderEl.clientWidth;
      if (featuredSliderEl.scrollLeft >= max - 1) featuredSliderEl.scrollLeft = 0;
      else featuredSliderEl.scrollLeft += SPEED;
    }
    rafIdFeatured = requestAnimationFrame(tickFeatured);
  }

  function slideByFeatured(/** @type {number} */ direction) {
    if (!featuredSliderEl) return;
    manualScrollingFeatured = true;
    const max    = featuredSliderEl.scrollWidth - featuredSliderEl.clientWidth;
    const target = Math.max(0, Math.min(featuredSliderEl.scrollLeft + direction * CARD_STEP * 3, max));
    featuredSliderEl.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(() => { manualScrollingFeatured = false; }, 650);
  }

  $effect(() => {
    if (!featuredSliderEl) return;
    rafIdFeatured = requestAnimationFrame(tickFeatured);
    return () => cancelAnimationFrame(rafIdFeatured);
  });

  /* ── Slider "Classiques Rap FR" ─────────────────────────────────────── */
  /** @type {HTMLElement | null} */
  let classiquesSliderEl = $state(null);
  let isPausedClassiques = $state(false);
  let rafIdClassiques = 0;
  let manualScrollingClassiques = false;

  function tickClassiques() {
    if (classiquesSliderEl && !isPausedClassiques && !manualScrollingClassiques) {
      const max = classiquesSliderEl.scrollWidth - classiquesSliderEl.clientWidth;
      if (classiquesSliderEl.scrollLeft >= max - 1) classiquesSliderEl.scrollLeft = 0;
      else classiquesSliderEl.scrollLeft += SPEED;
    }
    rafIdClassiques = requestAnimationFrame(tickClassiques);
  }

  function slideByClassiques(/** @type {number} */ direction) {
    if (!classiquesSliderEl) return;
    manualScrollingClassiques = true;
    const max    = classiquesSliderEl.scrollWidth - classiquesSliderEl.clientWidth;
    const target = Math.max(0, Math.min(classiquesSliderEl.scrollLeft + direction * CARD_STEP * 3, max));
    classiquesSliderEl.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(() => { manualScrollingClassiques = false; }, 650);
  }

  $effect(() => {
    if (!classiquesSliderEl) return;
    rafIdClassiques = requestAnimationFrame(tickClassiques);
    return () => cancelAnimationFrame(rafIdClassiques);
  });
</script>

<div class="page fade-in">
  <!-- ======= HERO ======= -->
  <section class="hero">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="container hero-content">
      <h1 class="hero-title">
        Découvrez la <span class="neon neon-musique"><em>musique</em></span><br />
        autrement.
      </h1>
      <p class="hero-sub">
        Clips, radios et playlists en un seul endroit.
      </p>
      <div class="hero-actions">
        <Button size="lg" variant="teal" href="#/clips">Explorer les clips</Button>

        <!-- Bouton Beats Only → jaune beats -->
        <a class="btn btn--beats btn--lg" href="#/beats">Beats Only</a>

        <!-- Bouton Me Surprendre → accent orange + dé 3D animé -->
        <button class="btn btn--surprise btn--lg" type="button"
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

        <!-- Bouton Radio → colonne centrale, ligne 2 -->
        <a class="btn btn--radio btn--lg" href="#/radio">Radios en direct</a>
      </div>
    </div>
    <div class="hero-glow" aria-hidden="true"></div>
  </section>

  <!-- ======= RADAR DES SORTIES ======= -->
  <section id="radar-sorties" class="container container--wide section-radar">
    <span class="badge radar-badge">Nouveau · FluxUP</span>
    <div class="section-header">
      <div>
        <h2 class="section-title">Radar des <span class="neon">Sorties</span></h2>
        <p class="section-sub">Les dernières sorties à ne pas manquer</p>
      </div>
      <div class="slider-nav">
        <button class="slider-btn" onclick={() => slideBy(-1)} aria-label="Précédent">‹</button>
        <button class="slider-btn" onclick={() => slideBy(1)}  aria-label="Suivant">›</button>
        <Button variant="teal-ghost" size="sm" href="#/clips">Voir tout →</Button>
      </div>
    </div>

    <div class="slider" bind:this={sliderEl} role="region" aria-label="Slider clips récents"
      onmouseenter={() => isPaused = true}
      onmouseleave={() => isPaused = false}
      ontouchstart={() => isPaused = true}
      ontouchend={() => { isPaused = false; }}
    >
      {#each recentClips as clip, i}
        <div class="slider-item">
          <CardClip {clip} eager={i === 0} />
        </div>
      {/each}
    </div>
  </section>

  <!-- ======= CLIPS EN VEDETTE ======= -->
  <section class="container container--wide section-clips">
    <span class="badge vedette-badge">Top Votes · FluxUP</span>
    <div class="section-header">
      <div>
        <h2 class="section-title">En <span class="neon">Vedette</span></h2>
        <p class="section-sub">Les clips incontournables du moment</p>
      </div>
      <div class="slider-nav">
        <button class="slider-btn" onclick={() => slideByFeatured(-1)} aria-label="Précédent">‹</button>
        <button class="slider-btn" onclick={() => slideByFeatured(1)}  aria-label="Suivant">›</button>
        <Button variant="teal-ghost" size="sm" href="#/clips?sort=votes">Voir tout →</Button>
      </div>
    </div>

    <div class="slider" bind:this={featuredSliderEl} role="region" aria-label="Slider clips en vedette"
      onmouseenter={() => isPausedFeatured = true}
      onmouseleave={() => isPausedFeatured = false}
      ontouchstart={() => isPausedFeatured = true}
      ontouchend={() => { isPausedFeatured = false; }}
    >
      {#each featuredClips as clip}
        <div class="slider-item">
          <CardClip {clip} />
        </div>
      {/each}
    </div>
  </section>

  <!-- ======= BEATS ONLY ======= -->
  <section class="container container--wide section-beats">
    <span class="badge beats-badge">Beats Only</span>
    <div class="section-header">
      <div>
        <h2 class="section-title beats-title">Beats – <span class="beats-neon">Instrumentales</span></h2>
        <p class="section-sub">Les instrumentaux incontournables pour votre prochaine session</p>
      </div>
      <div class="slider-nav">
        <button class="slider-btn beats-slider-btn" onclick={() => slideByBeats(-1)} aria-label="Précédent">‹</button>
        <button class="slider-btn beats-slider-btn" onclick={() => slideByBeats(1)}  aria-label="Suivant">›</button>
        <a class="btn btn--beats-ghost btn--sm" href="#/beats">Voir tout →</a>
      </div>
    </div>

    <div class="slider" bind:this={beatsSliderEl} role="region" aria-label="Slider beats"
      onmouseenter={() => isPausedBeats = true}
      onmouseleave={() => isPausedBeats = false}
      ontouchstart={() => isPausedBeats = true}
      ontouchend={() => { isPausedBeats = false; }}
    >
      {#each homeBeats as beat}
        <div class="slider-item">
          <a class="beat-card" href="#/beats/{beat.youtubeId}" aria-label="Écouter {beat.title}">
            <div class="beat-card__thumb">
              <img src={beat.thumbnail} alt={beat.title} loading="lazy" />
              <span class="beat-card__play" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="#F5C400" stroke-width="1.5" fill="rgba(0,0,0,0.6)"/>
                  <path d="M13 10.5l10 5.5-10 5.5z" fill="#F5C400"/>
                </svg>
              </span>
            </div>
            <div class="beat-card__info">
              <p class="beat-card__title">{beat.title}</p>
              {#if beat.artist}
                <p class="beat-card__artist">{beat.artist}</p>
              {/if}
            </div>
          </a>
        </div>
      {/each}
    </div>
  </section>

  <!-- ======= CLASSIQUES RAP FRANÇAIS ======= -->
  <section class="container container--wide section-classiques">
    <span class="badge classiques-badge">Classiques · Rap FR</span>
    <div class="section-header">
      <div>
        <h2 class="section-title classiques-title">Classiques <span class="classiques-neon">Rap Français</span></h2>
        <p class="section-sub">Les sons qui ont marqué plus d'une génération</p>
      </div>
      <div class="slider-nav">
        <button class="slider-btn classiques-slider-btn" onclick={() => slideByClassiques(-1)} aria-label="Précédent">‹</button>
        <button class="slider-btn classiques-slider-btn" onclick={() => slideByClassiques(1)}  aria-label="Suivant">›</button>
        <a class="btn btn--classiques-ghost btn--sm" href="#/classiques-rap-fr">Voir tout →</a>
      </div>
    </div>

    <div class="slider" bind:this={classiquesSliderEl} role="region" aria-label="Slider classiques rap français"
      onmouseenter={() => isPausedClassiques = true}
      onmouseleave={() => isPausedClassiques = false}
      ontouchstart={() => isPausedClassiques = true}
      ontouchend={() => { isPausedClassiques = false; }}
    >
      {#each classiquesRapFR as clip}
        <div class="slider-item">
          <button class="classique-card" aria-label="Écouter {clip.title}"
            onclick={() => { classiquesStore.requestedVideoId = clip.youtubeId; location.hash = '/classiques-rap-fr'; }}>
            <div class="classique-card__thumb">
              <img src={clip.thumbnail} alt={clip.title} loading="lazy" />
              <span class="classique-card__play" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="#1e6fff" stroke-width="1.5" fill="rgba(0,0,0,0.6)"/>
                  <path d="M13 10.5l10 5.5-10 5.5z" fill="#00b4ff"/>
                </svg>
              </span>
            </div>
            <div class="classique-card__info">
              <p class="classique-card__title">{clip.title}</p>
              <p class="classique-card__artist">{clip.artist}</p>
            </div>
          </button>
        </div>
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
        <a class="btn btn--radio-flux btn--lg" href="#/radio">Ouvrir Radio Flux</a>
      </div>

      <!-- Grille 3×3 vignettes rondes -->
      <div class="radio-thumbs" aria-label="Radios en vedette">
        {#each homeRadios.slice(0, 9) as station}
          <button
            class="radio-thumb"
            class:playing={activeStationId === station.stationuuid}
            title={station.name}
            aria-label={`Écouter ${station.name}`}
            onclick={() => playStation(station)}
          >
            {#if station.favicon}
              <img src={station.favicon} alt={station.name} loading="lazy"
                onerror={(e) => { const img = /** @type {HTMLImageElement} */ (e.target); img.style.display='none'; const fb = img.parentElement?.querySelector('.thumb-fallback'); if (fb) /** @type {HTMLElement} */ (fb).style.display='flex'; }} />
              <span class="thumb-fallback" aria-hidden="true" style="display:none">📻</span>
            {:else}
              <span class="thumb-fallback" aria-hidden="true">📻</span>
            {/if}
            {#if activeStationId === station.stationuuid}
              <span class="thumb-playing-dot" aria-hidden="true"></span>
            {/if}
          </button>
        {/each}
        <!-- Squelettes pendant le chargement -->
        {#if homeRadios.length === 0}
          {#each Array(9) as _}
            <div class="radio-thumb thumb-skeleton"></div>
          {/each}
        {/if}
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
      radial-gradient(ellipse 60% 60% at 70% 50%, rgba(245,196,0,0.04) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 20% 80%, rgba(200,99,26,0.03) 0%, transparent 70%);
  }

  .hero-glow {
    position: absolute;
    top: -80px; right: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,196,0,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    padding: var(--space-2xl) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-lg);
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
  }

  .radar-badge { margin-bottom: var(--space-sm); }

  .hero-title {
    font-size: clamp(var(--text-2xl), 5vw, var(--text-3xl));
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }
  .hero-title .neon {
    color: #F5C400;
    display: inline-block;
    animation: glitch-multicolor 7s linear infinite;
    animation-delay: -3s;
  }
  /* Scintillement néon rouge sur "musique" toutes les 19s */
  .hero-title .neon.neon-musique {
    color: #888;
    animation: glitch-multicolor 7s linear infinite, musique-flicker 19s ease-in-out infinite;
    animation-delay: -3s, 4s;
  }
  @keyframes musique-flicker {
    0%, 88%, 100% {
      color: #888;
      text-shadow: none;
      opacity: 1;
    }
    /* Flash 1 — coupure sèche */
    88.3% {
      color: #ff2020;
      text-shadow: 0 0 14px rgba(255, 30, 30, 1), 0 0 28px rgba(255, 30, 30, 0.5);
      opacity: 0.15;
    }
    88.6% {
      color: #ff2020;
      text-shadow: 0 0 12px rgba(255, 30, 30, 0.9);
      opacity: 1;
    }
    /* Flash 2 — coupure sèche */
    88.9% {
      color: #ff2020;
      text-shadow: none;
      opacity: 0.1;
    }
    89.2% {
      color: #ff2020;
      text-shadow: 0 0 16px rgba(255, 30, 30, 1), 0 0 32px rgba(255, 30, 30, 0.6);
      opacity: 1;
    }
    /* Retour gris */
    89.8% {
      color: #888;
      text-shadow: none;
      opacity: 1;
    }
  }

  @keyframes glitch-multicolor {

    /* ── REPOS : jaune pur ── */
    0%, 71% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }

    /* ── RAFALE 1 ~72% — flash orange dominant ── */
    72% {
      color: var(--accent-orange);
      text-shadow: -2px 0 var(--accent-orange), 2px 0 rgba(255,85,0,0.30);
      transform: translateX(2px) skewX(-1deg);
    }
    72.5% {
      color: #F5C400;
      text-shadow: 2px 0 var(--accent-orange), -1px 0 rgba(255,85,0,0.20);
      transform: translateX(-1px) skewX(0.5deg);
    }
    73% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }

    /* ── REPOS ── */
    84% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }

    /* ── RAFALE 2 ~85% — flash orange / cyan ── */
    85% {
      color: var(--accent-orange);
      text-shadow: 3px 0 var(--accent-orange), -2px 0 rgba(255,85,0,0.25);
      transform: translateX(-2px) skewX(1deg);
    }
    85.5% {
      color: #F5C400;
      text-shadow: -3px 0 var(--accent-orange), 1px 0 var(--accent-orange-glow);
      transform: translateX(1px);
    }
    86% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }

    /* ── REPOS ── */
    93% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }

    /* ── RAFALE 3 ~94% — triplet orange / blanc / orange ── */
    94% {
      color: var(--accent-orange);
      text-shadow: -1px 0 rgba(255,255,255,0.6), 2px 0 var(--accent-orange);
      transform: translateX(1px) skewX(-0.5deg);
    }
    94.4% {
      color: #F5C400;
      text-shadow: 2px 0 var(--accent-orange);
      transform: translateX(-1px);
    }
    94.8% {
      color: var(--accent-orange);
      text-shadow: -2px 0 var(--accent-orange);
      transform: none;
    }
    95.2% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }

    /* ── Retour repos jusqu'à la fin ── */
    100% {
      color: #F5C400;
      text-shadow: none;
      transform: none;
    }
  }

  .hero-sub {
    font-size: var(--text-md);
    color: var(--text-secondary);
    line-height: 1.7;
  }

  /* ── Grille 3 colonnes centrée sous le texte ── */
  .hero-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 172px));
    gap: var(--space-md);
    justify-content: center;
  }

  /* Bouton Radio → colonne 2, centré */
  .hero-actions > .btn--radio {
    grid-column: 2;
    justify-self: stretch;
  }

  /* Texte blanc au survol pour le bouton primary (Explorer les clips) */
  .hero-actions :global(.btn--primary:hover) { color: #fff; }

  @media (max-width: 768px) {
    .hero-actions {
      grid-template-columns: 1fr;
      max-width: 280px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero-actions > .btn--radio { grid-column: 1; justify-self: stretch; }
  }

  /* ── Boutons natifs (beats, surprise) harmonisés avec Button.svelte ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-decoration: none;
    transition:
      background       200ms cubic-bezier(0.4, 0, 0.2, 1),
      color            200ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow       200ms cubic-bezier(0.4, 0, 0.2, 1),
      transform        200ms cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    user-select: none;
  }
  .btn:hover  { transform: translateY(-2px); }
  .btn:active { transform: translateY(0) scale(0.97); }
  .btn--lg {
    font-size: var(--text-md);
    padding: var(--space-md) var(--space-2xl);
    border-radius: var(--radius-lg);
  }

  .btn--radio {
    background: transparent;
    color: #ff4444;
    border: 1px solid var(--border);
    text-decoration: none;
    box-shadow: 0 0 7px rgba(255, 40, 40, 0.30), 0 0 2px rgba(255, 40, 40, 0.15);
    animation: radio-neon-flicker 8s ease-in-out infinite;
  }
  .btn--radio:hover {
    background: rgba(255, 40, 40, 0.08);
    border-color: rgba(255, 40, 40, 0.55);
    color: #fff;
    box-shadow: 0 4px 20px rgba(255, 40, 40, 0.25);
    animation: none;
  }

  @keyframes radio-neon-flicker {
    /* Pendant 80% du temps : lueur stable */
    0%, 79%, 100% {
      box-shadow: 0 0 7px rgba(255, 40, 40, 0.30), 0 0 2px rgba(255, 40, 40, 0.15);
      opacity: 1;
    }
    /* Premier saut : extinction rapide */
    80% {
      box-shadow: none;
      opacity: 0.35;
    }
    /* Retour */
    81.5% {
      box-shadow: 0 0 9px rgba(255, 40, 40, 0.55), 0 0 2px rgba(255, 40, 40, 0.2);
      opacity: 1;
    }
    /* Deuxième saut plus court */
    83% {
      box-shadow: none;
      opacity: 0.25;
    }
    /* Retour final */
    84.5% {
      box-shadow: 0 0 7px rgba(255, 40, 40, 0.30), 0 0 2px rgba(255, 40, 40, 0.15);
      opacity: 1;
    }
  }

  @media (max-width: 600px) {
    .btn--radio {
      background: rgba(255, 40, 40, 0.08);
      border-color: rgba(255, 40, 40, 0.55);
      color: #ff4444;
      box-shadow: 0 4px 20px rgba(255, 40, 40, 0.25);
    }
  }

  .btn--beats {
    background: #F5C400;
    color: #0a0a0f;
    text-decoration: none;
  }
  .btn--beats:hover {
    background: #2a2a2a;
    color: #F5C400;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.40);
  }

  .btn--radio-flux {
    background: #1e1e26;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    text-decoration: none;
    transition: background var(--transition-base), color var(--transition-base),
                border-color var(--transition-base), box-shadow var(--transition-base);
  }
  .btn--radio-flux:hover {
    background: #2a2a2a;
    color: #fff;
    border-color: #9D00FF;
    box-shadow: 0 4px 24px rgba(157, 0, 255, 0.28);
  }

  .btn--surprise {
    background: #FF6B00;
    color: #080808;
  }
  .btn--surprise:hover {
    background: #2a2a2a;
    color: var(--accent-orange);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.40);
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
    0%   { filter: invert(1) drop-shadow(0 0 5px rgba(245,196,0,0.8)); }
    50%  { filter: invert(1) drop-shadow(0 0 7px rgba(245,196,0,1)); }
    100% { filter: invert(1) drop-shadow(0 0 5px rgba(245,196,0,0.8)); }
  }

  /* ---- Radar des Sorties ---- */
  .section-radar { margin-bottom: var(--space-2xl); }
  .section-radar :global(.card-artist) { color: var(--accent-teal); }
  .section-radar :global(.card-clip) { --card-play-color: var(--accent-teal); }

  /* ---- Clips en Vedette ---- */
  .section-clips :global(.card-artist) { color: var(--accent-teal); }
  .section-clips :global(.card-clip) { --card-play-color: var(--accent-neon); }

  /* Container élargi pour les sliders */
  .container--wide { max-width: 1600px; }

  .section-sub {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-top: 4px;
    white-space: nowrap;
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
    background: rgba(245,196,0,0.08);
    border-color: var(--accent-neon);
    color: var(--accent-neon);
  }

  /* Slider horizontal — pleine largeur */
  .slider {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    overflow-x: auto;
    scroll-padding-left: 0;
    padding-bottom: var(--space-sm);  /* espace pour la scrollbar */
    /* Padding latéral aligné sur le container pour un départ propre */
    scrollbar-width: none;
  }
  .slider::-webkit-scrollbar { display: none; }

  .slider-item {
    flex: 0 0 200px;
    min-width: 0; /* empêche le flex item de dépasser 200px à cause du contenu long */
    max-width: 200px;
  }

  /* ---- Section clips ---- */
  .section-clips { margin-bottom: var(--space-2xl); }

  .vedette-badge {
    background: rgba(0, 200, 180, 0.10);
    color: var(--accent-teal);
    border: 1px solid rgba(0, 200, 180, 0.28);
    margin-bottom: var(--space-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  /* ---- Section Beats Only ---- */
  .section-beats { margin-bottom: var(--space-2xl); }

  .beats-badge {
    background: rgba(245, 196, 0, 0.12);
    color: #F5C400;
    border: 1px solid rgba(245, 196, 0, 0.30);
    margin-bottom: var(--space-sm);
  }

  .beats-title { color: var(--text-primary); }
  .beats-neon {
    color: #F5C400;
    text-shadow: 0 0 18px rgba(245, 196, 0, 0.55);
  }

  .beats-slider-btn:hover {
    background: rgba(245, 196, 0, 0.10);
    border-color: #F5C400;
    color: #F5C400;
  }

  /* Bouton "Voir tout" ghost jaune */
  .btn--beats-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(245, 196, 0, 0.35);
    color: #F5C400;
    background: transparent;
    text-decoration: none;
    white-space: nowrap;
    transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .btn--beats-ghost:hover {
    background: rgba(245, 196, 0, 0.10);
    border-color: #F5C400;
    color: #fff;
    box-shadow: 0 0 18px rgba(245, 196, 0, 0.35);
  }

  /* Cards beats */
  .beat-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-decoration: none;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid rgba(245, 196, 0, 0.12);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }
  .beat-card:hover {
    border-color: rgba(245, 196, 0, 0.45);
    box-shadow: 0 0 20px rgba(245, 196, 0, 0.18);
    transform: translateY(-3px);
  }

  .beat-card__thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #111;
  }
  .beat-card__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 300ms ease;
  }
  .beat-card:hover .beat-card__thumb img { transform: scale(1.05); }

  .beat-card__play {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 200ms ease;
  }
  .beat-card:hover .beat-card__play { opacity: 1; }

  .beat-card__info {
    padding: 8px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .beat-card__title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }
  .beat-card__artist {
    font-size: var(--text-xs);
    color: #F5C400;
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }

  /* ---- Section Classiques Rap FR ---- */
  .section-classiques { margin-bottom: var(--space-2xl); }

  .classiques-badge {
    background: rgba(0, 100, 255, 0.12);
    color: #00b4ff;
    border: 1px solid rgba(0, 100, 255, 0.30);
    margin-bottom: var(--space-sm);
  }

  .classiques-title { color: var(--text-primary); }
  .classiques-neon {
    color: #00b4ff;
    text-shadow: 0 0 18px rgba(0, 180, 255, 0.55);
  }

  .classiques-slider-btn:hover {
    background: rgba(0, 100, 255, 0.10);
    border-color: #1e6fff;
    color: #00b4ff;
  }

  /* Bouton "Voir tout" ghost bleu */
  .btn--classiques-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(0, 100, 255, 0.35);
    color: #00b4ff;
    background: transparent;
    text-decoration: none;
    white-space: nowrap;
    transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .btn--classiques-ghost:hover {
    background: rgba(0, 100, 255, 0.10);
    border-color: #1e6fff;
    color: #fff;
    box-shadow: 0 0 18px rgba(0, 180, 255, 0.35);
  }

  /* Cards classiques */
  .classique-card {
    display: flex;
    flex-direction: column;
    width: 100%; /* requis : le button ne prend pas la largeur du flex parent sans ça */
    gap: 8px;
    text-decoration: none;
    font-family: inherit;
    padding: 0;
    cursor: pointer;
    width: 100%;
    text-align: left;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid rgba(0, 100, 255, 0.14);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }
  .classique-card:hover {
    border-color: rgba(0, 180, 255, 0.50);
    box-shadow: 0 0 20px rgba(0, 180, 255, 0.18);
    transform: translateY(-3px);
  }

  .classique-card__thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #050d20;
  }
  .classique-card__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 300ms ease;
  }
  .classique-card:hover .classique-card__thumb img { transform: scale(1.05); }

  .classique-card__play {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 200ms ease;
  }
  .classique-card:hover .classique-card__play { opacity: 1; }

  .classique-card__info {
    padding: 8px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .classique-card__title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }
  .classique-card__artist {
    font-size: var(--text-xs);
    color: #00b4ff;
    opacity: 0.80;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }

  /* ---- Bloc radio ---- */
  .section-radio { margin-bottom: var(--space-2xl); }

  /* Badge "Live" en rouge dans la radio-card */
  .radio-info :global(.badge) {
    background: rgba(255, 40, 40, 0.18);
    color: #ff4444;
    border: 1px solid rgba(255, 40, 40, 0.35);
  }

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

  /* ---- Vignettes radios 3×3 ---- */
  .radio-thumbs {
    display: grid;
    grid-template-columns: repeat(3, 38px);
    grid-template-rows: repeat(3, 38px);
    gap: 20px;
    flex-shrink: 0;
  }

  .radio-thumb {
    width: 38px; height: 38px;
    border-radius: var(--radius-full);
    border: 2px solid var(--border);
    background: var(--bg-card);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    position: relative;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }
  .radio-thumb:hover {
    border-color: var(--accent-neon);
    box-shadow: 0 0 10px var(--accent-neon-glow);
    transform: scale(1.08);
  }
  .radio-thumb.playing {
    border-color: var(--accent-orange);
    box-shadow: 0 0 12px var(--accent-orange-glow);
  }
  .radio-thumb img {
    width: 100%; height: 100%;
    object-fit: cover;
    border-radius: var(--radius-full);
  }
  .thumb-fallback {
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%; height: 100%;
  }
  /* Point animé "en lecture" */
  .thumb-playing-dot {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 10px; height: 10px;
    border-radius: var(--radius-full);
    background: var(--accent-orange);
    box-shadow: 0 0 6px var(--accent-orange-glow);
    animation: pulse-dot 1.2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }

  /* Squelette pendant le chargement */
  .thumb-skeleton {
    background: linear-gradient(90deg, var(--bg-card) 25%, rgba(255,255,255,0.04) 50%, var(--bg-card) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    cursor: default;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (max-width: 768px) {
    .radio-visual  { display: none; }
    .radio-thumbs  { grid-template-columns: repeat(3, 34px); grid-template-rows: repeat(3, 34px); }
    .radio-thumb   { width: 34px; height: 34px; }
    .radio-card    { flex-direction: column; padding: var(--space-xl); }
    .hero-actions  { flex-wrap: wrap; }
    /* Cards plus étroites sur mobile pour voir le suivant */
    .slider-item   { flex: 0 0 160px; }
    .slider        { padding-left: var(--space-md); padding-right: var(--space-md); }
    /* Empêche le section-header de dépasser la largeur du viewport */
    .section-header { flex-wrap: wrap; gap: var(--space-sm); }
    .section-sub    { white-space: normal; }
  }
</style>
