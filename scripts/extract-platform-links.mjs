#!/usr/bin/env node

/**
 * Extract podcast platform links from RSS data
 * Generates Spotify links from RSS and prepares structure for Apple Podcasts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read cached episode data
const cacheFile = path.join(__dirname, '..', '_cache', 'episodes.json');
const episodesData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

// Platform IDs
const SPOTIFY_SHOW_ID = 'ffb36578';
const APPLE_SHOW_ID = '1790739651'; // Found via Apple Podcasts search

// Extract Spotify episode IDs from the RSS links
const platformLinks = {};

episodesData.episodes.forEach(episode => {
  const episodeNum = episode.episodeNumber;
  
  // Extract Spotify episode ID from the link
  // Format: https://podcasters.spotify.com/pod/show/neomania/episodes/TITLE-EPISODE_ID
  const spotifyMatch = episode.link?.match(/\/episodes\/[^\/]+-([a-z0-9]+)$/i);
  const spotifyEpisodeId = spotifyMatch ? spotifyMatch[1] : null;
  
  platformLinks[episodeNum] = {
    spotify: {
      webUrl: episode.link || null,
      episodeId: spotifyEpisodeId,
      // Direct Spotify app link format
      appUrl: spotifyEpisodeId 
        ? `https://open.spotify.com/episode/${spotifyEpisodeId}`
        : null
    },
    apple: {
      // Apple Podcasts URL format: 
      // https://podcasts.apple.com/us/podcast/PODCAST-NAME/idSHOW_ID?i=EPISODE_ID
      webUrl: APPLE_SHOW_ID ? `https://podcasts.apple.com/us/podcast/neomania/id${APPLE_SHOW_ID}?i=EPISODE_${episodeNum}` : null,
      episodeId: null // Would need to fetch from Apple's API
    },
    anchor: {
      audioUrl: episode.audioUrl,
      rssUrl: `https://anchor.fm/s/${SPOTIFY_SHOW_ID}/podcast/rss`
    }
  };
});

// Output the platform links
console.log('Platform Links for Episodes:');
console.log('============================\n');

Object.entries(platformLinks).forEach(([episodeNum, links]) => {
  console.log(`Episode ${episodeNum}:`);
  console.log(`  Spotify: ${links.spotify.webUrl || 'N/A'}`);
  console.log(`  Apple:   ${links.apple.webUrl || 'Need Apple Podcasts Show ID'}`);
  console.log(`  Audio:   ${links.anchor.audioUrl}`);
  console.log('');
});

// Save to _data directory for Eleventy
const outputFile = path.join(__dirname, '..', 'src', '_data', 'platformLinks.json');
fs.writeFileSync(outputFile, JSON.stringify(platformLinks, null, 2));
console.log(`\nPlatform links saved to: ${outputFile}`);

// Also save to cache for backwards compatibility
const cacheFile = path.join(__dirname, '..', '_cache', 'platform-links.json');
fs.writeFileSync(cacheFile, JSON.stringify(platformLinks, null, 2));

console.log('\nTo find your Apple Podcasts ID:');
console.log('1. Search for "Neomania" on Apple Podcasts');
console.log('2. Click on your show');
console.log('3. Look at the URL - it will contain "id" followed by numbers');
console.log('   Example: https://podcasts.apple.com/us/podcast/neomania/id1740869828');
console.log('4. Add that ID to this script as APPLE_SHOW_ID');