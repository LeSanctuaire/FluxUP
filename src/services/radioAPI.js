/**
 * services/radioAPI.js
 * Intégration Browser Radio API (radio-browser.info)
 * Docs : https://api.radio-browser.info/
 */

import { autoFilter, applyExclusions, CURATED_STATIONS as _CURATED_STATIONS } from './radioCuration.js';

const BASE_URL = 'https://de1.api.radio-browser.info/json';

/**
 * Passe une URL de favicon via wsrv.nl pour la redimensionner à 53×53 WebP.
 * Évite de télécharger des images 500–1024px pour les afficher en 53px.
 * @param {string} url
 */
function optimizeFavicon(url) {
  if (!url) return url;
  // Force HTTPS d'abord
  const https = url.startsWith('http://') ? 'https://' + url.slice(7) : url;
  return `https://wsrv.nl/?url=${encodeURIComponent(https)}&w=53&h=53&fit=cover&output=webp`;
}

/** Normalise les champs d'une station (favicon optimisée). @param {any} s */
function normalizeStation(s) {
  return s.favicon ? { ...s, favicon: optimizeFavicon(s.favicon) } : s;
}

// Ré-export normalisé : favicons passées via wsrv.nl comme les stations API
export const CURATED_STATIONS = _CURATED_STATIONS.map(normalizeStation);

/** Headers communs */
const HEADERS = {
  'User-Agent': 'FluxUP/1.0',
  'Content-Type': 'application/json',
};

export const PAGE_SIZE = 30;

/**
 * Récupère les stations en vedette (top votes) avec pagination.
 * Utilise /stations/search pour supporter l'offset.
 * @param {number} [limit]
 * @param {number} [offset]
 * @returns {Promise<Station[]>}
 */
