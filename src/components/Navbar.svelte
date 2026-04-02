<script>
  import { surpriseStore } from '../core/surpriseStore.svelte.js';
  import { getRandomStation } from '../services/radioAPI.js';
  import { player } from '../core/player.svelte.js';

  /** @type {{ currentRoute: string }} */
  let { currentRoute = '#/' } = $props();

  // Structure du mega-menu
  const menuItems = [
    {
      label: 'Accueil',
      href: '#/',
      mega: false,
    },
    {
      label: 'Les Clips',
      href: '#/clips',
      mega: true,
      sections: [
        {
          title: 'TENDANCE',
          links: [
            { label: 'Tous les clips', href: '#/clips' },
            { label: 'Radar des sorties', href: '#/clips' },
            { label: 'Classement - Votes', href: '#/clips' },
          ],
        },
      ],
    },
    {
      label: 'Explorer',
      href: '#/explorer',
      mega: true,
      sections: [
        {
          title: 'Parcourir',
          links: [
            { label: 'Par artiste', href: '#/explorer' },
            { label: 'Par genre', href: '#/explorer' },
            { label: 'Par année', href: '#/explorer' },
          ],
        },
        {
          title: 'Sélections',
          links: [
            { label: 'Playlists curées', href: '#/explorer' },
            { label: 'Albums spotlight', href: '#/explorer' },
            { label: 'Exclusivités', href: '#/explorer' },
          ],
        },
      ],
    },
    {
      label: 'Radio Flux',
      href: '#/radio',
      mega: true,
      sections: [
        {
          title: 'En direct',
          links: [
            { label: 'Webradios sélectionnées', href: '#/radio' },
            { label: 'Flux en cours', href: '#/radio' },
          ],
        },
        {
          title: 'Recherche',
          links: [
            { label: 'Toutes les radios', href: '#/radio' },
            { label: 'Par pays', href: '#/radio' },
            { label: 'Par genre musical', href: '#/radio' },
          ],
        },
      ],
    },
  ];

  let mobileOpen  = $state(false);
  let activeMenu  = $state(null);
  let radioLoading = $state(false);

  function toggleDesktop(/** @type {string} */ label) {
    activeMenu = activeMenu === label ? null : label;
  }

  function closeAll() {
    activeMenu  = null;
    mobileOpen  = false;
  }

  function handleOutsideClick(/** @type {MouseEvent} */ event) {
    if (!(/** @type {Element} */ (event.target)).closest('.navbar')) closeAll();
  }

  /** Lance la modal "Me Surprendre" (clip aléatoire) */
  function openDiceSurprise() {
    closeAll();
    surpriseStore.trigger();
  }

  /** Lance une radio aléatoire dans le player global */
  async function playRandomRadio() {
    closeAll();
    if (radioLoading) return;
    radioLoading = true;
    try {
      const currentId = player.isRadio ? player.currentTrack?.id : null;
      const station = await getRandomStation(currentId);
      if (!station) return;
      player.play({
        id:        station.stationuuid,
        title:     station.name,
        artist:    [station.country, station.tags].filter(Boolean).join(' · '),
        src:       station.url_resolved,
        thumbnail: station.favicon || null,
        isRadio:   true,
        meta:      station,
      });
    } finally {
      radioLoading = false;
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<nav class="navbar" aria-label="Navigation principale">
  <div class="nav-inner container">

    <!-- Logo -->
    <a href="#/" class="logo" aria-label="FluxUP accueil" onclick={closeAll}>
      Flux<span class="neon">UP</span>
    </a>

    <!-- Liens desktop -->
    <ul class="nav-links" role="menubar">
      {#each menuItems as item}
        <li class="nav-item" role="none">
          {#if item.mega}
            <button
              class="nav-btn"
              class:active={currentRoute === item.href || activeMenu === item.label}
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={activeMenu === item.label}
              onclick={(e) => { e.stopPropagation(); toggleDesktop(item.label); }}
            >
              {item.label}
              <svg class="chevron" class:rotated={activeMenu === item.label}
                width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                  fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="mega-menu" class:open={activeMenu === item.label} role="menu">
              <div class="mega-inner">
                {#each item.sections as section}
                  <div class="mega-section">
                    <p class="mega-section-title">{section.title}</p>
                    <ul>
                      {#each section.links as link}
                        <li>
                          <a href={link.href} role="menuitem" onclick={closeAll}>
                            <span class="link-arrow">›</span> {link.label}
                          </a>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </div>
            </div>

          {:else}
            <a
              href={item.href}
              class="nav-link"
              class:active={currentRoute === item.href}
              role="menuitem"
              onclick={closeAll}
            >
              {item.label}
            </a>
          {/if}
        </li>
      {/each}
    </ul>

    <!-- Actions CTA desktop -->
    <div class="nav-actions">
      <!-- Bouton dé : ouvre la modal clip aléatoire -->
      <button
        class="nav-dice"
        onclick={openDiceSurprise}
        aria-label="Clip surprise aléatoire"
        title="Me Surprendre"
      >
        <span class="ndice-wrap" aria-hidden="true">
          <span class="ndice-cube">
            <span class="ndice-face ndice-front">⚀</span>
            <span class="ndice-face ndice-back">⚅</span>
            <span class="ndice-face ndice-right">⚂</span>
            <span class="ndice-face ndice-left">⚃</span>
            <span class="ndice-face ndice-top">⚄</span>
            <span class="ndice-face ndice-bottom">⚁</span>
          </span>
        </span>
      </button>

      <!-- Bouton Écouter : lance une radio aléatoire -->
      <button
        class="nav-cta"
        class:loading={radioLoading}
        onclick={playRandomRadio}
        aria-label="Écouter une radio aléatoire"
        disabled={radioLoading}
      >
        <span>{radioLoading ? '…' : '▶'}</span> Écouter
      </button>
    </div>

    <!-- Burger mobile -->
    <button
      class="burger"
      class:open={mobileOpen}
      aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={mobileOpen}
      onclick={(e) => { e.stopPropagation(); mobileOpen = !mobileOpen; activeMenu = null; }}
    >
      <span></span><span></span><span></span>
    </button>
  </div>

  <!-- ===================== MENU MOBILE ===================== -->
  <div class="mobile-menu" class:open={mobileOpen} aria-hidden={!mobileOpen}>
    <ul>
      {#each menuItems as item}
        <li class="mobile-item">
          {#if item.mega}
            <button
              class="mobile-btn"
              class:active={currentRoute === item.href}
              aria-expanded={activeMenu === item.label}
              onclick={() => toggleDesktop(item.label)}
            >
              {item.label}
              <svg class="chevron" class:rotated={activeMenu === item.label}
                width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                  fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            {#if activeMenu === item.label}
              <div class="mobile-sub">
                {#each item.sections as section}
                  <p class="mobile-section-title">{section.title}</p>
                  {#each section.links as link}
                    <a href={link.href} onclick={closeAll}>{link.label}</a>
                  {/each}
                {/each}
              </div>
            {/if}
          {:else}
            <a
              href={item.href}
              class="mobile-link"
              class:active={currentRoute === item.href}
              onclick={closeAll}
            >
              {item.label}
            </a>
          {/if}
        </li>
      {/each}
    </ul>

    <!-- CTA mobile : radio aléatoire + dé -->
    <div class="mobile-ctas">
      <button class="mobile-cta" onclick={playRandomRadio} disabled={radioLoading}>
        {radioLoading ? '…' : '▶'} Écouter maintenant
      </button>
      <button class="mobile-dice-cta" onclick={openDiceSurprise} aria-label="Clip surprise">
        Me Surprendre 🎲
      </button>
    </div>
  </div>
</nav>

<style>
  /* ---- Base navbar ---- */
  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: var(--navbar-height);
    background: rgba(10, 10, 15, 0.95);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    z-index: var(--z-navbar);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    gap: var(--space-xl);
  }

  /* ---- Logo ---- */
  .logo {
    font-size: var(--text-lg);
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .logo .neon { color: var(--accent-neon); }

  /* ---- Nav links desktop ---- */
  .nav-links {
    display: flex;
    list-style: none;
    gap: var(--space-xs);
    align-items: center;
    flex: 1;
  }

  .nav-item { position: relative; }

  .nav-btn,
  .nav-link {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
    border-radius: var(--radius-md);
    text-transform: uppercase;
    text-decoration: none;
    font-family: var(--font-base);
  }

  .nav-btn:hover, .nav-link:hover,
  .nav-btn.active, .nav-link.active {
    color: var(--text-primary);
    background: rgba(255,255,255,0.05);
  }
  .nav-btn.active, .nav-link.active { color: var(--accent-neon); }

  .chevron { transition: transform var(--transition-fast); opacity: 0.6; }
  .chevron.rotated { transform: rotate(180deg); opacity: 1; }

  /* ---- Actions CTA (dé + Écouter) ---- */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
  }

  /* ── Bouton dé navbar ─────────────────────────────────────────────────── */
  .nav-dice {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    padding: 0;
  }
  .nav-dice:hover {
    background: rgba(255,107,43,0.12);
    border-color: var(--accent-orange);
    box-shadow: 0 0 12px var(--accent-orange-glow);
  }

  /* Dé 3D miniature (18px) pour la navbar */
  .ndice-wrap {
    perspective: 44px;
    display: inline-block;
    width: 18px;
    height: 18px;
  }
  .ndice-cube {
    display: inline-block;
    width: 18px;
    height: 18px;
    position: relative;
    transform-style: preserve-3d;
    animation: ndice-spin 4s linear infinite;
  }
  .ndice-face {
    position: absolute;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    backface-visibility: visible;
    animation: ndice-color 3s ease-in-out infinite;
  }
  .ndice-front  { transform: translateZ(9px); animation: none; filter: invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.95)); }
  .ndice-back   { transform: rotateY(180deg) translateZ(9px); }
  .ndice-right  { transform: rotateY(90deg)  translateZ(9px); }
  .ndice-left   { transform: rotateY(-90deg) translateZ(9px); }
  .ndice-top    { transform: rotateX(90deg)  translateZ(9px); }
  .ndice-bottom { transform: rotateX(-90deg) translateZ(9px); }

  @keyframes ndice-spin {
    0%   { transform: rotateX(0deg)   rotateY(0deg); }
    25%  { transform: rotateX(90deg)  rotateY(-90deg); }
    50%  { transform: rotateX(180deg) rotateY(-180deg); }
    75%  { transform: rotateX(270deg) rotateY(-270deg); }
    100% { transform: rotateX(360deg) rotateY(-360deg); }
  }
  @keyframes ndice-color {
    0%   { filter: invert(1) drop-shadow(0 0 4px rgba(124,58,237,1)); }
    50%  { filter: invert(1) drop-shadow(0 0 4px rgba(0,229,204,1)); }
    100% { filter: invert(1) drop-shadow(0 0 4px rgba(124,58,237,1)); }
  }

  /* ── Bouton Écouter ──────────────────────────────────────────────────── */
  .nav-cta {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-lg);
    background: var(--accent-neon);
    color: var(--bg-primary);
    font-size: var(--text-sm);
    font-weight: 700;
    border: none;
    border-radius: var(--radius-full);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-family: var(--font-base);
    cursor: pointer;
    transition: background var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  }
  .nav-cta:hover:not(:disabled) {
    background: var(--accent-orange);
    box-shadow: 0 0 18px var(--accent-orange-glow);
  }
  .nav-cta:disabled,
  .nav-cta.loading { opacity: 0.6; cursor: wait; }

  /* ---- Mega-menu dropdown ---- */
  .mega-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    min-width: 220px;
    background: var(--bg-card);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-lg);
    box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--border);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-base), transform var(--transition-base);
    z-index: var(--z-navbar);
  }
  .mega-menu.open {
    opacity: 1;
    pointer-events: all;
    transform: translateX(-50%) translateY(0);
  }
  .mega-menu::before {
    content: '';
    position: absolute;
    top: -1px; left: 20px; right: 20px;
    height: 2px;
    background: linear-gradient(90deg, var(--accent-neon), var(--accent-orange));
    border-radius: var(--radius-full);
  }

  .mega-inner {
    display: flex;
    gap: var(--space-xl);
    padding: var(--space-xl);
  }
  .mega-section { flex: 1; }
  .mega-section-title {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--accent-neon);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--border);
  }
  .mega-section ul { list-style: none; display: flex; flex-direction: column; gap: 2px; }
  .mega-section a {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 6px var(--space-sm);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    transition: color var(--transition-fast), background var(--transition-fast), padding-left var(--transition-fast);
    text-decoration: none;
  }
  .mega-section a:hover {
    color: var(--text-primary);
    background: rgba(255,255,255,0.05);
    padding-left: var(--space-md);
  }
  .link-arrow { color: var(--accent-neon); font-size: 1rem; line-height: 1; }

  /* ---- Burger ---- */
  .burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-sm);
    width: 36px; height: 36px;
  }
  .burger span {
    display: block;
    width: 100%; height: 2px;
    background: var(--text-primary);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    transform-origin: center;
  }
  .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* ---- Menu mobile ---- */
  .mobile-menu {
    display: none;
    overflow: hidden;
    max-height: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    transition: max-height var(--transition-slow);
  }
  .mobile-menu.open { max-height: 100vh; }
  .mobile-menu ul { list-style: none; padding: var(--space-md) 0; }
  .mobile-item { border-bottom: 1px solid var(--border); }
  .mobile-item:last-child { border-bottom: none; }

  .mobile-btn,
  .mobile-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--space-md) var(--space-xl);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    transition: color var(--transition-fast);
    font-family: var(--font-base);
  }
  .mobile-btn:hover, .mobile-link:hover,
  .mobile-btn.active, .mobile-link.active { color: var(--accent-neon); }

  .mobile-sub {
    background: var(--bg-primary);
    padding: var(--space-md) var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  .mobile-section-title {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--accent-neon);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: var(--space-md);
    margin-bottom: var(--space-xs);
  }
  .mobile-section-title:first-child { margin-top: 0; }
  .mobile-sub a {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    padding: 5px var(--space-sm);
    border-radius: var(--radius-sm);
    transition: color var(--transition-fast);
    text-decoration: none;
  }
  .mobile-sub a:hover { color: var(--text-primary); }

  /* CTA zone mobile */
  .mobile-ctas {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: var(--space-lg) var(--space-xl);
  }
  .mobile-cta {
    display: block;
    padding: var(--space-md);
    text-align: center;
    background: var(--accent-neon);
    color: var(--bg-primary);
    font-weight: 700;
    font-size: var(--text-sm);
    border: none;
    border-radius: var(--radius-lg);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: var(--font-base);
    transition: background var(--transition-fast);
  }
  .mobile-cta:hover:not(:disabled) { background: var(--accent-orange); }
  .mobile-cta:disabled { opacity: 0.6; cursor: wait; }

  .mobile-dice-cta {
    display: block;
    padding: var(--space-md);
    text-align: center;
    background: transparent;
    color: var(--accent-orange);
    font-weight: 600;
    font-size: var(--text-sm);
    border: 1px solid var(--accent-orange);
    border-radius: var(--radius-lg);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: var(--font-base);
    transition: background var(--transition-fast), box-shadow var(--transition-fast);
  }
  .mobile-dice-cta:hover {
    background: rgba(255,107,43,0.1);
    box-shadow: 0 0 12px var(--accent-orange-glow);
  }

  /* ---- Responsive ---- */
  @media (max-width: 900px) {
    .nav-links, .nav-actions { display: none; }
    .burger { display: flex; }
    .mobile-menu { display: block; }
  }
</style>
