/**
 * services/radioAPI.js
 * Intégration Browser Radio API (radio-browser.info)
 * Docs : https://api.radio-browser.info/
 */

const BASE_URL = 'https://de1.api.radio-browser.info/json';

/** Headers communs */
const HEADERS = {
  'User-Agent': 'FluxUP/1.0',
  'Content-Type': 'application/json',
};

/**
 * Récupère les stations en vedette (top votes).
 * @param {number} [limit]
 * @returns {Promise<import('./radioAPI.js').Station[]>}
 */
export async function getFeaturedRadios(limit = 12) {
  try {
    const res = await fetch(
      `${BASE_URL}/stations/topvote/${limit}?hidebroken=true&order=votes`,
      { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[radioAPI] getFeaturedRadios:', err);
    return FALLBACK_STATIONS;
  }
}

/**
 * Recherche des stations par nom/tag.
 * @param {string} query
 * @param {number} [limit]
 * @returns {Promise<Station[]>}
 */
export async function searchRadios(query, limit = 20) {
  if (!query?.trim()) return [];
  try {
    const params = new URLSearchParams({
      name: query,
      limit: String(limit),
      hidebroken: 'true',
      order: 'votes',
      reverse: 'true',
    });
    const res = await fetch(`${BASE_URL}/stations/byname/${encodeURIComponent(query)}?${params}`, {
      headers: HEADERS,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[radioAPI] searchRadios:', err);
    return [];
  }
}

/**
 * Recherche par genre/tag.
 * @param {string} tag
 * @param {number} [limit]
 * @returns {Promise<Station[]>}
 */
export async function getRadiosByTag(tag, limit = 20) {
  try {
    const res = await fetch(
      `${BASE_URL}/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&hidebroken=true&order=votes&reverse=true`,
      { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[radioAPI] getRadiosByTag:', err);
    return [];
  }
}

/**
 * Stations de secours si l'API est inaccessible.
 * @type {Station[]}
 */
const FALLBACK_STATIONS = [
  { stationuuid: 'fallback-1', name: 'FIP Radio',          country: 'France', tags: 'diverse, music',     bitrate: 128, url_resolved: 'https://icecast.radiofrance.fr/fip-midfi.mp3',      favicon: '' },
  { stationuuid: 'fallback-2', name: 'Radio Nova',         country: 'France', tags: 'pop, soul, world',   bitrate: 128, url_resolved: 'https://novazz.ice.infomaniak.ch/novazz-128.mp3',    favicon: '' },
  { stationuuid: 'fallback-3', name: 'NTS Radio 1',        country: 'UK',     tags: 'independent, eclectic', bitrate: 128, url_resolved: 'https://stream-relay-geo.ntslive.net/stream',       favicon: '' },
  { stationuuid: 'fallback-4', name: 'KEXP 90.3 FM',       country: 'USA',    tags: 'indie, alternative', bitrate: 128, url_resolved: 'https://live-aacplus-64.kexp.org/kexp64.aac',         favicon: '' },
];

/** Cache interne pour éviter de re-fetcher à chaque clic "radio aléatoire". */
let _radioCache = null;

/**
 * Retourne une station aléatoire parmi les vedettes.
 * La liste est mise en cache après le premier appel.
 * @param {string} [excludeId] stationuuid a exclure (station en cours de lecture)
 * @returns {Promise<Station | null>}
 */
export async function getRandomStation(excludeId = null) {
  if (!_radioCache) _radioCache = await getFeaturedRadios(20);
  const pool = excludeId
    ? _radioCache.filter(/** @param {Station} s */ s => s.stationuuid !== excludeId)
    : _radioCache;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * @typedef {{ stationuuid: string, name: string, country: string, tags: string, bitrate: number, url_resolved: string, favicon: string }} Station
 */
