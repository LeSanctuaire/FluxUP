/**
 * services/localBeats.js
 * Source locale des beats — lit src/data/beats.json
 * Structure : { youtubeId, title, artist? }
 */

import rawBeats from '../data/beats.json';

/**
 * @param {string} youtubeId
 * @returns {string}
 */
function getThumbnail(youtubeId) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/**
 * Enrichit chaque beat avec thumbnail calculée.
 */
function enrich(beats) {
  return beats.map(b => ({
    ...b,
    thumbnail: getThumbnail(b.youtubeId),
    artist: b.artist ?? '',
  }));
}

/** Tous les beats enrichis. */
export const allBeats = enrich(rawBeats);
