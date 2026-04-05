/**
 * services/radioCuration.js
 * Système de curation FluxUP — sélection éditoriale des radios.
 *
 * Organisation :
 *  1. CURATED_STATIONS   → sélection manuelle FluxUP (indépendante de l'API)
 *  2. EXCLUDED_UUIDS     → blacklist d'UUIDs à toujours exclure de l'API
 *  3. autoFilter()       → filtre de qualité automatique (bitrate, URL valide)
 *  4. applyExclusions()  → retire les stations blacklistées
 *
 * Pour ajouter / retirer une station curée : éditer CURATED_STATIONS.
 * Pour blacklister un résultat API : ajouter son UUID dans EXCLUDED_UUIDS.
 */

// ---------------------------------------------------------------------------
// 1. Sélection FluxUP — données complètes, indépendantes de l'API
// ---------------------------------------------------------------------------

/** @type {import('./radioAPI.js').Station[]} */
export const CURATED_STATIONS = [
  {
    stationuuid: '0efe7505-f1e6-11e9-a96c-52543be04c81',
    name:         'Radio 50/50',
    country:      'France',
    tags:         'normandie',
    bitrate:      128,
    url_resolved: 'https://stream.radio5050.com/',
    favicon:      'https://www.radio5050.com/assets/img/favicons/apple-touch-icon.png',
  },
  {
    stationuuid: 'bed0e87f-2d83-41ff-bb9b-0ed0594dc9d7',
    name:         'La Grosse Radio Reggae',
    country:      'France',
    tags:         'reggae, music',
    bitrate:      192,
    url_resolved: 'https://hd.lagrosseradio.info/lagrosseradio-reggae-192.mp3',
    favicon:      'https://www.lagrosseradio.com/wp-content/uploads/2020/11/logo_reggae.png',
  },
  {
    stationuuid: 'fluxup-kingdub-66555',
    name:         'King Dub Radio',
    country:      'France',
    tags:         'reggae, dub, roots, soundsystem',
    bitrate:      128,
    url_resolved: 'https://stream.rcast.net/66555',
    favicon:      'https://kingdubfamily.com/favicon.ico',
  },
  {
    stationuuid: 'fluxup-labelleaventure',
    name:         'Radio La Belle Aventure',
    country:      'France',
    tags:         'variété, chanson française, sans pub',
    bitrate:      192,
    url_resolved: 'https://flux.radiolabelleaventure.com/listen/radio_la_belle_aventure/radio.mp3',
    favicon:      'https://www.radiolabelleaventure.com/favicon.ico',
  },
  {
    stationuuid: 'fluxup-paradise-mellow',
    name:         'Radio Paradise — Mellow Mix',
    country:      'USA',
    tags:         'mellow, eclectic, indie, chill',
    bitrate:      128,
    url_resolved: 'http://stream.radioparadise.com/mellow-128',
    favicon:      'https://www.radioparadise.com/graphics/apple-touch-icon.png',
  },
  {
    stationuuid: 'fluxup-90s90s-hiphop',
    name:         '90s90s HipHop & Rap',
    country:      'Germany',
    tags:         'hiphop, rap',
    bitrate:      192,
    url_resolved: 'https://stream.90s90s.de/hiphop/mp3-192/',
    favicon:      'https://www.90s90s.de/favicon.ico',
  },
  {
    stationuuid: 'f7afd469-77b0-4950-b17e-ff82eaa291d8',
    name:         'ICI 100% Chanson française',
    country:      'France',
    tags:         "variété française 80's 90's & 2000's",
    bitrate:      192,
    url_resolved: 'https://icecast.radiofrance.fr/fbchansonfrancaise-hifi.aac',
    favicon:      'https://www.francebleu.fr/favicons/apple-touch-icon-180x180.png',
  },
];

// ---------------------------------------------------------------------------
// 2. Blacklist d'UUIDs — résultats API à toujours exclure
// ---------------------------------------------------------------------------

/**
 * Ajouter ici l'UUID d'une station API remontée mais non souhaitée.
 * Récupérer l'UUID depuis le champ `stationuuid` d'un résultat API.
 * @type {Set<string>}
 */
export const EXCLUDED_UUIDS = new Set([
  // Exemples :
  // '96202f73-0601-11e8-ae97-52543be04c81', // station avec flux mort
]);

// ---------------------------------------------------------------------------
// 3. Filtre de qualité automatique
// ---------------------------------------------------------------------------

/**
 * Filtre de premier niveau : retire les stations de mauvaise qualité technique.
 * Critères :
 *  - url_resolved doit être une URL http(s) valide
 *  - bitrate 0 est accepté (inconnu), mais < 48 est rejeté
 * @param {import('./radioAPI.js').Station[]} stations
 * @returns {import('./radioAPI.js').Station[]}
 */
export function autoFilter(stations) {
  return stations.filter(s => {
    // URL de flux obligatoire et valide
    if (!s.url_resolved || !s.url_resolved.startsWith('http')) return false;
    // Bitrate : 0 = inconnu (toléré), < 48 = trop faible
    if (s.bitrate > 0 && s.bitrate < 48) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// 4. Application de la blacklist
// ---------------------------------------------------------------------------

/**
 * Retire les stations dont l'UUID figure dans EXCLUDED_UUIDS.
 * @param {import('./radioAPI.js').Station[]} stations
 * @returns {import('./radioAPI.js').Station[]}
 */
export function applyExclusions(stations) {
  if (!EXCLUDED_UUIDS.size) return stations;
  return stations.filter(s => !EXCLUDED_UUIDS.has(s.stationuuid));
}
