<script>
  /** @type {Array<{q: string, a: string, open: boolean}>} */
  let faqs = $state([
    {
      q: "Qu'est-ce que FluxUP ?",
      a: "FluxUP est une plateforme de découverte musicale indépendante. Clips, beats, webradios — tout ce qui pulse underground, ici en un seul endroit. Pas d'algorithme commercial. Juste de l'énergie brute, sélectionnée à la main.",
      open: false,
    },
    {
      q: "Comment sont sélectionnés les clips et beats ?",
      a: "Chaque contenu est choisi manuellement pour sa qualité, son authenticité et son énergie. On met en avant ce qui mérite d'être entendu — peu importe le nombre d'abonnés.",
      open: false,
    },
    {
      q: "Peut-on proposer son contenu ?",
      a: "Oui — une page dédiée \"Soumettre un artiste\" arrive très prochainement. En attendant, contacte-nous directement depuis la section contact.",
      open: false,
    },
    {
      q: "Est-ce gratuit ?",
      a: "Totalement. FluxUP est libre d'accès, sans inscription requise. L'objectif est de connecter les artistes et les auditeurs sans barrière.",
      open: false,
    },
    {
      q: "Comment fonctionne le classement et les votes ?",
      a: "Chaque utilisateur peut voter une fois par clip. Les clips les plus votés remontent dans le classement. Un vote = une voix réelle — sans manipulation.",
      open: false,
    },
    {
      q: "Peut-on utiliser les sons diffusés sur la plateforme ?",
      a: "Non. Tous les contenus appartiennent à leurs créateurs respectifs. FluxUP est une vitrine, pas une source de téléchargement. Contacte directement les artistes pour toute utilisation.",
      open: false,
    },
    {
      q: "Qui est derrière le projet ?",
      a: "FluxUP est un projet indépendant, né d'une passion pour la musique underground et le design digital. Une seule mission : donner de la visibilité à ceux qui le méritent.",
      open: false,
    },
  ]);

  /** @param {number} i */
  function toggle(i) {
    faqs[i].open = !faqs[i].open;
  }
</script>

