/**
 * services/localClassiques.js
 * Récupère les clips de la playlist YouTube "Classiques Rap FR"
 * via YouTube Data API v3.
 */

const PLAYLIST_ID = 'PLnV2rehNHJEVhwoOadKlmYYXvqHGhw9vD';
const API_KEY     = import.meta.env.VITE_YOUTUBE_API_KEY;

/** @typedef {{ youtubeId: string, title: string, artist: string, thumbnail: string }} ClassiqueClip */

/**
 * Charge jusqu'à 50 clips de la playlist, les mélange aléatoirement
 * et retourne les `limit` premiers.
 * @param {number} [limit=25]
 * @returns {Promise<ClassiqueClip[]>}
 */
export async function fetchClassiquesRapFR(limit = 25) {
  // maxResults=50 → plafond YouTube API (une seule page suffit pour la playlist)
  const url = `https://www.googleapis.com/youtube/v3/playlistItems`
    + `?part=snippet&maxResults=50`
    + `&playlistId=${PLAYLIST_ID}`
    + `&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YouTube API error ${res.status}: ${body}`);
  }

  const data = await res.json();

  const clips = (/** @type {any[]} */ (data.items ?? []))
    .filter((/** @type {any} */ item) => item.snippet?.resourceId?.videoId)
    .map((/** @type {any} */ item) => {
      const s  = item.snippet;
      const id = s.resourceId.videoId;
      return {
        youtubeId: id,
        title:     s.title,
        artist:    s.videoOwnerChannelTitle ?? '',
        thumbnail: s.thumbnails?.high?.url
                ?? s.thumbnails?.medium?.url
                ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    });

  // Mélange aléatoire (Fisher-Yates)
  for (let i = clips.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clips[i], clips[j]] = [clips[j], clips[i]];
  }

  return clips.slice(0, limit);
}
