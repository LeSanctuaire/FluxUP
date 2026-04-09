#!/usr/bin/env node

/**
 * Script pour récupérer tous les videoIds d'une playlist YouTube
 * Usage: YOUTUBE_API_KEY=ta_clé node getPlaylistVideos.js PLnV2rehNHJEW5Jwo4MLYcs4xbS37g9tHr
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = process.argv[2];

// ── Validation ───────────────────────────────────────────────────────────────
if (!API_KEY) {
  console.error('❌ Erreur: Variable YOUTUBE_API_KEY non définie');
  console.log('\n📚 Instructions:');
  console.log('1. Va sur: https://console.cloud.google.com/');
  console.log('2. Crée un projet et active "YouTube Data API v3"');
  console.log('3. Génère une clé API (type: Clé API)');
  console.log('4. Exécute:\n');
  console.log('   YOUTUBE_API_KEY=ta_clé node scripts/getPlaylistVideos.js PLnV2rehNHJEW5Jwo4MLYcs4xbS37g9tHr\n');
  process.exit(1);
}

if (!PLAYLIST_ID) {
  console.error('❌ Erreur: playlistId manquant');
  console.log('\nUsage: YOUTUBE_API_KEY=clé node getPlaylistVideos.js <PLAYLIST_ID>\n');
  process.exit(1);
}

// ── Requête HTTPS ────────────────────────────────────────────────────────────
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Erreur parsing JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// ── Récupérer les videoIds ──────────────────────────────────────────────────
async function getPlaylistVideos(playlistId) {
  const videoIds = [];
  let nextPageToken;
  let totalResults = 0;
  let pageCount = 0;

  try {
    console.log(`\n📺 Récupération des vidéos: ${playlistId}`);

    do {
      pageCount++;
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.append('key', API_KEY);
      url.searchParams.append('playlistId', playlistId);
      url.searchParams.append('part', 'contentDetails');
      url.searchParams.append('maxResults', '50');

      if (nextPageToken) {
        url.searchParams.append('pageToken', nextPageToken);
      }

      console.log(`⏳ Page ${pageCount}...`);

      const response = await makeRequest(url.toString());

      // Vérifier erreur API
      if (response.error) {
        throw new Error(`Erreur API (${response.error.code}): ${response.error.message}`);
      }

      if (!response.items) {
        throw new Error('Réponse API invalide: pas de "items"');
      }

      totalResults = response.pageInfo?.totalResults || 0;

      // Extraire les videoIds
      response.items.forEach(item => {
        if (item.contentDetails?.videoId) {
          videoIds.push(item.contentDetails.videoId);
        }
      });

      nextPageToken = response.nextPageToken;
      console.log(`   ✅ ${videoIds.length}/${totalResults}`);

    } while (nextPageToken);

    return videoIds;

  } catch (error) {
    console.error(`\n❌ Erreur: ${error.message}\n`);
    process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const videoIds = await getPlaylistVideos(PLAYLIST_ID);

  if (videoIds.length === 0) {
    console.error('\n❌ Aucune vidéo trouvée\n');
    process.exit(1);
  }

  // Créer le dossier output s'il n'existe pas
  const outputDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sauvegarder le JSON
  const fileName = path.join(outputDir, `playlist_${PLAYLIST_ID}.json`);
  fs.writeFileSync(fileName, JSON.stringify(videoIds, null, 2));

  console.log(`\n✨ Succès!`);
  console.log(`📁 Fichier créé: ${fileName}`);
  console.log(`📊 Total: ${videoIds.length} vidéos\n`);
}

main();
