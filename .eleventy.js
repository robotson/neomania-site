import fs from "fs";
import episodeAnnotations from "./src/_data/episodeAnnotations.js";

// Load platform links if they exist
let platformLinks = {};
try {
  const platformLinksData = fs.readFileSync("_cache/platform-links.json", "utf8");
  platformLinks = JSON.parse(platformLinksData);
} catch (error) {
  console.warn("Platform links not found, run scripts/fetch-apple-episodes.mjs to generate them");
}

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

export default function (eleventyConfig) {
  // Copy the `css` directory to the output
  eleventyConfig.addPassthroughCopy("css");

  // Copy images directory
  eleventyConfig.addPassthroughCopy("images");

  // Copy js directory
  eleventyConfig.addPassthroughCopy("js");

  // Custom episodes collection - explicitly collect from numbered directories
  eleventyConfig.addCollection("episodes", function (collectionApi) {
    const episodes = collectionApi
      .getFilteredByGlob("src/episodes/*/index.md")
      .sort((a, b) => a.data.episodeNumber - b.data.episodeNumber);
    
    // Process each episode to add slug and merge annotations
    episodes.forEach(episode => {
      const episodeData = episode.data;
      
      // Generate slug if it doesn't exist
      if (!episodeData.slug) {
        episodeData.slug = generateSlug(episodeData.title);
      }
      
      // Merge annotations if they exist for this episode
      const annotation = episodeAnnotations[episodeData.slug] || {};
      
      // Get platform links for this episode
      const episodePlatformLinks = platformLinks[episodeData.episodeNumber] || {};
      
      // Merge annotation data into episode data
      Object.assign(episodeData, {
        ...episodeAnnotations._defaults,
        ...annotation,
        
        // Override slug if a custom one exists in the annotation
        slug: annotation.customSlug || episodeData.slug,
        
        // Special handling for arrays - combine rather than replace
        tags: [...(episodeAnnotations._defaults.tags || []), ...(annotation.tags || [])],
        guestLinks: [
          ...(episodeAnnotations._defaults.guestLinks || []),
          ...(annotation.guestLinks || []),
        ],
        corrections: [
          ...(episodeAnnotations._defaults.corrections || []),
          ...(annotation.corrections || []),
        ],
        
        // Override logic: annotation takes precedence, fallback to original
        title: annotation.customTitle || episodeData.title,
        notes: annotation.expandedNotes || episodeData.summary,
        image: annotation.customImage || episodeData.image,
        
        // Platform links
        spotifyUrl: episodePlatformLinks.spotify?.webUrl || null,
        appleUrl: episodePlatformLinks.apple?.webUrl || null,
        
        // Computed fields
        hasCustomContent: !!(
          annotation.customTitle ||
          annotation.expandedNotes ||
          annotation.transcript ||
          annotation.guestLinks?.length ||
          annotation.corrections?.length
        ),
        hasTranscript: !!annotation.transcript,
        lastAnnotated: annotation.lastUpdated || null,
      });
    });
    
    return episodes;
  });

  // Custom filter to format duration from "HH:MM:SS" to "XH Ymin"
  eleventyConfig.addFilter("formatDuration", (durationString) => {
    if (!durationString || typeof durationString !== "string") {
      return "";
    }
    const parts = durationString.split(":").map((part) => parseInt(part, 10));
    if (parts.length === 3) {
      // HH:MM:SS
      const [hours, minutes] = parts;
      return `${hours}Hr ${minutes}min`;
    } else if (parts.length === 2) {
      // MM:SS
      const [minutes] = parts;
      return `${minutes}min`;
    }
    return durationString; // Fallback
  });

  // Custom filter to pad strings (like JavaScript's padStart method)
  eleventyConfig.addFilter("padStart", (str, targetLength, padString) => {
    const string = String(str);
    if (string.length >= targetLength) {
      return string;
    }
    padString = padString || " ";
    const padLength = targetLength - string.length;
    let pad = "";
    for (let i = 0; i < padLength; i++) {
      pad += padString;
    }
    return (pad + string).slice(-targetLength);
  });

  // Custom filter to format dates
  eleventyConfig.addFilter("date", (dateInput, format) => {
    if (!dateInput) return "";

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;

    // Simple date formatting for MM/dd/yy format
    if (format === "MM/dd/yy") {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${day}/${year}`;
    }

    // Fallback to default date string
    return date.toDateString();
  });

  // Icon Shortcode
  eleventyConfig.addShortcode("icon", function (name) {
    const iconPath = `./src/_includes/icons/${name}.svg`;
    try {
      return fs.readFileSync(iconPath, "utf8");
    } catch (e) {
      return `<!-- Icon not found: ${name} -->`;
    }
  });

  // Return your configuration object
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}
