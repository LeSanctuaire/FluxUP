<script>
  /**
   * @typedef {'primary' | 'secondary' | 'ghost' | 'danger'} ButtonVariant
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

  /* Primary — neon teal plein */
  .btn--primary {
    background: var(--accent-neon);
    color: var(--bg-primary);
  }
  .btn--primary:hover:not(:disabled) {
    background: #00ffe8;
    box-shadow:
      0 4px 24px rgba(0, 229, 204, 0.55),
      0 0 0 1px  rgba(0, 229, 204, 0.25);
  }

  /* Secondary — contour neon */
  .btn--secondary {
    background: transparent;
    color: var(--accent-neon);
    border: 1px solid var(--accent-neon);
  }
  .btn--secondary:hover:not(:disabled) {
    background: rgba(0, 229, 204, 0.10);
    border-color: #00ffe8;
    color: #fff;
    box-shadow:
      0 4px 22px rgba(0, 229, 204, 0.38),
      0 0 0 1px  rgba(0, 229, 204, 0.18);
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
