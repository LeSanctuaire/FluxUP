<script>
  import { surpriseStore } from '../core/surpriseStore.svelte.js';
  import { radioSearchStore } from '../core/radioSearchStore.svelte.js';

  /** @type {{ currentRoute: string }} */
  let { currentRoute = '#/' } = $props();

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
            { label: 'Classement - Votes', href: '#/classement' },
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
          title: 'Selections',
          links: [
            { label: 'La Crypte', href: '#/crypte' },
            { label: 'Reggae - Dub - Roots', href: '#/reggae-dub' },
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
            { label: 'Rechercher une radio', href: '#', action: 'openRadioSearch' },
          ],
        },
        {
          title: 'Streams 24/7',
          links: [
            { label: 'Découvrir les lives Radios', href: '#', inactive: true },
          ],
        },
      ],
    },
  ];

  let sidebarOpen = $state(false);
  let activeMenu  = $state(null);

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    if (!sidebarOpen) activeMenu = null;
  }

  function toggleMenu(/** @type {string} */ label) {
    activeMenu = activeMenu === label ? null : label;
  }

  function closeAll() {
    sidebarOpen = false;
    activeMenu  = null;
  }

  /**
   * Navigation explicite : nécessaire en Svelte 5 car les mises à jour $state
   * sont synchrones — le <a> est retiré du DOM avant que le navigateur suive
   * son href. On impose le hash manuellement avant de fermer le menu.
   * @param {string} href  ex: '#/crypte'
   */
  function navTo(href) {
    window.location.hash = href.replace(/^#/, '');
    closeAll();
  }

  function handleOutsideClick(/** @type {MouseEvent} */ event) {
    const t = /** @type {Element} */ (event.target);
    if (!t.closest('.sidebar') && !t.closest('.sidebar-toggle')) closeAll();
  }

  /** Lance la modal "Me Surprendre" (clip aléatoire) */
  function openDiceSurprise() {
    closeAll();
    surpriseStore.trigger();
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<!-- ══════════════════════════ BANDE SUPÉRIEURE ══════════════════════════ -->
<header class="top-bar">

  <!-- Gauche : burger + retour -->
  <div class="top-bar-left">
    <button
      class="sidebar-toggle"
      class:is-open={sidebarOpen}
      onclick={(e) => { e.stopPropagation(); toggleSidebar(); }}
      aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={sidebarOpen}
    >
      <span></span><span></span><span></span>
    </button>

    {#if currentRoute !== '#/' && currentRoute !== '#/home'}
      <button
        class="top-back"
        onclick={() => history.back()}
        aria-label="Page précédente"
        title="Retour"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-label">Retour</span>
      </button>
    {/if}
  </div>

  <!-- Centre : logo FLUXUP -->
  <a class="top-logo" href="#/" aria-label="FluxUP — Retour à l'accueil">
    <em>Flux<span class="neon">UP</span></em>
  </a>

  <!-- Droite : dé 3D -->
  <div class="top-bar-right">

    <!-- Dé 3D "Me Surprendre" -->
    <button
      class="top-dice"
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

  </div>
</header>

<!-- ── Backdrop semi-transparent (ferme la sidebar au clic) ───────────────── -->
{#if sidebarOpen}
  <div
    class="sidebar-backdrop"
    onclick={closeAll}
    aria-hidden="true"
  ></div>
{/if}

<!-- ══════════════════════════ SIDEBAR ══════════════════════════ -->
<nav class="sidebar" class:open={sidebarOpen} aria-label="Navigation principale">

  <!-- En-tête : Logo + bouton replier -->
  <div class="sidebar-header">
    <a href="#/" class="logo" onclick={closeAll} aria-label="FluxUP accueil">
      Flux<span class="neon">UP</span>
    </a>
    <button
      class="sidebar-collapse"
      onclick={(e) => { e.stopPropagation(); closeAll(); }}
      aria-label="Replier le menu"
      title="Replier"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

  <!-- Liens de navigation -->
  <ul class="sidebar-nav" role="menubar">
    {#each menuItems as item}
      <li class="sidebar-item" role="none">

        {#if item.mega}
          <!-- Bouton accordéon -->
          <button
            class="sidebar-btn"
            class:active={currentRoute === item.href || activeMenu === item.label}
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={activeMenu === item.label}
            onclick={() => toggleMenu(item.label)}
          >
            <span>{item.label}</span>
            <svg class="chevron" class:rotated={activeMenu === item.label}
              width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Sous-menu accordéon (dépliable) -->
          {#if activeMenu === item.label}
            <div class="sidebar-sub" role="menu">
              {#each item.sections as section}
                <p class="sub-title">{section.title}</p>
                {#each section.links as link}
                  <a
                    href={link.href}
                    role="menuitem"
                    class="sub-link"
                    class:sub-link--inactive={link.inactive}
                    aria-disabled={link.inactive || undefined}
                    onclick={(e) => {
                      e.preventDefault();
                      if (link.inactive) return;
                      if (link.action === 'openRadioSearch') { closeAll(); radioSearchStore.open(); }
                      else navTo(link.href);
                    }}
                  >
                    <span class="link-arrow">›</span>{link.label}{#if link.inactive}<span class="link-soon">bientôt</span>{/if}
                  </a>
                {/each}
              {/each}
            </div>
          {/if}

        {:else}
          <a
            href={item.href}
            class="sidebar-link"
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

</nav>

<style>
  /* ── Décalage du contenu sous la barre ───────────────────────────────────*/
  :global(body) {
    padding-top: 0;
  }
  :global(#main-content) {
    padding-top: 62px;
  }

  /* ══════════════ BANDE SUPÉRIEURE ══════════════════════════════════════════*/
  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 62px;
    z-index: calc(var(--z-navbar) + 2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-md);
    background: rgba(4, 4, 10, 0.96);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid transparent;
    background-clip: padding-box;
    box-shadow:
      0 1px 0 0 rgba(0, 229, 204, 0.18),
      0 4px 24px rgba(0, 0, 0, 0.55);
  }
  /* Ligne dégradée orange→neon sous la barre */
  .top-bar::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--accent-orange) 20%,
      var(--accent-neon) 50%,
      var(--accent-orange) 80%,
      transparent 100%
    );
    opacity: 0.5;
    pointer-events: none;
  }

  /* Gauche */
  .top-bar-left {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
  }

  /* Droite */
  .top-bar-right {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
    justify-content: flex-end;
  }

  /* ── Toggle burger (dans la barre) ───────────────────────────────────────*/
  .sidebar-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }
  .sidebar-toggle:hover {
    background: rgba(0, 229, 204, 0.08);
    border-color: var(--border-accent);
    box-shadow: 0 0 10px var(--accent-neon-glow);
  }
  .sidebar-toggle span {
    display: block;
    width: 100%;
    height: 2px;
    background: var(--text-primary);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    transform-origin: center;
  }
  .sidebar-toggle.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .sidebar-toggle.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .sidebar-toggle.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* ── Bouton Retour (dans la barre) ───────────────────────────────────────*/
  .top-back {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 36px;
    padding: 0 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    animation: backFadeIn var(--transition-base) ease both;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }
  @keyframes backFadeIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .top-back:hover {
    background: rgba(0, 229, 204, 0.08);
    border-color: var(--border-accent);
    color: var(--accent-neon);
    box-shadow: 0 0 10px var(--accent-neon-glow);
  }
  @media (max-width: 480px) { .back-label { display: none; } }

  /* ── Backdrop ─────────────────────────────────────────────────────────────*/
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: calc(var(--z-navbar) + 1);
    animation: backdropIn var(--transition-base) ease both;
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Sidebar panel ────────────────────────────────────────────────────────*/
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 15, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid var(--border);
    z-index: calc(var(--z-navbar) + 2);
    transform: translateX(-100%);
    transition: transform var(--transition-slow);
    overflow: hidden;
  }
  .sidebar.open {
    transform: translateX(0);
    box-shadow: 6px 0 48px rgba(0, 0, 0, 0.75);
  }
  /* Trait dégradé néon sur le bord droit */
  .sidebar::after {
    content: '';
    position: absolute;
    top: 0;
    right: -1px;
    width: 1px;
    height: 100%;
    background: linear-gradient(
      180deg,
      var(--accent-neon) 0%,
      var(--accent-orange) 50%,
      transparent 100%
    );
    opacity: 0.45;
    pointer-events: none;
  }

  /* ── Dé 3D (dans la barre, à droite) ────────────────────────────────────*/
  .top-dice {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 10px;
    background: rgba(255, 107, 43, 0.06);
    border: 1px solid rgba(255, 107, 43, 0.25);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }
  .top-dice:hover {
    background: rgba(255, 107, 43, 0.14);
    border-color: var(--accent-orange);
    box-shadow: 0 0 16px var(--accent-orange-glow);
  }

  /* ── En-tête sidebar ──────────────────────────────────────────────────────*/
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
    padding: 0 var(--space-md) 0 var(--space-xl);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .logo {
    padding-left: 44px;
    font-size: var(--text-lg);
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .logo .neon { color: var(--accent-neon); }

  /* Bouton replier (flèche ‹ dans le header) */
  .sidebar-collapse {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }
  .sidebar-collapse:hover {
    background: rgba(0, 229, 204, 0.08);
    border-color: var(--border-accent);
    color: var(--accent-neon);
    box-shadow: 0 0 8px var(--accent-neon-glow);
  }

  /* ── Navigation verticale ─────────────────────────────────────────────────*/
  .sidebar-nav {
    list-style: none;
    flex: 1;
    overflow-y: auto;
    padding: var(--space-sm) 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .sidebar-item {
    border-bottom: 1px solid var(--border);
  }
  .sidebar-item:last-child { border-bottom: none; }

  .sidebar-btn,
  .sidebar-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px var(--space-xl);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);
  }
  .sidebar-btn:hover,
  .sidebar-link:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
  }
  .sidebar-btn.active,
  .sidebar-link.active {
    color: var(--accent-neon);
    background: rgba(0, 229, 204, 0.05);
  }

  .chevron {
    flex-shrink: 0;
    transition: transform var(--transition-fast);
    opacity: 0.5;
  }
  .chevron.rotated { transform: rotate(180deg); opacity: 1; }

  /* ── Sous-menu accordéon ──────────────────────────────────────────────────*/
  .sidebar-sub {
    background: var(--bg-primary);
    padding: var(--space-sm) var(--space-xl) var(--space-md);
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: subSlide var(--transition-base) ease both;
  }
  @keyframes subSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sub-title {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--accent-neon);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: var(--space-sm) 0 var(--space-xs);
    border-bottom: 1px solid var(--border);
    margin-bottom: var(--space-xs);
  }

  .sub-link {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 6px var(--space-sm);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition:
      color var(--transition-fast),
      background var(--transition-fast),
      padding-left var(--transition-fast);
  }
  .sub-link:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
    padding-left: var(--space-md);
  }
  .link-arrow { color: var(--accent-neon); font-size: 1rem; line-height: 1; }

  .sub-link--inactive {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }
  .link-soon {
    margin-left: auto;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent-orange);
    border: 1px solid currentColor;
    border-radius: 3px;
    padding: 1px 5px;
    opacity: 0.7;
  }

  /* ── Dé 3D miniature ─────────────────────────────────────────────────────*/
  .ndice-wrap {
    perspective: 44px;
    display: inline-block;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
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
  .ndice-back   { transform: rotateY(180deg)  translateZ(9px); }
  .ndice-right  { transform: rotateY(90deg)   translateZ(9px); }
  .ndice-left   { transform: rotateY(-90deg)  translateZ(9px); }
  .ndice-top    { transform: rotateX(90deg)   translateZ(9px); }
  .ndice-bottom { transform: rotateX(-90deg)  translateZ(9px); }

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

  /* ── Logo FLUXUP centré dans la barre ───────────────────────────────────*/
  .top-logo {
    display: flex;
    align-items: center;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--text-primary);
    white-space: nowrap;
    pointer-events: auto;
    transition: opacity var(--transition-fast);
    animation: glitch 6s ease-in-out infinite;
    /* Centre absolu dans la barre */
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  .top-logo:hover { opacity: 0.75; }
  .top-logo .neon { color: var(--accent-neon); }

  @keyframes glitch {
    0%, 85%, 100% {
      text-shadow: none;
      transform: translateX(-50%) skewX(0deg);
    }
    86% {
      text-shadow: -2px 0 var(--accent-orange), 2px 0 var(--accent-neon);
      transform: translateX(calc(-50% + 2px)) skewX(-1deg);
    }
    87% {
      text-shadow: 2px 0 var(--accent-orange), -2px 0 var(--accent-neon);
      transform: translateX(calc(-50% - 2px)) skewX(1deg);
    }
    88% {
      text-shadow: -1px 0 var(--accent-neon), 1px 0 var(--accent-orange);
      transform: translateX(-50%) skewX(0deg);
    }
    89% {
      text-shadow: none;
      transform: translateX(-50%);
    }
    92% {
      text-shadow: 3px 0 var(--accent-orange), -3px 0 var(--accent-neon);
      transform: translateX(calc(-50% + 1px)) skewX(-0.5deg);
    }
    93% {
      text-shadow: none;
      transform: translateX(-50%);
    }
  }
</style>
