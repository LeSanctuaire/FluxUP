<script>
  const year = new Date().getFullYear();

  const links = [
    { label: 'FAQ / À propos', href: '#/faq' },
    { label: 'Mentions légales', href: '#/mentions-legales' },
    { label: 'Contact', href: 'mailto:contact@fluxup.fr' },
  ];
</script>

<footer class="footer">
  <div class="footer-inner">

    <!-- Logo -->
    <a href="#/" class="footer-brand" aria-label="FluxUP — Accueil">
      <em>Flux<span class="accent">UP</span></em>
    </a>

    <!-- Ligne séparatrice néon -->
    <div class="footer-divider" aria-hidden="true"></div>

    <!-- Liens -->
    <nav class="footer-nav" aria-label="Liens de bas de page">
      <ul class="footer-links">
        {#each links as link}
          <li>
            <a
              href={link.href}
              class="footer-link"
              target={link.href.startsWith('mailto') ? undefined : undefined}
            >{link.label}</a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Copyright -->
    <p class="footer-copy">
      &copy; {year} &mdash; <span class="copy-brand">FluxUP</span> &mdash; Tous droits réservés
    </p>

  </div>
</footer>

<style>
  .footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
  }

  .footer-inner {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    text-align: center;
  }

  /* ── Logo ─────────────────────────────────────────────────────────────────*/
  .footer-brand {
    font-size: var(--text-xl);
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-primary);
    text-decoration: none;
    transition: opacity var(--transition-fast);
  }
  .footer-brand:hover { opacity: 0.75; }
  .footer-brand .accent { color: #F5C400; }

  /* ── Séparateur dégradé ───────────────────────────────────────────────────*/
  .footer-divider {
    width: 100%;
    max-width: 320px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--accent-orange) 20%,
      var(--accent-neon) 50%,
      var(--accent-orange) 80%,
      transparent
    );
    opacity: 0.4;
  }

  /* ── Navigation ───────────────────────────────────────────────────────────*/
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-sm) var(--space-xl);
  }

  .footer-link {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--transition-fast);
    position: relative;
  }
  /* Underline hover animé */
  .footer-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent-neon);
    transition: width var(--transition-base);
  }
  .footer-link:hover {
    color: var(--accent-neon);
  }
  .footer-link:hover::after {
    width: 100%;
  }

  /* ── Copyright ────────────────────────────────────────────────────────────*/
  .footer-copy {
    font-size: var(--text-xs);
    color: var(--text-muted);
    letter-spacing: 0.06em;
    margin: 0;
  }
  .copy-brand { color: #F5C400; font-weight: 700; }

  /* ── Responsive ───────────────────────────────────────────────────────────*/
  @media (max-width: 480px) {
    .footer { padding: var(--space-lg) var(--space-md); }
    .footer-links { gap: var(--space-sm) var(--space-lg); }
  }
</style>
