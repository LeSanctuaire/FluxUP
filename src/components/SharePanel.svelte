<script>
  /**
   * SharePanel — système de partage FluxUP
   * Props :
   *   id    : YouTube video ID (URL + thumbnail)
   *   title : titre du clip
   */
  /**
   * id       : YouTube video ID (URL + thumbnail)
   * title    : titre affiché
   * url      : URL de partage personnalisée (optionnel, écrase l'URL auto #/clip/{id})
   * text     : texte de partage personnalisé (optionnel)
   */
  let { id = '', title = 'Clip', url: customUrl = null, text: customText = null } = $props();

  /* ── URL de partage ── */
  let shareUrl = $derived(
    customUrl ?? `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}#/clip/${id}`
  );
  let shareText = $derived(customText ?? `${title} — Découvrez ce clip sur FluxUP`);
  let thumbUrl  = $derived(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);

  /* ── État ── */
  let open       = $state(false);
  let copied     = $state(false);
  let toastTimer = null;

  /* ── Web Share API disponible ? ── */
  let canNativeShare = $derived(
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  );

  /* ── Actions ── */

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback execCommand pour les vieux contextes
      const el = document.createElement('textarea');
      el.value = shareUrl;
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    triggerToast();
  }

  function triggerToast() {
    copied = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { copied = false; }, 2200);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
    } catch { /* annulé par l'utilisateur */ }
  }

  function openPopup(url) {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=440');
  }

  function shareTwitter() {
    openPopup(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    );
  }

  function shareTelegram() {
    openPopup(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    );
  }
</script>

<!-- ══════════════════════════════ TEMPLATE ══════════════════════════════ -->

<div class="share-root">

  <!-- Bouton déclencheur -->
  <button
    class="share-toggle"
    class:open
    onclick={() => (open = !open)}
    aria-expanded={open}
    aria-controls="share-panel"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5"  r="3" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="6"  cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51 8.59 10.49"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
    Partager
    <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <!-- Panneau dépliable -->
  {#if open}
    <div class="share-panel" id="share-panel" role="group" aria-label="Options de partage">

      <!-- Prévisualisation -->
      <div class="share-preview">
        <img
          class="share-thumb"
          src={thumbUrl}
          alt=""
          loading="lazy"
          onerror={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div class="share-preview-info">
          <span class="share-preview-title">{title}</span>
          <span class="share-preview-url">{shareUrl}</span>
        </div>
      </div>

      <!-- Boutons de partage -->
      <div class="share-buttons">

        <!-- Copier le lien -->
        <button
          class="sbtn sbtn--copy"
          class:copied
          onclick={copyLink}
          aria-label="Copier le lien"
        >
          {#if copied}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copié !
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            Copier le lien
          {/if}
        </button>

        <!-- Web Share API (mobile natif) -->
        {#if canNativeShare}
          <button class="sbtn sbtn--native" onclick={nativeShare} aria-label="Partager via…">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Partager via…
          </button>
        {/if}

        <!-- X / Twitter -->
        <button class="sbtn sbtn--twitter" onclick={shareTwitter} aria-label="Partager sur X">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
          </svg>
          X / Twitter
        </button>

        <!-- Telegram -->
        <button class="sbtn sbtn--telegram" onclick={shareTelegram} aria-label="Partager sur Telegram">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.93 3.38 1.57 11.27c-1.33.53-1.32 1.27-.24 1.6l5.15 1.6 11.93-7.53c.56-.34 1.08-.16.66.22L8.38 17.27l-.38 5.37c.56 0 .81-.26 1.12-.55l2.68-2.6 5.57 4.1c1.02.57 1.76.27 2.01-.94l3.64-17.12c.38-1.51-.58-2.2-1.09-1.95Z"/>
          </svg>
          Telegram
        </button>

      </div>
    </div>
  {/if}

  <!-- Toast "Lien copié" -->
  <div class="share-toast" class:visible={copied} role="status" aria-live="polite">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Lien copié dans le presse-papier
  </div>

</div>

<!-- ══════════════════════════════ STYLES ══════════════════════════════ -->

<style>
  .share-root {
    position: relative;
  }

  /* ── Bouton déclencheur ─────────────────────────────────────────────── */
  .share-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-base);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 7px 14px 7px 12px;
    cursor: pointer;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      background var(--transition-fast);
    user-select: none;
  }
  .share-toggle:hover,
  .share-toggle.open {
    color: var(--accent-neon);
    border-color: var(--border-accent);
    box-shadow: 0 0 10px var(--accent-neon-glow);
    background: rgba(0, 229, 204, 0.04);
  }
  .share-toggle:active { transform: scale(0.97); }

  .chevron {
    transition: transform var(--transition-fast);
  }
  .share-toggle.open .chevron {
    transform: rotate(180deg);
  }

  /* ── Panneau ────────────────────────────────────────────────────────── */
  .share-panel {
    margin-top: var(--space-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    animation: panelDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @keyframes panelDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Prévisualisation ───────────────────────────────────────────────── */
  .share-preview {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--border);
    background: var(--bg-card);
  }

  .share-thumb {
    width: 64px;
    height: 36px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
    background: var(--bg-hover);
  }

  .share-preview-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .share-preview-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .share-preview-url {
    font-size: 0.68rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Boutons ────────────────────────────────────────────────────────── */
  .share-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
  }

  .sbtn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-base);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 8px 14px;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
    user-select: none;
  }
  .sbtn:active { transform: scale(0.96); }

  /* Copier */
  .sbtn--copy {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    border-color: var(--border);
  }
  .sbtn--copy:hover {
    background: rgba(255, 255, 255, 0.09);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.14);
  }
  .sbtn--copy.copied {
    color: var(--accent-neon);
    border-color: var(--border-accent);
    background: rgba(0, 229, 204, 0.08);
    box-shadow: 0 0 10px var(--accent-neon-glow);
  }

  /* Natif */
  .sbtn--native {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    border-color: var(--border);
  }
  .sbtn--native:hover {
    background: rgba(255, 255, 255, 0.09);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.14);
  }

  /* X / Twitter */
  .sbtn--twitter {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    border-color: var(--border);
  }
  .sbtn--twitter:hover {
    background: rgba(255, 255, 255, 0.09);
    color: #e7e7e7;
    border-color: rgba(255, 255, 255, 0.18);
  }

  /* Telegram */
  .sbtn--telegram {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    border-color: var(--border);
  }
  .sbtn--telegram:hover {
    background: rgba(38, 164, 220, 0.12);
    color: #4fc3f7;
    border-color: rgba(38, 164, 220, 0.28);
    box-shadow: 0 0 10px rgba(38, 164, 220, 0.14);
  }

  /* ── Toast ──────────────────────────────────────────────────────────── */
  .share-toast {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--accent-neon);
    background: var(--bg-card);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-md);
    padding: 7px 13px;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 14px var(--accent-neon-glow);
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.18s ease, transform 0.18s ease;
    z-index: 50;
  }
  .share-toast.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Responsive ─────────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .share-buttons {
      flex-direction: column;
    }
    .sbtn {
      justify-content: center;
    }
    .share-toast {
      bottom: auto;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
    }
    .share-toast.visible {
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
