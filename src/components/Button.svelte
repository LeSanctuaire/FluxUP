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
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-decoration: none;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
    user-select: none;
  }

  .btn:active:not(:disabled) { transform: scale(0.97); }

  /* ---- Tailles ---- */
  .btn--sm { font-size: var(--text-xs); padding: 6px var(--space-md); }
  .btn--md { font-size: var(--text-sm); padding: 10px var(--space-xl); }
  .btn--lg { font-size: var(--text-md); padding: var(--space-md) var(--space-2xl); border-radius: var(--radius-lg); }

  /* ---- Variantes ---- */
  .btn--primary {
    background: var(--accent-neon);
    color: var(--bg-primary);
  }
  .btn--primary:hover:not(:disabled) {
    background: var(--accent-orange);
    box-shadow: 0 0 20px var(--accent-orange-glow);
  }

  .btn--secondary {
    background: transparent;
    color: var(--accent-neon);
    border: 1px solid var(--accent-neon);
  }
  .btn--secondary:hover:not(:disabled) {
    background: var(--accent-neon-glow);
    box-shadow: 0 0 14px var(--accent-neon-glow);
  }

  .btn--ghost {
    background: rgba(255,255,255,0.05);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .btn--ghost:hover:not(:disabled) {
    background: rgba(255,255,255,0.10);
    color: var(--text-primary);
  }

  .btn--danger {
    background: transparent;
    color: #ff4d4d;
    border: 1px solid #ff4d4d;
  }
  .btn--danger:hover:not(:disabled) {
    background: rgba(255, 77, 77, 0.15);
  }

  /* ---- Désactivé ---- */
  .btn:disabled,
  .btn.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
