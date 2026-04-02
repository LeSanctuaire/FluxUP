/**
 * services/localClips.js
 * Source locale de données — lit src/data/clips.json
 * Fournit helpers communs à Home, LesClips, Explorer, ClipDetail.
 */

import rawClips from '../data/clips.json';

/**
 * Génère l'URL de la miniature YouTube haute qualité.
 * @param {string} youtubeId
 * @returns {string}
 */
export function getThumbnail(youtubeId) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/**
 * Génère un slug URL-safe depuis le titre + premier artiste.
 * @param {string} title
 * @param {string[]} artists
 * @returns {string}
 */
export function slugify(title, artists) {
  const base = `${title} ${artists[0] ?? ''}`;
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Enrichit chaque clip avec thumbnail et slug calculés.
 * @returns {EnrichedClip[]}
 */
function enrich(clips) {
  return clips.map(c => ({
    ...c,
    thumbnail: getThumbnail(c.youtubeId),
    slug: slugify(c.title, c.artists),
    // Alias compatibilité CardClip (attend 'id' et 'artist')
    id: c.youtubeId,
    artist: c.artists.join(', '),
  }));
}

/** Tous les clips enrichis, featured en tête. */
export const allClips = enrich(rawClips);

/**
 * Clips à mettre en avant (featured: true).
 * @param {number} [limit]
 * @returns {EnrichedClip[]}
 */
export function getFeaturedClips(limit = 6) {
  return allClips.filter(c => c.featured).slice(0, limit);
}

/**
 * Cherche un clip par youtubeId ou slug.
 * @param {string} idOrSlug
 * @returns {EnrichedClip | undefined}
 */
export function findClip(idOrSlug) {
  return allClips.find(c => c.youtubeId === idOrSlug || c.slug === idOrSlug);
}

/**
 * Liste dédupliquée des artistes avec leur nombre de clips.
 * Triée par nombre de clips décroissant.
 * @returns {{ name: string, clips: number }[]}
 */
export function getArtistList() {
  const counts = {};
  for (const clip of allClips) {
    for (const artist of clip.artists) {
      const key = artist.toUpperCase();
      if (!counts[key]) counts[key] = { name: artist, clips: 0 };
      counts[key].clips++;
    }
  }
  return Object.values(counts).sort((a, b) => b.clips - a.clips);
}

/**
 * @typedef {{ youtubeId: string, title: string, channelId: string,
 *   artists: string[], featured?: boolean,
 *   thumbnail: string, slug: string, id: string, artist: string }} EnrichedClip
 */