<div class="page faq-page">

  <!-- ══ HERO ══════════════════════════════════════════════════════════════ -->
  <section class="faq-hero">
    <div class="container">
      <span class="faq-eyebrow">À propos & FAQ</span>
      <h1 class="faq-title">
        Écouter autrement.<br/>
        <span class="accent-neon">Découvrir vraiment.</span>
      </h1>
      <p class="faq-subtitle">
        Tout ce que tu dois savoir sur FluxUP — en clair, sans jargon.
      </p>
    </div>
  </section>

  <!-- ══ SÉPARATEUR ══════════════════════════════════════════════════════ -->
  <div class="section-divider"></div>

  <!-- ══ À PROPOS ════════════════════════════════════════════════════════ -->
  <section class="about-section">
    <div class="container about-grid">

      <div class="about-label">
        <span class="tag">Qui sommes-nous</span>
      </div>

      <div class="about-content">
        <h2 class="about-heading">
          Pensée pour révéler<br/>
          <span class="accent-neon">les talents.</span>
        </h2>
        <p class="about-text">
          FluxUP optimise la découverte musicale et l'impact des sorties
          grâce à des mécaniques communautaires et des données en temps réel.
          Clips, beats, webradios — chaque contenu est choisi pour ce qu'il dégage,
          diffusé dans un environnement pensé pour maximiser sa visibilité.
        </p>
        <p class="about-text">
          Une meilleure expérience musicale devient possible lorsque artistes et auditeurs
          disposent des bons outils pour explorer et valoriser les contenus.
          FluxUP réunit diffusion, interaction et sélection dans un seul flux —
          fluide, pertinent, engageant.
        </p>

        <div class="about-pillars">
          <div class="pillar">
            <span class="pillar-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,8 8,15 1,8"
                  fill="none" stroke="var(--accent-neon)" stroke-width="1.4"/>
                <circle cx="8" cy="8" r="2.5" fill="#F5C400"/>
              </svg>
            </span>
            <strong>Clips &amp; Beats</strong>
            <p>Sélection manuelle, qualité avant quantité</p>
          </div>
          <div class="pillar">
            <span class="pillar-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,8 8,15 1,8"
                  fill="none" stroke="var(--accent-neon)" stroke-width="1.4"/>
                <circle cx="8" cy="8" r="2.5" fill="#F5C400"/>
              </svg>
            </span>
            <strong>Webradios</strong>
            <p>Flux en direct, curatés par genre et ambiance</p>
          </div>
          <div class="pillar">
            <span class="pillar-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="8,1 15,8 8,15 1,8"
                  fill="none" stroke="var(--accent-neon)" stroke-width="1.4"/>
                <circle cx="8" cy="8" r="2.5" fill="#F5C400"/>
              </svg>
            </span>
            <strong>Classement</strong>
            <p>Voté par la communauté, sans triche</p>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ SÉPARATEUR ══════════════════════════════════════════════════════ -->
  <div class="section-divider"></div>

  <!-- ══ FAQ ════════════════════════════════════════════════════════════ -->
  <section class="faq-section">
    <div class="container">
      <h2 class="section-heading">Questions fréquentes</h2>

      <div class="faq-list" role="list">
        {#each faqs as item, i}
          <div class="faq-item" class:open={item.open} role="listitem">
            <button
              class="faq-question"
              onclick={() => toggle(i)}
              aria-expanded={item.open}
            >
              <span>{item.q}</span>
              <span class="faq-chevron" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
            {#if item.open}
              <div class="faq-answer">
                <p>{item.a}</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>

    </div>
  </section>

  <!-- ══ SÉPARATEUR ══════════════════════════════════════════════════════ -->
  <div class="section-divider"></div>

  <!-- ══ CTA CONTACT ════════════════════════════════════════════════════ -->
  <section class="cta-section">
    <div class="container cta-inner">
      <p class="cta-text">Une question pas dans la liste ?</p>
      <a href="mailto:contact@fluxup.fr" class="cta-btn">Nous contacter</a>
    </div>
  </section>

</div>

<style>
  /* ── Page wrapper ─────────────────────────────────────────────────────────*/
  .faq-page {
    min-height: 80vh;
    padding-bottom: var(--space-2xl);
  }

  /* ── Animations reveal ────────────────────────────────────────────────────*/
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .faq-hero    { animation: revealUp 0.55s ease both; }
  .about-section { animation: revealUp 0.55s 0.1s ease both; }
  .faq-section { animation: revealUp 0.55s 0.2s ease both; }
  .cta-section { animation: revealUp 0.55s 0.3s ease both; }

  /* ── Container ────────────────────────────────────────────────────────────*/
  .container {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 var(--space-xl);
  }

  /* ── Séparateur ───────────────────────────────────────────────────────────*/
  .section-divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--border-accent) 30%,
      rgba(255, 85, 0, 0.25) 70%,
      transparent 100%
    );
    margin: 0 var(--space-xl);
  }

  /* ══ HERO ══════════════════════════════════════════════════════════════════*/
  .faq-hero {
    padding: var(--space-2xl) 0 var(--space-xl);
    text-align: center;
  }

  .faq-eyebrow {
    display: inline-block;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent-neon);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-full);
    padding: 4px 14px;
    margin-bottom: var(--space-lg);
  }

  .faq-title {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 var(--space-md);
  }

  .accent-neon  { color: var(--accent-teal); }

  .faq-subtitle {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ══ À PROPOS ══════════════════════════════════════════════════════════════*/
  .about-section {
    padding: var(--space-2xl) 0;
  }

  .about-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-2xl);
    align-items: start;
  }

  .about-label { padding-top: 6px; }

  .tag {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    border-left: 2px solid var(--accent-orange);
    padding-left: var(--space-sm);
  }

  .about-heading {
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 900;
    line-height: 1.2;
    color: var(--text-primary);
    margin: 0 0 var(--space-lg);
  }

  .about-text {
    font-size: var(--text-md);
    color: var(--text-secondary);
    line-height: 1.75;
    margin: 0 0 var(--space-md);
  }

  .about-pillars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
    margin-top: var(--space-xl);
  }

  .pillar {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }
  .pillar:hover {
    border-color: rgba(245, 196, 0, 0.55);
    box-shadow: 0 0 20px rgba(245, 196, 0, 0.15);
  }

  .pillar-icon {
    font-size: 1.2rem;
    color: var(--accent-neon);
    margin-bottom: 4px;
  }

  .pillar strong {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pillar p {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  /* ══ FAQ LIST ══════════════════════════════════════════════════════════════*/
  .faq-section {
    padding: var(--space-2xl) 0;
  }

  .section-heading {
    font-size: clamp(1.2rem, 2.5vw, 1.6rem);
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    margin: 0 0 var(--space-xl);
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .faq-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color var(--transition-base);
  }
  .faq-item.open {
    border-color: var(--border-accent);
    box-shadow: 0 0 16px var(--accent-neon-glow);
  }

  .faq-question {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-xl);
    background: none;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-base);
    font-size: var(--text-md);
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
  }
  .faq-question:hover {
    color: #F5C400;
    background: rgba(245, 196, 0, 0.04);
  }
  .faq-item.open .faq-question {
    color: #F5C400;
  }

  .faq-chevron {
    flex-shrink: 0;
    color: var(--text-muted);
    transition: transform var(--transition-base), color var(--transition-base);
  }
  .faq-item.open .faq-chevron {
    transform: rotate(180deg);
    color: #F5C400;
  }

  .faq-answer {
    padding: 0 var(--space-xl) var(--space-lg);
    animation: answerOpen 0.22s ease both;
  }
  @keyframes answerOpen {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .faq-answer p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.75;
    margin: 0;
    border-left: 2px solid var(--accent-neon);
    padding-left: var(--space-md);
  }

  /* ══ CTA ══════════════════════════════════════════════════════════════════*/
  .cta-section { padding: var(--space-xl) 0 var(--space-md); }

  .cta-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }

  .cta-text {
    font-size: var(--text-md);
    color: var(--text-secondary);
    margin: 0;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    padding: 10px var(--space-xl);
    background: transparent;
    border: 1px solid var(--accent-neon);
    border-radius: var(--radius-md);
    color: var(--accent-neon);
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast);
  }
  .cta-btn:hover {
    background: rgba(245, 196, 0, 0.08);
    box-shadow: 0 0 20px var(--accent-neon-glow);
  }

  /* ══ RESPONSIVE ════════════════════════════════════════════════════════════*/
  @media (max-width: 700px) {
    .container { padding: 0 var(--space-md); }

    .about-grid {
      grid-template-columns: 1fr;
      gap: var(--space-lg);
    }

    .about-pillars {
      grid-template-columns: 1fr;
    }

    .faq-hero { padding: var(--space-xl) 0 var(--space-lg); }
  }
</style>
