// This file is now ONLY for fetching raw data.
// The intelligence lives in the scaffolding script.

import Parser from "rss-parser";

const parser = new Parser();
const RSS_URL = "https://anchor.fm/s/ffb36578/podcast/rss";

export const fetchEpisodes = async () => {
  console.log(`Fetching raw RSS feed...`);
  const feed = await parser.parseURL(RSS_URL);

  // Process into the clean format we need for scaffolding
  return feed.items.map((item, index) => ({
    guid: item.guid,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    contentSnippet: item.contentSnippet,
    content: item.content,
    enclosure: item.enclosure,
    episodeNumber: feed.items.length - index,
    slug: (item.title || "")
      .replace(/\s+w\/.*$/i, "") // Remove " w/..." and everything after it
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50)
      .replace(/-$/g, ""),
    publishedDate: new Date(item.pubDate),
    audioUrl: item.enclosure?.url,
    duration: item.itunes?.duration,
    summary: item.itunes?.summary || item.contentSnippet,
  }));
};

// Default export is no longer needed as Eleventy will use collections.
export default () => {
  console.log(
    "NOTE: Episode data now comes from collections, not this data file. Run `npm run fetch-episodes` to create content."
  );
  return [];
};
