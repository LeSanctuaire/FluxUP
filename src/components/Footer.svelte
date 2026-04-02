<script>
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container footer-inner">
    <span class="brand">Flux<span class="accent">UP</span></span>
    <span class="copy">&copy; {year} Sanctum Music — Tous droits réservés</span>
    <span class="tagline">Dark · Néon · Musique</span>
  </div>
</footer>

<style>
  .footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    padding: var(--space-lg) 0;
    margin-bottom: var(--player-height);
  }

  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .brand {
    font-size: var(--text-md);
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .brand .accent { color: var(--accent-neon); }

  .copy {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .tagline {
    font-size: var(--text-xs);
    color: var(--text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  @media (max-width: 600px) {
    .footer-inner { justify-content: center; text-align: center; }
  }
</style>
