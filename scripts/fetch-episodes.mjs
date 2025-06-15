import { fetchEpisodes } from "../src/_data/episodes.js";
import episodeAnnotations from "../src/_data/episodeAnnotations.js";
import fs from "fs";
import path from "path";
import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

const EPISODES_DIR = path.join(process.cwd(), "src/episodes");

// Properly escape text for YAML
const escapeYaml = (text) => {
  if (typeof text !== "string") return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
};

async function scaffoldEpisodes() {
  console.log("🏗️  Running episode scaffold...");
  const rawEpisodes = await fetchEpisodes();

  // MERGE with annotations first to get the final data, including custom slugs
  const finalEpisodes = episodeAnnotations.merge(rawEpisodes);

  if (!fs.existsSync(EPISODES_DIR)) {
    fs.mkdirSync(EPISODES_DIR, { recursive: true });
  }

  for (const episode of finalEpisodes) {
    // Use clean slug for filename (no episode number prefix)
    const fileName = `${episode.slug}.md`;
    const filePath = path.join(EPISODES_DIR, fileName);

    if (fs.existsSync(filePath)) {
      continue;
    }

    console.log(`🆕 Creating new episode file: ${fileName}`);

    // ALWAYS process HTML content through turndown for the main body
    const htmlContent = episode.summary || episode.content || "";
    const markdownContent = turndownService.turndown(htmlContent);

    // ALWAYS process the contentSnippet through turndown too, in case it has HTML
    const rawSummary = episode.contentSnippet || episode.summary || "";
    const cleanSummary = turndownService.turndown(rawSummary);
    const summaryText = escapeYaml(cleanSummary);

    // Create the YAML front matter
    const frontMatter = `---
layout: episode.njk
title: "${escapeYaml(episode.title)}"
date: ${episode.publishedDate.toISOString()}
guid: ${episode.guid}
episodeNumber: ${episode.episodeNumber}
duration: "${episode.duration}"
audioUrl: ${episode.audioUrl}
summary: "${summaryText}"
permalink: /ep/${episode.slug}/
tags:
  - episodes
---

${markdownContent}
`;

    fs.writeFileSync(filePath, frontMatter);
  }

  console.log("✅ Episode scaffolding complete.");
}

scaffoldEpisodes().catch(console.error);
