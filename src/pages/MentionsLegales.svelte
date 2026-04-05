<script>
  const year = new Date().getFullYear();

  const sections = [
    {
      id: 'editeur',
      title: '1. Éditeur du site',
      content: `
        <p>
          Le site est édité et administré par un créateur indépendant.
          Pour toute question, demande ou signalement, il est possible de contacter
          l'éditeur via le bouton de contact.
        </p>
      `,
    },
    {
      id: 'hebergement',
      title: '2. Hébergement',
      content: `
        <p>Le site est hébergé par :</p>
        <ul>
          <li><strong>Cloudflare, Inc.</strong></li>
          <li>101 Townsend Street</li>
          <li>San Francisco, CA 94107</li>
          <li>États-Unis</li>
        </ul>
      `,
    },
    {
      id: 'propriete',
      title: '3. Propriété intellectuelle',
      content: `
        <p>
          L'ensemble du contenu éditorial du site FluxUP (textes, design, interface, logo) est la propriété
          exclusive de son éditeur, sauf mention contraire.
        </p>
        <p>
          Les clips vidéo, extraits audio et visuels présents sur la plateforme appartiennent à leurs
          créateurs respectifs. FluxUP agit en tant que plateforme de découverte et de mise en valeur,
          non comme détenteur des droits.
        </p>
        <p>
          Toute reproduction partielle ou totale du contenu éditorial sans autorisation écrite préalable
          est interdite.
        </p>
      `,
    },
    {
      id: 'contenu',
      title: '4. Utilisation du contenu',
      content: `
        <p>
          Les contenus musicaux diffusés sur FluxUP (beats, clips, flux radio) sont mis à disposition
          à des fins d'écoute et de découverte uniquement.
        </p>
        <p>
          Aucun contenu ne peut être extrait, reproduit, redistribué ou utilisé commercialement
          sans l'accord explicite de son auteur ou ayant droit.
        </p>
        <p>
          Pour toute demande de partenariat ou d'utilisation, contacte-nous à <strong>contact@fluxup.fr</strong>.
        </p>
      `,
    },
    {
      id: 'responsabilite',
      title: '5. Responsabilité',
      content: `
        <p>
          FluxUP s'efforce de maintenir des informations à jour et exactes. Toutefois, l'éditeur
          ne garantit pas l'exhaustivité ou la disponibilité permanente des contenus.
        </p>
        <p>
          Les liens vers des services tiers (YouTube, plateformes de streaming, webradios) sont
          fournis à titre informatif. FluxUP n'est pas responsable du contenu hébergé par ces services.
        </p>
      `,
    },
    {
      id: 'cookies',
      title: '6. Cookies &amp; données personnelles',
      content: `
        <p>
          FluxUP ne collecte pas de données personnelles à des fins de profilage ou de revente.
        </p>
        <p>
          Le site peut utiliser des données de stockage local (localStorage) pour mémoriser
          des préférences d'utilisation comme les votes ou l'état du lecteur audio.
          Ces données restent sur ton appareil et ne sont pas transmises à des tiers.
        </p>
        <p>
          Les contenus YouTube intégrés sont soumis à la politique de confidentialité de Google.
          En lisant une vidéo, tu acceptes les conditions de YouTube / Google.
        </p>
        <p>
          Conformément au RGPD, tu disposes d'un droit d'accès, de rectification et de suppression
          de tes données. Contacte-nous à <strong>contact@fluxup.fr</strong> pour exercer ces droits.
        </p>
      `,
    },
  ];

  /** @param {string} id */
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
</script>

