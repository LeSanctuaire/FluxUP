/**
 * services/clipsAPI.js
 * Intégration YouTube Data API v3
 * Docs : https://developers.google.com/youtube/v3
 *
 * ⚠️ Requiert une clé API YouTube — à stocker dans .env :
 *    VITE_YOUTUBE_API_KEY=ta_cle_ici
 */

const YT_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? '';

/**
 * Recherche des clips YouTube.
 * @param {string} query
 * @param {number} [maxResults]
 * @returns {Promise<Clip[]>}
 */
export async function searchClips(query, maxResults = 12) {
  if (!API_KEY) {
    console.warn('[clipsAPI] Clé API YouTube manquante (VITE_YOUTUBE_API_KEY)');
    return MOCK_CLIPS.filter(c =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.artist.toLowerCase().includes(query.toLowerCase())
    );
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Musique
      maxResults: String(maxResults),
      key: API_KEY,
    });
    const res = await fetch(`${YT_BASE}/search?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.items ?? []).map(item => ({
      id:        item.id.videoId,
      title:     item.snippet.title,
      artist:    item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
      genre:     null,
      views:     null,
    }));
  } catch (err) {
    console.warn('[clipsAPI] searchClips:', err);
    return [];
  }
}

/**
 * Récupère les détails d'une vidéo par ID.
 * @param {string} videoId
 * @returns {Promise<ClipDetail | null>}
 */
export async function getClipById(videoId) {
  if (!videoId) return null;

  // Fallback sur les données mock
  const mock = MOCK_CLIPS.find(c => c.id === videoId);

  if (!API_KEY) return mock ?? null;

  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoId,
      key: API_KEY,
    });
    const res = await fetch(`${YT_BASE}/videos?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return mock ?? null;

    return {
      id:          item.id,
      title:       item.snippet.title,
      artist:      item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail:   item.snippet.thumbnails?.maxres?.url ?? item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt?.split('T')[0],
      views:       Number(item.statistics?.viewCount ?? 0).toLocaleString('fr-FR'),
      tags:        item.snippet.tags?.slice(0, 6) ?? [],
      genre:       null,
    };
  } catch (err) {
    console.warn('[clipsAPI] getClipById:', err);
    return mock ?? null;
  }
}

/**
 * Récupère les clips populaires (mock ou API).
 * @param {number} [limit]
 * @returns {Promise<Clip[]>}
 */
export async function getTopClips(limit = 10) {
  if (!API_KEY) return MOCK_CLIPS.slice(0, limit);
  return searchClips('top music clips', limit);
}

// ----- Données mock (quand pas de clé API) -----
/** @type {Clip[]} */
const MOCK_CLIPS = [
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley',  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', genre: 'Pop',      views: '1.4B', duration: '3:32' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You',            artist: 'Ed Sheeran',   thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg', genre: 'Pop',      views: '6B',   duration: '3:53' },
  { id: 'kXYiU_JCYtU', title: 'Numb',                    artist: 'Linkin Park',  thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg',  genre: 'Rock',     views: '720M', duration: '3:05' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars',          artist: 'OneRepublic',  thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg',  genre: 'Pop Rock', views: '3B',   duration: '4:17' },
  { id: 'CevxZvSJLk8', title: 'Roar',                    artist: 'Katy Perry',   thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg',  genre: 'Pop',      views: '2.6B', duration: '3:44' },
];

/**
 * @typedef {{ id: string, title: string, artist: string, thumbnail: string, genre: string|null, views: string|null, duration?: string }} Clip
 * @typedef {Clip & { description?: string, publishedAt?: string, tags?: string[] }} ClipDetail
 */
