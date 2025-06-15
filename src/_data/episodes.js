// This file is now ONLY for fetching raw data.
// The intelligence lives in the scaffolding script.

import Parser from "rss-parser";

const parser = new Parser();
const RSS_URL = "https://anchor.fm/s/ffb36578/podcast/rss";

/**
 * Generates a clean, URL-friendly slug from an episode title.
 * @param {string} title The original episode title.
 * @returns {string} The generated slug.
 */
function generateSlug(title) {
  if (!title) return "";

  const cleanedTitle = title.replace(/^\d+\.\s*/, "").replace(/\s+w\/.*$/i, ""); // Case-insensitive removal of " w/..."

  const slug = cleanedTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const words = slug.split("-");
  return words.slice(0, 8).join("-");
}

export const fetchEpisodes = async () => {
  console.log(`Fetching raw RSS feed...`);
  const feed = await parser.parseURL(RSS_URL);

  // Process into the clean format we need for scaffolding
  return feed.items.map((item, index) => {
    const originalTitle = item.title || "";
    let displayTitle = originalTitle;
    let guest = null;

    // Regex to find " w/ guest" and extract the guest handle (with or without @)
    const guestMatch = originalTitle.match(/\s+w\/\s+(.*)$/i);
    if (guestMatch) {
      guest = guestMatch[1]; // The captured group (guest)
      displayTitle = originalTitle.replace(guestMatch[0], ""); // The title without the guest part
    }
    // Also strip the number prefix for the display title
    displayTitle = displayTitle.replace(/^\d+\.\s*/, "");

    return {
      guid: item.guid,
      title: originalTitle, // Keep the original for reference
      displayTitle: displayTitle,
      guest: guest,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
      content: item.content,
      enclosure: item.enclosure,
      episodeNumber: feed.items.length - index,
      slug: generateSlug(originalTitle),
      publishedDate: new Date(item.pubDate),
      audioUrl: item.enclosure?.url,
      duration: item.itunes?.duration,
      summary: item.itunes?.summary || item.contentSnippet,
    };
  });
};

// Default export is no longer needed as Eleventy will use collections.
export default () => {
  console.log(
    "NOTE: Episode data now comes from collections, not this data file. Run `npm run fetch-episodes` to create content."
  );
  return [];
};
