// matcher.js
// Pure functions for filtering and scoring beverages against a mood's vibe tags.

/**
 * How many tags two lists share.
 */
export function overlapScore(tagsA = [], tagsB = []) {
  return tagsA.filter((tag) => tagsB.includes(tag)).length;
}

/**
 * Filter beverages by temperature and alcohol preference.
 * temperature: "any" | "hot" | "cold"
 * alcohol: "any" | "alcoholic" | "non-alcoholic"
 * Beverages with temperature "either" satisfy both "hot" and "cold".
 */
export function filterBeverages(beverages, { temperature = "any", alcohol = "any" } = {}) {
  return beverages.filter((b) => {
    const tempOk =
      temperature === "any" ||
      b.temperature === temperature ||
      b.temperature === "either";

    const alcOk =
      alcohol === "any" ||
      (alcohol === "alcoholic" ? b.alcoholic === true : b.alcoholic === false);

    return tempOk && alcOk;
  });
}

/**
 * Pick the beverage (or one of several tied beverages, chosen at random)
 * whose tags overlap the most with the given mood tags.
 * Falls back gracefully — if nothing overlaps, picks randomly among the filtered set.
 */
export function findBestMatch(beverages, moodTags = []) {
  if (beverages.length === 0) return null;

  const scored = beverages.map((b) => ({
    beverage: b,
    score: overlapScore(b.tags, moodTags),
  }));

  const maxScore = Math.max(...scored.map((s) => s.score));
  const topMatches = scored.filter((s) => s.score === maxScore).map((s) => s.beverage);

  return topMatches[Math.floor(Math.random() * topMatches.length)];
}

/**
 * Pick a uniformly random beverage from a list (used for "surprise me").
 */
export function randomBeverage(beverages) {
  if (beverages.length === 0) return null;
  return beverages[Math.floor(Math.random() * beverages.length)];
}
