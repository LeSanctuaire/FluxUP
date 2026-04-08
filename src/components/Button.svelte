<script>
  /**
   * @typedef {'primary' | 'secondary' | 'ghost' | 'danger' | 'teal' | 'teal-ghost'} ButtonVariant
   * @typedef {'sm' | 'md' | 'lg'} ButtonSize
   */

  /** @type {{ variant?: ButtonVariant, size?: ButtonSize, disabled?: boolean, href?: string, onclick?: (e: MouseEvent) => void, children?: any }} */
  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    href = null,
    onclick = null,
    children,
  } = $props();
</script>

{#if href}
  <a
    class="btn btn--{variant} btn--{size}"
    class:disabled
    {href}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class="btn btn--{variant} btn--{size}"
    {disabled}
    onclick={onclick}
    type="button"
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-base);
    font-size: var(--text-sm); /* taille de base explicite */
    font-weight: 600;
    line-height: 1;             /* neutralise le line-height hérité du body */
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid transparent; /* garde la même boîte quel que soit le variant */
    border-radius: var(--radius-md);
    cursor: pointer;
    text-decoration: none;
    transition:
      background       200ms cubic-bezier(0.4, 0, 0.2, 1),
      color            200ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow       200ms cubic-bezier(0.4, 0, 0.2, 1),
      transform        200ms cubic-bezier(0.4, 0, 0.2, 1),
      border-color     200ms cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    user-select: none;
  }

  /* Lift universel au survol */
  .btn:hover:not(:disabled)  { transform: translateY(-2px); }
  /* Press-down à l'activation */
  .btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }

  /* ---- Tailles ---- */
  .btn--sm { font-size: var(--text-xs); padding: 6px var(--space-md); }
  .btn--md { font-size: var(--text-sm); padding: 10px var(--space-xl); }
  .btn--lg { font-size: var(--text-md); padding: var(--space-md) var(--space-2xl); border-radius: var(--radius-lg); }

  /* ---- Variantes ---- */

  /* Primary — jaune/or plein */
  .btn--primary {
    background: var(--accent-gold);
    color: #080808;
  }
  .btn--primary:hover:not(:disabled) {
    background: #FFD600;
    box-shadow:
      0 4px 24px rgba(245, 196, 0, 0.50),
      0 0 0 1px  rgba(245, 196, 0, 0.22);
  }

  /* Secondary — contour or */
  .btn--secondary {
    background: transparent;
    color: var(--accent-gold);
    border: 1px solid var(--accent-gold);
  }
  .btn--secondary:hover:not(:disabled) {
    background: rgba(245, 196, 0, 0.08);
    border-color: #FFD600;
    color: #fff;
    box-shadow:
      0 4px 22px rgba(245, 196, 0, 0.32),
      0 0 0 1px  rgba(245, 196, 0, 0.16);
  }

  /* Ghost — neutre discret */
  .btn--ghost {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .btn--ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.18);
    color: var(--text-primary);
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.07);
  }

  /* Teal — vert-bleuté profond (CTA clips) */
  .btn--teal {
    background: var(--accent-teal);
    color: #080808;
  }
  .btn--teal:hover:not(:disabled) {
    background: #2a2a2a;
    color: var(--accent-teal);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.40);
  }

  /* Teal ghost — contour vert-bleuté discret */
  .btn--teal-ghost {
    background: transparent;
    color: var(--accent-teal);
    border: 1px solid rgba(10, 191, 163, 0.35);
  }
  .btn--teal-ghost:hover:not(:disabled) {
    background: rgba(10, 191, 163, 0.10);
    border-color: var(--accent-teal);
    color: #fff;
    box-shadow: 0 0 18px rgba(10, 191, 163, 0.35);
  }

  /* Danger — rouge */
  .btn--danger {
    background: transparent;
    color: #ff4d4d;
    border: 1px solid #ff4d4d;
  }
  .btn--danger:hover:not(:disabled) {
    background: rgba(255, 77, 77, 0.12);
    border-color: #ff6666;
    box-shadow:
      0 4px 20px rgba(255, 77, 77, 0.35),
      0 0 0 1px  rgba(255, 77, 77, 0.15);
  }

  /* ---- Désactivé ---- */
  .btn:disabled,
  .btn.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
