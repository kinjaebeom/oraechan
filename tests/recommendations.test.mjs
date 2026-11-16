import assert from "node:assert/strict";
import { test } from "node:test";

import { findHymnById, hymnCategories, hymns } from "../src/data/hymns.ts";
import {
  EMOTION_CATEGORIES,
  recommendHymns,
} from "../src/features/recommendations/recommend.ts";

const ids = (results) => results.map(({ hymn }) => hymn.id);
const emotions = Object.keys(EMOTION_CATEGORIES);
const messages = hymnCategories.map(({ id }) => id);

test("returns five hymns for each emotion on its own", () => {
  for (const emotion of emotions) {
    assert.equal(recommendHymns(hymns, emotion, null).length, 5, emotion);
  }
});

test("returns five hymns in the selected category for each message on its own", () => {
  for (const message of messages) {
    const results = recommendHymns(hymns, null, message);
    assert.equal(results.length, 5, message);
    assert.ok(results.every(({ hymn, score }) => hymn.categoryIds.includes(message) && score === 100));
  }
});

test("adds the selected message weight to its emotion weight and sums matching categories", () => {
  const sample = [
    { id: "comfort", title: "위로", categoryIds: ["comfort"] },
    { id: "recovery", title: "회복", categoryIds: ["recovery"] },
    { id: "peace", title: "평안", categoryIds: ["peace"] },
    { id: "combined", title: "위로와 평안", categoryIds: ["comfort", "peace", "peace"] },
  ];
  const results = recommendHymns(sample, "tired", "peace");
  assert.deepEqual(results.map(({ hymn, score }) => [hymn.id, score]), [
    ["combined", 160], ["peace", 120], ["comfort", 40], ["recovery", 30],
  ]);
  assert.deepEqual(results[0].matchedCategoryIds, ["peace", "comfort"]);
});

test("returns each hymn ID once when multiple entries match", () => {
  const sample = [...hymns, ...hymns];
  const result = ids(recommendHymns(sample, "tired", "peace"));
  assert.equal(new Set(result).size, 5);
  assert.deepEqual(result, ids(recommendHymns(hymns, "tired", "peace")));
});

test("breaks score ties consistently in catalog order", () => {
  const sample = [
    { id: "secondary-pair", title: "보조 카테고리", categoryIds: ["recovery", "peace"] },
    { id: "primary-a", title: "주 카테고리 A", categoryIds: ["comfort"] },
    { id: "primary-b", title: "주 카테고리 B", categoryIds: ["comfort"] },
  ];
  const result = recommendHymns(sample, "tired", null);
  assert.deepEqual(ids(result), ["secondary-pair", "primary-a", "primary-b"]);

  assert.deepEqual(recommendHymns(sample, "tired", null), result);
});

test("different emotions produce different result lists", () => {
  const lists = emotions.map((emotion) => ids(recommendHymns(hymns, emotion, null)).join(","));
  assert.equal(new Set(lists).size, emotions.length);
});

test("changing the selected message changes the results for a fixed emotion", () => {
  assert.notDeepEqual(
    ids(recommendHymns(hymns, "anxious", "peace")),
    ids(recommendHymns(hymns, "anxious", "gratitude"))
  );
});

test("returns an empty result without any selection or any matching hymns", () => {
  assert.deepEqual(recommendHymns(hymns, null, null), []);
  assert.deepEqual(recommendHymns([], "tired", "peace"), []);
});

test("every recommendation is an original catalog hymn with an API lookup ID", () => {
  for (const emotion of [null, ...emotions]) {
    for (const message of [null, ...messages]) {
      if (!emotion && !message) continue;
      const results = recommendHymns(hymns, emotion, message);
      assert.equal(results.length, 5);
      assert.deepEqual(results, recommendHymns(hymns, emotion, message));
      for (const { hymn } of results) {
        const hymnId = new URLSearchParams({ hymnId: hymn.id }).get("hymnId");
        assert.equal(findHymnById(hymnId), hymn);
      }
    }
  }
});
