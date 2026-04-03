/**
 * Store global pour la modal de recherche radio.
 * Utilisation : radioSearchStore.open() / .close() / .show
 */

let show = $state(false);

export const radioSearchStore = {
  get show() { return show; },
  open()  { show = true;  },
  close() { show = false; },
};