export async function getFeaturedRadios(limit = PAGE_SIZE, offset = 0) {
  try {
    const params = new URLSearchParams({
      limit:      String(limit),
      offset:     String(offset),
      hidebroken: 'true',
      order:      'votes',
      reverse:    'true',
    });
    const res = await fetch(`${BASE_URL}/stations/search?${params}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return applyExclusions(autoFilter(data.map(normalizeStation)));
  } catch (err) {
    console.warn('[radioAPI] getFeaturedRadios:', err);
    return offset === 0 ? FALLBACK_STATIONS : [];
  }
}

/**
 * Recherche des stations par nom/tag avec pagination.
 * @param {string} query
 * @param {number} [limit]
 * @param {number} [offset]
 * @returns {Promise<Station[]>}
 */
export async function searchRadios(query, limit = PAGE_SIZE, offset = 0) {
  if (!query?.trim()) return [];
  try {
    const params = new URLSearchParams({
      name:       query,
      limit:      String(limit),
      offset:     String(offset),
      hidebroken: 'true',
      order:      'votes',
      reverse:    'true',
    });
    const res = await fetch(`${BASE_URL}/stations/search?${params}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return applyExclusions(autoFilter(data.map(normalizeStation)));
  } catch (err) {
    console.warn('[radioAPI] searchRadios:', err);
    return [];
  }
}

/**
 * Grandes chaînes nationales françaises à exclure du mode "indé".
 * Matching insensible à la casse sur le début du nom.
 */
const FR_MAINSTREAM_BLACKLIST = [
  'rtl', 'france info', 'france inter', 'france culture', 'france musique',
  'france bleu', 'france 2', 'france 3', 'france 5', 'franceinfo',
  'rmc', 'bfm', 'europe 1', 'nrj', 'skyrock', 'fun radio',
  'virgin radio', 'chérie fm', 'cherie fm', 'rfi', 'nostalgie',
  'rire et chansons', 'rire & chansons', 'oui fm', 'm radio',
  'radio classique', 'fip', 'mouv', 'francebleu',
];

/**
 * Filtre les grandes chaînes mainstream d'une liste de stations.
 * @param {Station[]} stations
 * @returns {Station[]}
 */
function filterMainstream(stations) {
  return stations.filter(s => {
    const name = s.name.toLowerCase().trim();
    return !FR_MAINSTREAM_BLACKLIST.some(blocked => name.startsWith(blocked));
  });
}

/**
 * Récupère les radios françaises indépendantes avec pagination.
 * On surcharge le fetch pour compenser le filtrage côté client.
 * @param {number} [limit]
 * @param {number} [offset]
 * @returns {Promise<Station[]>}
 */
export async function getFrenchIndieRadios(limit = PAGE_SIZE, offset = 0) {
  // On demande 2× plus pour absorber le filtrage des grandes chaînes
  const fetchLimit = limit * 2;
  try {
    const params = new URLSearchParams({
      countrycode: 'FR',
      limit:       String(fetchLimit),
      offset:      String(offset),
      hidebroken:  'true',
      order:       'clickcount',
      reverse:     'true',
    });
    const res = await fetch(`${BASE_URL}/stations/search?${params}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return applyExclusions(autoFilter(filterMainstream(data.map(normalizeStation)))).slice(0, limit);
  } catch (err) {
    console.warn('[radioAPI] getFrenchIndieRadios:', err);
    return offset === 0 ? FALLBACK_STATIONS.filter(s => s.country === 'France') : [];
  }
}

/**
 * Recherche par genre/tag avec pagination.
 * @param {string} tag
 * @param {number} [limit]
 * @param {number} [offset]
 * @returns {Promise<Station[]>}
 */
export async function getRadiosByTag(tag, limit = PAGE_SIZE, offset = 0) {
  try {
    const params = new URLSearchParams({
      tag:        tag,
      limit:      String(limit),
      offset:     String(offset),
      hidebroken: 'true',
      order:      'votes',
      reverse:    'true',
    });
    const res = await fetch(`${BASE_URL}/stations/search?${params}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.map(normalizeStation);
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
  { stationuuid: 'fallback-1', name: 'FIP Radio',          country: 'France', tags: 'diverse, music',        bitrate: 128, url_resolved: 'https://icecast.radiofrance.fr/fip-midfi.mp3',   favicon: '' },
  { stationuuid: 'fallback-2', name: 'Radio Nova',         country: 'France', tags: 'pop, soul, world',      bitrate: 128, url_resolved: 'https://novazz.ice.infomaniak.ch/novazz-128.mp3', favicon: '' },
  { stationuuid: 'fallback-3', name: 'NTS Radio 1',        country: 'UK',     tags: 'independent, eclectic', bitrate: 128, url_resolved: 'https://stream-relay-geo.ntslive.net/stream',      favicon: '' },
  { stationuuid: 'fallback-4', name: 'KEXP 90.3 FM',       country: 'USA',    tags: 'indie, alternative',    bitrate: 128, url_resolved: 'https://live-aacplus-64.kexp.org/kexp64.aac',      favicon: '' },
];

/**
 * File de shuffle FluxUP : contient les stations pas encore jouées dans le cycle en cours.
 * Se réinitialise (re-shuffle) quand toutes les stations ont été jouées.
 * @type {Station[]}
 */
let _shuffleQueue = [];

/**
 * Fisher-Yates shuffle in-place.
 * @param {Station[]} arr
 * @returns {Station[]}
 */
function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Recharge la file avec toutes les stations FluxUP melangees.
 * @param {string|null} excludeId
 */
function _refillQueue(excludeId) {
  const all = CURATED_STATIONS.filter(s => s.stationuuid !== excludeId);
  _shuffleQueue = _shuffle([...all]);
}

/**
 * Retourne la prochaine station de la selection FluxUP.
 * - Premier appel (pas de station en cours) -> toujours Radio 50/50.
 * - Appels suivants -> parcourt toutes les stations en ordre aleatoire,
 *   sans repetition, avant de recommencer un nouveau cycle.
 * @param {string} [excludeId] UUID de la station actuellement jouee
 * @returns {Promise<Station | null>}
 */
export async function getRandomStation(excludeId) {
  // Premier lancement → Radio 50/50 en priorité
  if (!excludeId) {
    const radio5050 = CURATED_STATIONS.find(s => s.stationuuid === '0efe7505-f1e6-11e9-a96c-52543be04c81');
    if (radio5050) return radio5050;
  }

  // Si la file est vide, on recharge un nouveau cycle mélangé
  if (_shuffleQueue.length === 0) _refillQueue(excludeId ?? null);

  // Dépiler la prochaine station (en s'assurant qu'elle diffère de la courante)
  const idx = _shuffleQueue.findIndex(s => s.stationuuid !== excludeId);
  if (idx === -1) {
    // Edge case : toutes les stations restantes == station courante (1 seule station)
    _refillQueue(null);
    return _shuffleQueue.pop() ?? null;
  }
  const [station] = _shuffleQueue.splice(idx, 1);
  return station;
}

/**
 * @typedef {{ stationuuid: string, name: string, country: string, tags: string, bitrate: number, url_resolved: string, favicon: string }} Station
 */
