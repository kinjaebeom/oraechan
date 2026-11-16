export const PREVIEW_DURATION_SECONDS = 25;

export type VerifiedHighlight = {
  videoId: string;
  startSeconds: number;
  durationSeconds: number;
};

type PreviewRange = {
  previewStart: number;
  previewEnd: number;
};

export type Video = PreviewRange & {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSeconds: number | null;
};

export type HymnVideoResponse =
  | { video: Video; cached: boolean }
  | { error: string; code?: string };

export function parseYouTubeDuration(duration: string | undefined): number | null {
  const pattern = /^P(?:(\d+)D)?(?:T(?=\d)(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  const match = pattern.exec(duration ?? "");
  if (!match) return null;

  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match;
  const total =
    Number(days) * 86_400 +
    Number(hours) * 3_600 +
    Number(minutes) * 60 +
    Number(seconds);

  return Number.isSafeInteger(total) && total > 0 ? total : null;
}

function estimateStart(durationSeconds: number | null): number {
  // 영상 길이로 듣기 좋은 시점을 추정합니다. 실제 후렴을 탐지하지 않습니다.
  if (durationSeconds === null) return 90;
  if (durationSeconds < 150) return 30;
  if (durationSeconds < 240) return 55;
  if (durationSeconds < 360) return 90;
  if (durationSeconds < 480) return 120;
  return 150;
}

export function getPreviewRange(
  videoId: string,
  durationSeconds: number | null,
  verified?: VerifiedHighlight
): PreviewRange {
  const useVerified =
    verified?.videoId === videoId &&
    Number.isSafeInteger(verified.startSeconds) &&
    Number.isSafeInteger(verified.durationSeconds) &&
    Number.isSafeInteger(verified.startSeconds + verified.durationSeconds) &&
    verified.startSeconds >= 0 &&
    verified.durationSeconds > 0 &&
    (durationSeconds === null || verified.startSeconds < durationSeconds);

  const start = useVerified ? verified.startSeconds : estimateStart(durationSeconds);
  const length = useVerified ? verified.durationSeconds : PREVIEW_DURATION_SECONDS;
  const previewStart = durationSeconds !== null && start >= durationSeconds ? 0 : start;
  const end = previewStart + length;

  return {
    previewStart,
    previewEnd: durationSeconds === null ? end : Math.min(end, durationSeconds),
  };
}

export function formatPreviewTime(seconds: number): string {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}
