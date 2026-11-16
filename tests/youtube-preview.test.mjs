import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatPreviewTime,
  getPreviewRange,
  parseYouTubeDuration,
} from "../src/lib/youtube-preview.ts";

test("converts YouTube durations in seconds, minutes, hours, and days", () => {
  assert.equal(parseYouTubeDuration("PT40S"), 40);
  assert.equal(parseYouTubeDuration("PT2M"), 120);
  assert.equal(parseYouTubeDuration("PT4M30S"), 270);
  assert.equal(parseYouTubeDuration("PT1H2M3S"), 3723);
  assert.equal(parseYouTubeDuration("P1DT1H2M3S"), 90123);
});

test("treats missing, zero, unsupported, and invalid durations as unknown", () => {
  for (const value of [undefined, "", "P", "PT0S", "P1DT", "P1M", "PT1.5S", "PT-5S", "PT9007199254740992S"]) {
    assert.equal(parseYouTubeDuration(value), null);
  }
});

test("starts at the expected point on either side of each duration boundary", () => {
  for (const [duration, start] of [
    [149, 30], [150, 55], [239, 55], [240, 90],
    [359, 90], [360, 120], [479, 120], [480, 150], [3600, 150],
  ]) {
    assert.deepEqual(getPreviewRange("video", duration), {
      previewStart: start,
      previewEnd: start + 25,
    });
  }
});

test("clamps at the video end and starts at zero if the estimate is out of range", () => {
  assert.deepEqual(getPreviewRange("video", 40), { previewStart: 30, previewEnd: 40 });
  assert.deepEqual(getPreviewRange("video", 30), { previewStart: 0, previewEnd: 25 });
  assert.deepEqual(getPreviewRange("video", 1), { previewStart: 0, previewEnd: 1 });
});

test("uses 90 to 115 seconds for an unknown duration", () => {
  assert.deepEqual(getPreviewRange("video", null), { previewStart: 90, previewEnd: 115 });
});

test("prefers a matching verified range and clamps it when the duration is known", () => {
  const verified = { videoId: "video", startSeconds: 40, durationSeconds: 12 };
  assert.deepEqual(getPreviewRange("video", null, verified), { previewStart: 40, previewEnd: 52 });
  assert.deepEqual(getPreviewRange("video", 45, verified), { previewStart: 40, previewEnd: 45 });
});

test("ignores mismatched or invalid verified ranges", () => {
  const verified = { videoId: "video", startSeconds: 80, durationSeconds: 10 };
  for (const override of [
    { ...verified, videoId: "other" },
    { ...verified, startSeconds: -1 },
    { ...verified, startSeconds: 3.5 },
    { ...verified, startSeconds: 100 },
    { ...verified, durationSeconds: 0 },
  ]) {
    assert.deepEqual(getPreviewRange("video", 100, override), { previewStart: 30, previewEnd: 55 });
  }
});

test("formats timestamps as minutes and seconds even beyond an hour", () => {
  assert.equal(formatPreviewTime(0), "00:00");
  assert.equal(formatPreviewTime(90), "01:30");
  assert.equal(formatPreviewTime(3605), "60:05");
});
