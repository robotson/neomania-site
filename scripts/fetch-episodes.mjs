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

// Check for supplemental content in episode directory
const checkSupplementalContent = (episodeDir) => {
  const supplementalFiles = {
    hasTranscript: fs.existsSync(path.join(episodeDir, "transcript.md")),
    hasExpandedNotes: fs.existsSync(path.join(episodeDir, "expanded-notes.md")),
    hasGuestLinks: fs.existsSync(path.join(episodeDir, "guest-links.md")),
    hasCorrections: fs.existsSync(path.join(episodeDir, "corrections.md")),
    hasMedia: fs.existsSync(path.join(episodeDir, "media")),
  };

  const hasSupplemental = Object.values(supplementalFiles).some(Boolean);

  return { ...supplementalFiles, hasSupplemental };
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
    // Use episode number for directory name (zero-padded)
    const episodeNumStr = episode.episodeNumber.toString().padStart(2, "0");
    const episodeDir = path.join(EPISODES_DIR, episodeNumStr);
    const indexFile = path.join(episodeDir, "index.md");

    // Skip if index.md already exists (don't overwrite manual edits)
    if (fs.existsSync(indexFile)) {
      continue;
    }

    console.log(`🆕 Creating new episode directory: ${episodeNumStr}/`);

    // Create episode directory
    if (!fs.existsSync(episodeDir)) {
      fs.mkdirSync(episodeDir, { recursive: true });
    }

    // Check for any supplemental content
    const supplemental = checkSupplementalContent(episodeDir);

    // ALWAYS process HTML content through turndown for the main body
    const htmlContent = episode.summary || episode.content || "";
    const markdownContent = turndownService.turndown(htmlContent);

    // ALWAYS process the contentSnippet through turndown too, in case it has HTML
    const rawSummary = episode.contentSnippet || episode.summary || "";
    const cleanSummary = turndownService.turndown(rawSummary);
    const summaryText = escapeYaml(cleanSummary);

    // NEW LOGIC: Extract the first line as the subtitle
    const subtitle = escapeYaml((rawSummary.split("\n")[0] || "").trim());

    // Create the YAML front matter with updated permalink structure
    const frontMatter = `---
layout: episode.njk
title: "${escapeYaml(episode.title)}"
displayTitle: "${escapeYaml(episode.displayTitle)}"
guest: ${episode.guest ? `"${escapeYaml(episode.guest)}"` : "null"}
date: ${episode.publishedDate.toISOString()}
guid: ${episode.guid}
episodeNumber: ${episode.episodeNumber}
duration: "${episode.duration}"
audioUrl: ${episode.audioUrl}
summary: "${summaryText}"
subtitle: "${subtitle}"
permalink: /ep/{{ episodeNumber | padStart(2, '0') }}/
hasSupplemental: ${supplemental.hasSupplemental}
hasTranscript: ${supplemental.hasTranscript}
hasExpandedNotes: ${supplemental.hasExpandedNotes}
hasGuestLinks: ${supplemental.hasGuestLinks}
hasCorrections: ${supplemental.hasCorrections}
hasMedia: ${supplemental.hasMedia}
tags:
  - episodes
---

${markdownContent}
`;

    fs.writeFileSync(indexFile, frontMatter);
  }

  console.log("✅ Episode scaffolding complete.");
}

scaffoldEpisodes().catch(console.error);
