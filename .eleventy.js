export default function (eleventyConfig) {
  // Copy the `css` directory to the output
  eleventyConfig.addPassthroughCopy("css");

  // Copy images directory
  eleventyConfig.addPassthroughCopy("images");

  // Copy js directory
  eleventyConfig.addPassthroughCopy("js");

  // Custom episodes collection - explicitly collect from numbered directories
  eleventyConfig.addCollection("episodes", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/episodes/*/index.md")
      .sort((a, b) => a.data.episodeNumber - b.data.episodeNumber);
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
