
import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { hymns } from "@/data/hymns";

const DAILY_SEARCH_LIMIT = 15;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

type VideoResult = {
  videoId: string;
  title: string;
  channelTitle: string;
};

type ApiResult =
  | {
      video: VideoResult;
      cached: boolean;
    }
  | {
      error: string;
      code?: string;
    };

type YouTubeSearchResponse = {
  items?: {
    id?: {
      videoId?: string;
    };
    snippet?: {
      title?: string;
      channelTitle?: string;
    };
  }[];
  error?: {
    message?: string;
  };
};

type CachedVideo = {
  video: VideoResult;
  expiresAt: number;
};

const videoCache = new Map<string, CachedVideo>();

// 개발 서버의 프로세스 내부에서 검색 횟수 관리
let currentDay = "";
let searchCount = 0;

// Google YouTube API의 할당량 초기화 기준: 태평양 시간
function getQuotaDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function refreshDailyCounter(): void {
  const today = getQuotaDay();

  if (currentDay !== today) {
    currentDay = today;
    searchCount = 0;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResult>
) {
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "GET 요청만 지원합니다.",
    });
  }

  const hymnId = req.query.hymnId;

  if (typeof hymnId !== "string") {
    return res.status(400).json({
      error: "찬송가 ID가 올바르지 않습니다.",
    });
  }

  const hymn = hymns.find(
    (item) => item.id === hymnId
  );

  if (!hymn) {
    return res.status(404).json({
      error: "등록되지 않은 찬송가입니다.",
    });
  }

  // 1. 이미 검색한 곡은 API 호출 없이 반환
  const cached = videoCache.get(hymn.id);

  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json({
      video: cached.video,
      cached: true,
    });
  }

  // 2. 검색 기능을 명시적으로 켰는지 확인
  if (process.env.YOUTUBE_SEARCH_ENABLED !== "true") {
    return res.status(503).json({
      error:
        "YouTube 자동 검색이 비활성화되어 있습니다.",
      code: "SEARCH_DISABLED",
    });
  }

  // 3. API 키 확인
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error:
        "YouTube API 키가 설정되지 않았습니다.",
      code: "API_KEY_MISSING",
    });
  }

  // 4. 날짜별 검색 횟수 갱신
  refreshDailyCounter();

  // 5. 일일 제한에 도달했다면 외부 요청 차단
  if (searchCount >= DAILY_SEARCH_LIMIT) {
    return res.status(429).json({
      error:
        "오늘의 찬송가 자동 검색 사용량에 도달했어요. 내일 다시 이용해 주세요.",
      code: "DAILY_LIMIT_REACHED",
    });
  }

  // 실제 API 호출 전에 사용 횟수를 먼저 차감
  // 실패한 API 호출도 할당량을 사용할 수 있음
  searchCount += 1;

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: `${hymn.title} 찬송가`,
    maxResults: "5",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    safeSearch: "moderate",
    relevanceLanguage: "ko",
    regionCode: "KR",
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      {
        signal: AbortSignal.timeout(8000),
      }
    );

    const data =
      (await response.json()) as YouTubeSearchResponse;

    if (!response.ok) {
      console.error(
        "[YouTube API]",
        response.status,
        data.error?.message
      );

      return res.status(502).json({
        error:
          "YouTube 검색이 제한되었거나 실패했습니다. 잠시 후 다시 시도해 주세요.",
        code: "YOUTUBE_API_ERROR",
      });
    }

    const result = data.items?.find(
      (item) =>
        item.id?.videoId &&
        /^[a-zA-Z0-9_-]{11}$/.test(item.id.videoId)
    );

    if (!result?.id?.videoId) {
      return res.status(404).json({
        error: "검색된 찬송가 영상이 없습니다.",
        code: "VIDEO_NOT_FOUND",
      });
    }

    const video: VideoResult = {
      videoId: result.id.videoId,
      title:
        result.snippet?.title ?? hymn.title,
      channelTitle:
        result.snippet?.channelTitle ?? "YouTube",
    };

    // 검색 성공한 곡은 24시간 캐싱
    videoCache.set(hymn.id, {
      video,
      expiresAt: Date.now() + CACHE_DURATION_MS,
    });

    return res.status(200).json({
      video,
      cached: false,
    });
  } catch (error) {
    console.error("[YouTube Search Error]", error);

    return res.status(502).json({
      error:
        "YouTube 영상 검색 중 문제가 발생했습니다.",
      code: "SEARCH_ERROR",
    });
  }
}
