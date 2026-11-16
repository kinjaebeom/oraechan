import type { Hymn, HymnCategoryId } from "@/data/hymns";

export const EMOTION_CATEGORIES = {
  tired: ["comfort", "recovery", "peace"],
  anxious: ["peace", "faith", "comfort"],
  lonely: ["comfort", "hope", "peace"],
  grateful: ["gratitude", "faith", "hope"],
  beginning: ["courage", "hope", "mission"],
  reflective: ["faith", "peace", "mission"],
} as const satisfies Record<string, readonly HymnCategoryId[]>;

export type EmotionId = keyof typeof EMOTION_CATEGORIES;

export type HymnRecommendation = {
  hymn: Hymn;
  score: number;
  matchedCategoryIds: HymnCategoryId[];
};

const EMOTION_WEIGHTS = [40, 30, 20] as const;
const MESSAGE_WEIGHT = 100;
const RESULT_LIMIT = 5;

export function recommendHymns(
  hymns: readonly Hymn[],
  emotion: EmotionId | null,
  message: HymnCategoryId | null
): HymnRecommendation[] {
  if (!emotion && !message) return [];

  const weights = new Map<HymnCategoryId, number>();
  if (message) weights.set(message, MESSAGE_WEIGHT);
  if (emotion) {
    EMOTION_CATEGORIES[emotion].forEach((category, index) => {
      weights.set(category, (weights.get(category) ?? 0) + EMOTION_WEIGHTS[index]);
    });
  }

  const priority = [...weights].sort((a, b) => b[1] - a[1]);
  const ranked = new Map<string, HymnRecommendation>();
  for (const hymn of hymns) {
    if (ranked.has(hymn.id)) continue;

    const matches = priority.filter(([category]) => hymn.categoryIds.includes(category));
    if (matches.length === 0) continue;

    ranked.set(hymn.id, {
      hymn,
      score: matches.reduce((sum, [, weight]) => sum + weight, 0),
      matchedCategoryIds: matches.map(([category]) => category),
    });
  }

  // Stable sorting keeps catalog order on a tie.
  return [...ranked.values()].sort((a, b) => b.score - a.score).slice(0, RESULT_LIMIT);
}
