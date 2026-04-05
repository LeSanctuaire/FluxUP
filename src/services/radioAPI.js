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

/** Cache interne pour éviter de re-fetcher à chaque clic "radio aléatoire".
 * @type {Station[] | null}
 */
let _radioCache = null;

/**
 * Retourne une station aléatoire.
 * Priorité : sélection FluxUP (CURATED_STATIONS), Radio 50/50 en premier lancement.
 * Fallback : top votes API si toutes les stations curées ont déjà été jouées.
 * @param {string} [excludeId]
 * @returns {Promise<Station | null>}
 */
export async function getRandomStation(excludeId) {
  // Premier lancement (pas de station en cours) → Radio 50/50 en priorité
  if (!excludeId) {
    const radio5050 = CURATED_STATIONS.find(s => s.stationuuid === '0efe7505-f1e6-11e9-a96c-52543be04c81');
    if (radio5050) return radio5050;
  }

  // Shuffle suivant → piocher dans CURATED_STATIONS en excluant la station courante
  const curatedPool = excludeId
    ? CURATED_STATIONS.filter(s => s.stationuuid !== excludeId)
    : CURATED_STATIONS;
  if (curatedPool.length > 0) {
    return curatedPool[Math.floor(Math.random() * curatedPool.length)];
  }

  // Fallback : top votes API
  if (!_radioCache) _radioCache = await getFeaturedRadios(50, 0);
  const pool = excludeId
    ? _radioCache.filter(/** @param {Station} s */ s => s.stationuuid !== excludeId)
    : _radioCache;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * @typedef {{ stationuuid: string, name: string, country: string, tags: string, bitrate: number, url_resolved: string, favicon: string }} Station
 */
