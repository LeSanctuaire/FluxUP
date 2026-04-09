/**
 * core/randomSourceFactory.svelte.js
 * Factory pour sélectionner aléatoirement parmi 5 sources.
 * Utilise iframes natives YouTube (pas YouTube Player API → aucun bug).
 *
 * Sources :
 * - Clips (YouTube vidéo simple)
 * - Beats Only (YouTube vidéo simple)
 * - La Crypte (YouTube playlist iframe)
 * - Classiques Rap FR (YouTube playlist iframe)
 * - Temple du Roots (YouTube playlist iframe)
 */

import clipsData from '../data/clips.json';
import beatsData from '../data/beats.json';
import playlistData from '../data/playlistVideos.json';

// ── Types JSDoc ──────────────────────────────────────────────────────────────
/**
 * @typedef {Object} SurpriseSource
 * @property {"clip"|"playlist"} type
 * @property {string} embedUrl - YouTube embed iframe src
 * @property {string} title - Titre pour affichage
 * @property {string} [artist] - Artiste(s) pour affichage
 * @property {string} [youtubeId] - Pour lien YouTube + vote (clips seulement)
 * @property {string} [channelId] - Pour lien YouTube (clips seulement)
 * @property {string} source - Source ID ("clips"|"beats"|"crypte"|"classiques"|"reggae")
 */

// ── Fonctions ────────────────────────────────────────────────────────────────

/**
 * Sélectionne un clip aléatoire et retourne son URL embed
 * @returns {SurpriseSource}
 */
function getRandomClip() {
  const pick = clipsData[Math.floor(Math.random() * clipsData.length)];
  return {
    type: 'clip',
    embedUrl: `https://www.youtube.com/embed/${pick.youtubeId}?autoplay=1&rel=0&enablejsapi=1`,
    title: pick.title,
    artist: pick.artists?.join(', '),
    youtubeId: pick.youtubeId,
    channelId: pick.channelId,
    source: 'clips',
  };
}

/**
 * Sélectionne un beat aléatoire et retourne son URL embed
 * @returns {SurpriseSource}
 */
function getRandomBeat() {
  const pick = beatsData[Math.floor(Math.random() * beatsData.length)];
  return {
    type: 'clip',
    embedUrl: `https://www.youtube.com/embed/${pick.youtubeId}?autoplay=1&rel=0&enablejsapi=1`,
    title: pick.title,
    artist: pick.artist,
    youtubeId: pick.youtubeId,
    source: 'beats',
  };
}

/**
 * Sélectionne un clip aléatoire d'une playlist et le joue comme vidéo simple
 * (évite limitation YouTube videoseries qui démarre toujours sur le même clip)
 * @param {"crypte"|"classiques"|"reggae"} name
 * @returns {SurpriseSource}
 */
function getPlaylist(name) {
  const playlistInfo = {
    crypte: { title: 'La Crypte' },
    classiques: { title: 'Classiques Rap FR' },
    reggae: { title: 'Temple du Roots' },
  };

  const info = playlistInfo[name];
  const videoIds = playlistData[name];
  const randomVideoId = videoIds[Math.floor(Math.random() * videoIds.length)];

  return {
    type: 'clip', // Traité comme un clip simple pour que le conditional UI fonctionne
    embedUrl: `https://www.youtube.com/embed/${randomVideoId}?autoplay=1&rel=0&enablejsapi=1`,
    title: info.title,
    artist: 'Playlist',
    youtubeId: randomVideoId, // Ajouter l'ID pour le player YouTube
    source: name, // Identifier comme venant d'une playlist
  };
}

/**
 * Sélectionne aléatoirement une source parmi les 5 disponibles.
 * Pondération :
 * - 50% Clips
 * - 20% Beats
 * - 10% La Crypte
 * - 10% Classiques Rap FR
 * - 10% Temple du Roots
 *
 * @returns {SurpriseSource}
 */
export function pickRandomSource() {
  const rand = Math.random() * 100;

  if (rand < 50) {
    return getRandomClip();
  } else if (rand < 70) {
    return getRandomBeat();
  } else if (rand < 80) {
    return getPlaylist('crypte');
  } else if (rand < 90) {
    return getPlaylist('classiques');
  } else {
    return getPlaylist('reggae');
  }
}
