#!/usr/bin/env node

/**
 * Fetch Apple Podcasts episode IDs using iTunes API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APPLE_SHOW_ID = '1790739651';

async function fetchAppleEpisodes() {
  // iTunes API endpoint for fetching podcast episodes
  const apiUrl = `https://itunes.apple.com/lookup?id=${APPLE_SHOW_ID}&country=US&media=podcast&entity=podcastEpisode&limit=50`;
  
  console.log('Fetching episodes from Apple Podcasts API...');
  console.log(`API URL: ${apiUrl}\n`);
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.resultCount === 0) {
      console.error('No results found for podcast ID:', APPLE_SHOW_ID);
      return;
    }
    
    // First result is the podcast info, rest are episodes
    const podcast = data.results[0];
    const episodes = data.results.slice(1);
    
    console.log(`Found podcast: ${podcast.collectionName}`);
    console.log(`Total episodes found: ${episodes.length}\n`);
    
    // Map episodes to extract IDs and titles
    const episodeMap = {};
    
    episodes.forEach((episode, index) => {
      // Extract episode number from title if possible
      const titleMatch = episode.trackName.match(/^(\d+)\./);
      const episodeNum = titleMatch ? parseInt(titleMatch[1]) : null;
      
      const episodeInfo = {
        trackId: episode.trackId,
        trackName: episode.trackName,
        releaseDate: episode.releaseDate,
        description: episode.description?.substring(0, 100) + '...',
        episodeUrl: episode.episodeUrl,
        collectionViewUrl: episode.collectionViewUrl,
        trackViewUrl: episode.trackViewUrl
      };
      
      if (episodeNum) {
        episodeMap[episodeNum] = episodeInfo;
      }
      
      console.log(`Episode ${episodeNum || '?'}: ${episode.trackName}`);
      console.log(`  Track ID: ${episode.trackId}`);
      console.log(`  View URL: ${episode.trackViewUrl}`);
      console.log('');
    });
    
    // Save the Apple episode data
    const outputFile = path.join(__dirname, '..', '_cache', 'apple-episodes.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      podcast,
      episodes,
      episodeMap
    }, null, 2));
    
    console.log(`\nApple episode data saved to: ${outputFile}`);
    
    // Now let's update our platform links with actual Apple IDs
    const platformLinksFile = path.join(__dirname, '..', 'src', '_data', 'platformLinks.json');
    let platformLinks = {};
    try {
      platformLinks = JSON.parse(fs.readFileSync(platformLinksFile, 'utf8'));
    } catch (error) {
      // Try cache fallback
      const cacheFile = path.join(__dirname, '..', '_cache', 'platform-links.json');
      try {
        platformLinks = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        console.log('No existing platform links found, starting fresh');
      }
    }
    
    Object.keys(platformLinks).forEach(episodeNum => {
      const appleEpisode = episodeMap[parseInt(episodeNum)];
      if (appleEpisode) {
        platformLinks[episodeNum].apple = {
          webUrl: appleEpisode.trackViewUrl,
          episodeId: appleEpisode.trackId,
          trackName: appleEpisode.trackName
        };
      }
    });
    
    // Save updated platform links
    fs.writeFileSync(platformLinksFile, JSON.stringify(platformLinks, null, 2));
    console.log(`Updated platform links with Apple episode IDs`);
    
  } catch (error) {
    console.error('Error fetching Apple episodes:', error);
  }
}

fetchAppleEpisodes();