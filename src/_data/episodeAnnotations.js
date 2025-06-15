// Local annotations and customizations for episodes
// This allows you to add custom content, corrections, or enhancements
// without modifying the RSS feed data
//
// Keys should match the episode slug (auto-generated from title)

const episodeAnnotations = {
  // Episode-specific customizations by SLUG
  // Use the slug generated from episode titles as keys

  // Example: "stochastic-funnerism-and-autonomous-media"
  // Uncomment and customize as needed:

  // Test annotation for episode 7
  "stochastic-funnerism-and-autonomous-media": {
    customSlug: "stochastic-funnerism-autonomous-media",
    expandedNotes: `
      <p><strong>Extended Context:</strong> This episode was recorded during a particularly 
      chaotic period in AI development, with new generative media tools dropping weekly.</p>
      
      <p>The discussion of "stochastic funnerism" emerged from @somewheresy's observation 
      that randomness + algorithms = surprisingly compelling art.</p>
    `,
    tags: ["AI", "media", "memes", "internet-culture", "generative-art"],
    featured: true,
    corrections: ["Fixed link to @somewheresy's Bluesky profile in show notes"],
    lastUpdated: "2025-06-14",
  },

  // "7-stochastic-funnerism-and-autonomous-media-w-some": {
  //   // Override RSS title if needed
  //   customTitle: "Stochastic Funnerism (Extended Director's Cut)",
  //
  //   // Site-only enhancements
  //   transcript: "/transcripts/07-stochastic-funnerism.md",
  //   expandedNotes: `
  //     <p>This episode was recorded after a three-hour tangent about Flash games
  //     that didn't make it into the final cut. The chemistry between Lance and
  //     @somewheresy is electric throughout.</p>
  //
  //     <h3>Additional Context</h3>
  //     <p>Referenced but not mentioned: the great YouTube Poop renaissance of 2019...</p>
  //   `,
  //
  //   // Additional guest links beyond what's in RSS
  //   guestLinks: [
  //     { title: "somewheresy's latest art project", url: "https://somewhere.systems/latest" },
  //     { title: "The Flash Game Archive", url: "https://flashgamearchive.com" }
  //   ],
  //
  //   // Episode tags for categorization
  //   tags: ["AI", "media", "memes", "internet-culture", "generative-art"],
  //
  //   // Mark as featured episode
  //   featured: true,
  //
  //   // Custom episode image
  //   customImage: "/images/episodes/07-stochastic-funnerism-hero.jpg",
  //
  //   // Corrections or additions
  //   corrections: [
  //     "Fixed link to @somewheresy's Bluesky profile",
  //     "Added missing reference to YouTube Poop discussion"
  //   ],
  //
  //   // When this annotation was last updated
  //   lastUpdated: "2025-06-14"
  // },

  // Global episode defaults
  _defaults: {
    tags: [],
    featured: false,
    customNotes: null,
    guestLinks: [],
    corrections: [],
  },

  // Utility function to merge annotations with episode data
  merge: function (episodes) {
    return episodes.map((episode) => {
      const annotation = this[episode.slug] || {};

      // Merge with defaults first, then annotation overrides
      const merged = {
        ...episode,
        ...this._defaults,
        ...annotation,

        // Override slug if a custom one exists in the annotation
        slug: annotation.customSlug || episode.slug,

        // Special handling for arrays - combine rather than replace
        tags: [...(this._defaults.tags || []), ...(annotation.tags || [])],
        guestLinks: [
          ...(this._defaults.guestLinks || []),
          ...(annotation.guestLinks || []),
        ],
        corrections: [
          ...(this._defaults.corrections || []),
          ...(annotation.corrections || []),
        ],

        // Override logic: annotation takes precedence, fallback to RSS
        title: annotation.customTitle || episode.title,
        notes: annotation.expandedNotes || episode.summary,
        image: annotation.customImage || episode.image,

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
      };

      return merged;
    });
  },

  // Helper function to get episode by slug
  getBySlug: function (episodes, slug) {
    return episodes.find((ep) => ep.slug === slug);
  },

  // Helper function to get featured episodes
  getFeatured: function (episodes) {
    return episodes.filter((ep) => ep.featured);
  },

  // Helper function to get episodes by tag
  getByTag: function (episodes, tag) {
    return episodes.filter((ep) => ep.tags && ep.tags.includes(tag));
  },
};

export default episodeAnnotations;
