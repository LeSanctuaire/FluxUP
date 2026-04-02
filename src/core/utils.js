/**
 * core/utils.js
 * Utilitaires partagés dans FluxUP.
 */

/**
 * Formate une durée en secondes → "m:ss".
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Formate un nombre de vues (ex. 1234567 → "1.2M").
 * @param {number} count
 * @returns {string}
 */
export function formatViews(count) {
  if (!count) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000)     return `${(count / 1_000).toFixed(0)}K`;
  return String(count);
}

/**
 * Extrait l'ID d'une URL YouTube.
 * @param {string} url
 * @returns {string | null}
 */
export function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Construit l'URL de la miniature YouTube.
 * @param {string} videoId
 * @param {'default'|'medium'|'high'|'maxres'} [quality]
 * @returns {string}
 */
export function youtubeThumbnail(videoId, quality = 'high') {
  const qualityMap = {
    default: 'default',
    medium:  'mqdefault',
    high:    'hqdefault',
    maxres:  'maxresdefault',
  };
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Debounce une fonction.
 * @param {Function} fn
 * @param {number} delay — ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Tronque un texte à N caractères.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
export function truncate(text, max = 60) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Génère une couleur d'accent aléatoire parmi les accents FluxUP.
 * @returns {string}
 */
export function randomAccent() {
  return Math.random() > 0.5 ? 'var(--accent-neon)' : 'var(--accent-orange)';
}