<div class="page ml-page">

  <!-- ══ HERO ══════════════════════════════════════════════════════════════ -->
  <section class="ml-hero">
    <div class="container">
      <span class="ml-eyebrow">Informations légales</span>
      <h1 class="ml-title">Mentions légales</h1>
      <p class="ml-subtitle">
        Transparence totale sur qui nous sommes, comment le site fonctionne,
        et comment tes données sont gérées.
      </p>
      <p class="ml-date">Dernière mise à jour : {year}</p>
    </div>
  </section>

  <!-- ══ SOMMAIRE ════════════════════════════════════════════════════════ -->
  <nav class="ml-nav" aria-label="Sommaire">
    <div class="container">
      <ul class="ml-nav-list">
        {#each sections as s}
          <li>
            <button class="ml-nav-btn" onclick={() => scrollTo(s.id)}>
              {s.title}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </nav>

  <!-- ══ SECTIONS ════════════════════════════════════════════════════════ -->
  <div class="ml-sections container">
    {#each sections as s, i}
      <section
        id={s.id}
        class="ml-section"
        style="transition-delay: {i * 60}ms"
      >
        <h2 class="ml-section-title">{s.title}</h2>
        <div class="ml-section-body">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html s.content}
        </div>
      </section>
      {#if i < sections.length - 1}
        <div class="section-divider"></div>
      {/if}
    {/each}
  </div>

  <!-- ══ RETOUR ══════════════════════════════════════════════════════════ -->
  <div class="ml-back container">
    <a href="#/faq" class="back-link">← FAQ / À propos</a>
    <a href="#/" class="back-link">← Retour à l'accueil</a>
  </div>

</div>

<style>
  /* ── Page wrapper ─────────────────────────────────────────────────────────*/
  .ml-page {
    min-height: 80vh;
    padding-bottom: var(--space-2xl);
  }

  /* ── Animations reveal ────────────────────────────────────────────────────*/
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ml-hero     { animation: revealUp 0.5s ease both; }
  .ml-nav      { animation: revealUp 0.5s 0.1s ease both; }
  .ml-sections { animation: revealUp 0.5s 0.2s ease both; }
  .ml-back     { animation: revealUp 0.5s 0.3s ease both; }

  /* ── Container ────────────────────────────────────────────────────────────*/
  .container {
    max-width: 820px;
    margin: 0 auto;
    padding: 0 var(--space-xl);
  }

  /* ── Séparateur ───────────────────────────────────────────────────────────*/
  .section-divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--border) 30%,
      var(--border) 70%,
      transparent
    );
    margin: var(--space-xl) 0;
  }

  /* ══ HERO ══════════════════════════════════════════════════════════════════*/
  .ml-hero {
    padding: var(--space-2xl) 0 var(--space-xl);
    text-align: center;
  }

  .ml-eyebrow {
    display: inline-block;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 4px 14px;
    margin-bottom: var(--space-lg);
  }

  .ml-title {
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin: 0 0 var(--space-md);
  }

  .ml-subtitle {
    font-size: var(--text-md);
    color: var(--text-secondary);
    max-width: 520px;
    margin: 0 auto var(--space-sm);
    line-height: 1.65;
  }

  .ml-date {
    font-size: var(--text-xs);
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
  }

  /* ══ SOMMAIRE NAV ══════════════════════════════════════════════════════════*/
  .ml-nav {
    padding: var(--space-lg) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
    margin-bottom: var(--space-xl);
  }

  .ml-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
  }

  .ml-nav-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 5px 14px;
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast),
      background var(--transition-fast);
  }
  .ml-nav-btn:hover {
    color: var(--accent-neon);
    border-color: var(--border-accent);
    background: rgba(0, 229, 204, 0.06);
  }

  /* ══ SECTIONS ══════════════════════════════════════════════════════════════*/
  .ml-sections {
    display: flex;
    flex-direction: column;
  }

  .ml-section {
    scroll-margin-top: 90px;
  }

  .ml-section-title {
    font-size: var(--text-lg);
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    margin: 0 0 var(--space-lg);
    padding-left: var(--space-md);
    border-left: 3px solid var(--accent-orange);
  }

  /* Contenu injecté via @html */
  .ml-section-body :global(p) {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.8;
    margin: 0 0 var(--space-md);
  }

  .ml-section-body :global(ul) {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-md);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ml-section-body :global(li) {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.7;
    padding-left: var(--space-md);
    position: relative;
  }
  .ml-section-body :global(li)::before {
    content: '›';
    position: absolute;
    left: 0;
    color: var(--accent-neon);
    font-weight: 700;
  }

  .ml-section-body :global(strong) {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* ══ RETOUR ════════════════════════════════════════════════════════════════*/
  .ml-back {
    display: flex;
    gap: var(--space-xl);
    justify-content: center;
    flex-wrap: wrap;
    margin-top: var(--space-2xl);
    padding-top: var(--space-xl);
    border-top: 1px solid var(--border);
  }

  .back-link {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;
    letter-spacing: 0.04em;
    transition: color var(--transition-fast);
  }
  .back-link:hover { color: var(--accent-neon); }

  /* ══ RESPONSIVE ════════════════════════════════════════════════════════════*/
  @media (max-width: 600px) {
    .container { padding: 0 var(--space-md); }
    .ml-hero { padding: var(--space-xl) 0 var(--space-lg); }
    .ml-nav-list { gap: 6px; }
  }
</style>
