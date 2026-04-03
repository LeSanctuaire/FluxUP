/**
 * services/votesAPI.js
 * Client léger pour l'API votes (Cloudflare Worker).
 *
 * Configuration :
 *   Créer sanctum-app/.env avec :
 *   VITE_VOTES_API_URL=https://fluxup-votes-api.<subdomain>.workers.dev
 *
 * Si la variable est absente ou vide, toutes les fonctions retournent
 * des valeurs neutres sans erreur (mode dégradé silencieux).
 */

/** URL du Worker — injectée par Vite au build via .env */
const API_URL = (import.meta.env?.VITE_VOTES_API_URL ?? '').replace(/\/$/, '');

/** Préfixe localStorage pour l'état "déjà voté" côté client */
const LS_PREFIX = 'fluxup_voted_';

// ─── Cache mémoire court (évite appels répétés dans la même session) ─────────
const _mem = new Map();

function cacheGet(key) {
  const e = _mem.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) { _mem.delete(key); return null; }
  return e.val;
}

function cacheSet(key, val, ttlMs = 30_000) {
  _mem.set(key, { val, exp: Date.now() + ttlMs });
}

// ─────────────────────────────────────────────────────────────────────────────
// API publique
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie si l'utilisateur a déjà voté pour ce clip (localStorage uniquement).
 * @param {string} youtubeId
 * @returns {boolean}
 */
export function hasVotedLocally(youtubeId) {
  try { return localStorage.getItem(`${LS_PREFIX}${youtubeId}`) === '1'; }
  catch { return false; }
}

/**
 * Envoie un vote pour un clip.
 * @param {string} youtubeId
 * @returns {Promise<{ success: boolean, votes: number, error?: string }>}
 */
export async function postVote(youtubeId) {
  if (!API_URL) return { success: false, votes: 0, error: 'no_api' };

  try {
    const res  = await fetch(`${API_URL}/vote`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ youtubeId }),
    });
    const data = await res.json();

    if (data.success) {
      // Persister côté client
      try { localStorage.setItem(`${LS_PREFIX}${youtubeId}`, '1'); } catch {}
      // Invalider les caches mémoire concernés
      _mem.delete(`votes:${youtubeId}`);
      _mem.delete('top:12');
      _mem.delete('top:6');
    }

    return data;
  } catch {
    return { success: false, votes: 0, error: 'network' };
  }
}

/**
 * Récupère le score de votes d'un clip.
 * @param {string} youtubeId
 * @returns {Promise<number>}
 */
export async function getVotes(youtubeId) {
  if (!API_URL) return 0;

  const key = `votes:${youtubeId}`;
  const hit = cacheGet(key);
  if (hit !== null) return hit;

  try {
    const res  = await fetch(`${API_URL}/votes/${youtubeId}`);
    const data = await res.json();
    const n    = data.votes ?? 0;
    cacheSet(key, n);
    return n;
  } catch { return 0; }
}

/**
 * Récupère le classement global des clips triés par votes.
 * @param {number} [limit=12]
 * @returns {Promise<Array<{ youtube_id: string, vote_count: number }>>}
 */
export async function getTop(limit = 12) {
  if (!API_URL) return [];

  const key = `top:${limit}`;
  const hit = cacheGet(key);
  if (hit !== null) return hit;

  try {
    const res  = await fetch(`${API_URL}/top?limit=${limit}`);
    const data = await res.json();
    cacheSet(key, data, 60_000); // 60s — aligné avec le cache KV du Worker
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
