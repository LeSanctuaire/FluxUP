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
    stationuuid: 'c55d8846-85e5-496a-a2b7-80228a9ef6c8',
    name:         'Jazz de Ville',
    country:      'Netherlands',
    tags:         'jazz, smooth jazz',
    bitrate:      128,
    url_resolved: 'https://onair22.xdevel.com/proxy/xautocloud_kkyb_420?mp=/stream',
    favicon:      'https://www.jazzdeville.com/favicon/jazzdeville/apple-touch-icon.png',
  },
  {
    stationuuid: '0e0f2961-5c53-4c52-af70-eebe1b2af496',
    name:         '24-7 Psydelic Rock',
    country:      'United Kingdom',
    tags:         'psychedelic, rock',
    bitrate:      128,
    url_resolved: 'http://antares.dribbcast.com:4289/stream',
    favicon:      'https://24-7nicheradio.com/wp-content/uploads/2017/04/psychedelic.png',
  },
  {
    stationuuid: '544af272-768f-4ccf-81f5-ac1dd72be2b6',
    name:         'Radio Grenouille',
    country:      'France',
    tags:         'eclectic, community, independant',
    bitrate:      256,
    url_resolved: 'https://live.radiogrenouille.com:8443/live',
    favicon:      'https://www.radiogrenouille.com/wp-content/uploads/2023/05/grenouille_final.png',
  },
  {
    stationuuid: 'ce18872f-ed72-4ac7-a93e-07ae3fe7b40b',
    name:         'Musike Lake',
    country:      'USA',
    tags:         'relaxation, chill, meditation, nature sounds',
    bitrate:      64,
    url_resolved: 'http://nap.casthost.net:8626/stream',
    favicon:      'https://musiclake.com/wp-content/uploads/cropped-musiclake-lg-180x180.png',
  },
  {
    stationuuid: 'a3253a96-a1ba-4cf5-bf4b-ec7988afcfd3',
    name:         'Reggae Chill Café',
    country:      'Canada',
    tags:         'reggae, chill, dancehall, tropical',
    bitrate:      128,
    url_resolved: 'https://maggie.torontocast.com:2020/stream/reggaechillcafe',
    favicon:      '',
  },
  {
    stationuuid: '5dc97c2f-566f-47df-8236-021db5906dde',
    name:         'Bach Classical',
    country:      'Germany',
    tags:         'classical, bach, symphonic',
    bitrate:      192,
    url_resolved: 'https://stream.0nlineradio.com/bach?ref=radiobrowser',
    favicon:      'https://i.ibb.co/n1CQpDf/BACH-NEW.jpg',
  },
  {
    stationuuid: 'ac9c27f8-ed13-40be-81cb-8e90abb1d2a8',
    name:         'Graffiti Urbain',
    country:      'France',
    tags:         'alternative, urbain, independant',
    bitrate:      128,
    url_resolved: 'https://diffusion.lafrap.fr/graffiti.mp3',
    favicon:      'https://www.graffitiradio.fr/favicon.ico',
  },
  {
    stationuuid: '9643c1f3-0601-11e8-ae97-52543be04c81',
    name:         'Comala',
    country:      'France',
    tags:         'afro, funk, soul, jazz, hiphop, groove, house',
    bitrate:      128,
    url_resolved: 'https://play.radioking.io/supag',
    favicon:      'https://www.comalaradio.com/favicon.ico',
  },
  {
    stationuuid: '0deb7fbb-71e4-422c-8124-884e2ba74aa2',
    name:         'Pinata',
    country:      'France',
    tags:         'electronica, hiphop, jazz',
    bitrate:      128,
    url_resolved: 'https://listen.radioking.com/radio/96031/stream/134656',
    favicon:      'https://i1.sndcdn.com/avatars-WNhpWtZWyficOMFg-CT1Hyw-t200x200.jpg',
  },
  {
    stationuuid: '9c258e1a-c4ea-4986-ae99-20dfda43dece',
    name:         'Liberté FM',
    country:      'France',
    tags:         'hits, local, news',
    bitrate:      192,
    url_resolved: 'https://stream.libertefm.fr/libertefm.192.mp3',
    favicon:      'https://libertefm.fr/upload/logos/touch-icon.png',
  },
  {
    stationuuid: 'f02a2856-5044-4b35-a7a2-341d4124fc95',
    name:         'Electrons Libres',
    country:      'Switzerland',
    tags:         'independant, alternative',
    bitrate:      192,
    url_resolved: 'https://listen.radioking.com/radio/427889/stream/481505',
    favicon:      'https://electronslibres.ch/wp-content/uploads/2021/06/cropped-LogoRadioSimpleSansTxt-1.png',
  },
  {
    stationuuid: '8479744f-4ac3-11ea-b877-52543be04c81',
    name:         'Libre@Toi',
    country:      'France',
    tags:         'la voix du lat, associatif, local',
    bitrate:      0,
    url_resolved: 'http://vdl.stream-lat.org:8000/voixdulat_ogg',
    favicon:      '',
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

/**
 * Blacklist par nom de station (insensible à la casse).
 * Utile quand l'UUID n'est pas connu.
 * @type {Set<string>}
 */
export const EXCLUDED_NAMES = new Set([
  'chilltrax',
  'izlam 4',
  'anima amoris',
  'radio caprice',
  'toksyna',
  'jazz manouche',
  'kbuu',
  'fmr radyo',
  'costa del mal',
  'yoga chill',
  'radio art',
  'deejay',
  'reyfm',
  'technolovers',
  'psytrance',
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
  return stations.filter(s => {
    if (EXCLUDED_UUIDS.has(s.stationuuid)) return false;
    const nameLow = s.name?.toLowerCase().trim() ?? '';
    if ([...EXCLUDED_NAMES].some(n => nameLow.includes(n))) return false;
    return true;
  });
}
