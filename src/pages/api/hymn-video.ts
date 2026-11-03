
import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { hymns } from "@/data/hymns";

const DAILY_SEARCH_LIMIT = 15;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_CANDIDATES = 25;

type Video = {
  videoId: string;
  title: string;
  channelTitle: string;
};

type ApiResponse =
  | {
      video: Video;
      cached: boolean;
    }
  | {
      error: string;
      code?: string;
    };

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type YouTubeVideosResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      channelTitle?: string;
    };
    statistics?: {
      viewCount?: string;
    };
    status?: {
      embeddable?: boolean;
      privacyStatus?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type RankedVideo = Video & {
  viewCount: number;
  priority: number;
};

// 우선적으로 찾을 찬양팀
// 이 목록에 없더라도 밴드/워십 영상이면 후보가 됩니다.
const WORSHIP_TEAMS = [
  "welove",
  "위러브",
  "어노인팅",
  "anointing",
  "마커스",
  "markers",
  "제이어스",
  "j-us",
  "아이자야씩스티원",
  "isaiah6tyone",
  "예수전도단",
  "ywam",
  "피아워십",
  "fia worship",
  "팀룩워십",
  "team luke",
  "러빔",
  "lovim",
];

// 밴드 또는 찬양팀이 부르는 영상의 특징
const LIVE_KEYWORDS = [
  "워십",
  "worship",
  "라이브",
  "live",
  "밴드",
  "band",
  "찬양팀",
  "찬양단",
  "찬양집회",
  "예배실황",
  "실황",
];

// 미리 듣기와 어울리지 않는 영상
const EXCLUDED_KEYWORDS = [
  "mr",
  "inst.",
  "instrumental",
  "piano only",
  "피아노 연주",
  "반주",
  "노래방",
  "karaoke",
  "악보",
  "계이름",
  "튜토리얼",
  "tutorial",
  "가사만",
  "1시간 연속",
  "10시간",
];

const featuredSong = {
  id: "featured-time",
  title: "시간을 뚫고",
};

const cache = new Map<
  string,
  { video: Video; expiresAt: number }
>();

// 개발 서버 프로세스 단위의 검색 횟수 제한
let currentDay = "";
let dailySearchCount = 0;

function getQuotaDay(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return [
    value("year"),
    value("month"),
    value("day"),
  ].join("-");
}

function refreshDailyCount(): void {
  const today = getQuotaDay();

  if (currentDay !== today) {
    currentDay = today;
    dailySearchCount = 0;
  }
}

// 제목을 비교하기 쉽도록 정리
function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s()[\]{}"'.,·!?:\-_/]/g, "");
}

// 악보, MR 등 제외
function isExcluded(video: Video): boolean {
  const title = video.title.toLowerCase();

  return EXCLUDED_KEYWORDS.some((keyword) =>
    title.includes(keyword)
  );
}

// 밴드 및 찬양팀 우선순위 계산
function calculatePriority(video: Video): number {
  const title = video.title.toLowerCase();
  const channel = video.channelTitle.toLowerCase();

  const isKnownTeam = WORSHIP_TEAMS.some(
    (team) =>
      channel.includes(team) || title.includes(team)
  );

  const isLivePerformance = LIVE_KEYWORDS.some(
    (keyword) =>
      title.includes(keyword) ||
      channel.includes(keyword)
  );

  // 알려진 찬양팀
  if (isKnownTeam) return 3;

  // 일반 밴드 또는 워십 영상
  if (isLivePerformance) return 2;

  // 그 외 일반 찬송가 영상
  return 1;
}

function rankVideos(
  candidates: YouTubeVideosResponse["items"],
  songTitle: string
): RankedVideo[] {
  const normalizedSong = normalize(songTitle);

  return (candidates ?? [])
    .filter((item) => {
      if (!item.id || !item.snippet?.title) {
        return false;
      }

      if (item.status?.embeddable === false) {
        return false;
      }

      if (
        item.status?.privacyStatus &&
        item.status.privacyStatus !== "public"
      ) {
        return false;
      }

      // 검색한 찬송가 제목과 일치하는 후보만 허용
      return normalize(item.snippet.title).includes(
        normalizedSong
      );
    })
    .map((item): RankedVideo => {
      const video: Video = {
        videoId: item.id!,
        title: item.snippet!.title!,
        channelTitle:
          item.snippet?.channelTitle ?? "YouTube",
      };

      const parsedViews = Number(
        item.statistics?.viewCount ?? "0"
      );

      return {
        ...video,
        viewCount: Number.isFinite(parsedViews)
          ? parsedViews
          : 0,
        priority: calculatePriority(video),
      };
    })
    .filter((video) => !isExcluded(video))
    .sort((a, b) => {
      // 찬양팀/밴드 여부를 먼저 고려
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // 같은 우선순위라면 조회수 높은 영상
      return b.viewCount - a.viewCount;
    });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
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
      error: "곡 ID가 올바르지 않습니다.",
    });
  }

  const hymn = hymns.find(
    (item) => item.id === hymnId
  );

  const songTitle =
    hymnId === featuredSong.id
      ? featuredSong.title
      : hymn?.title;

  if (!songTitle) {
    return res.status(404).json({
      error: "등록되지 않은 찬양입니다.",
    });
  }

  // 캐시된 영상은 API를 다시 호출하지 않습니다.
  const cached = cache.get(hymnId);

  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json({
      video: cached.video,
      cached: true,
    });
  }

  if (process.env.YOUTUBE_SEARCH_ENABLED !== "true") {
    return res.status(503).json({
      error: "YouTube 검색이 비활성화되어 있습니다.",
      code: "SEARCH_DISABLED",
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "YouTube API 키가 설정되지 않았습니다.",
      code: "API_KEY_MISSING",
    });
  }

  refreshDailyCount();

  if (dailySearchCount >= DAILY_SEARCH_LIMIT) {
    return res.status(429).json({
      error:
        "오늘의 자동 검색 사용 한도에 도달했어요. 내일 다시 이용해 주세요.",
      code: "DAILY_LIMIT_REACHED",
    });
  }

  // 실패한 검색도 할당량을 소비할 수 있으므로
  // 검색 요청 전 먼저 횟수를 기록합니다.
  dailySearchCount += 1;

  // 대표곡은 WELOVE 검색어를 사용합니다.
  const query =
    hymnId === featuredSong.id
      ? "시간을 뚫고 WELOVE"
      : `${songTitle} 찬송가 워십 라이브 밴드`;

  const searchParams = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: query,
    order: "viewCount",
    maxResults: String(MAX_CANDIDATES),
    videoEmbeddable: "true",
    videoSyndicated: "true",
    videoDuration: "medium",
    relevanceLanguage: "ko",
    regionCode: "KR",
    safeSearch: "moderate",
    key: apiKey,
  });

  try {
    // 1. 조회수순 YouTube 검색
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
      {
        signal: AbortSignal.timeout(8000),
      }
    );

    const searchData =
      (await searchResponse.json()) as YouTubeSearchResponse;

    if (!searchResponse.ok) {
      console.error(
        "[YouTube Search]",
        searchResponse.status,
        searchData.error?.message
      );

      return res.status(502).json({
        error:
          "YouTube 검색에 실패했습니다. API 설정이나 할당량을 확인해 주세요.",
        code: "SEARCH_ERROR",
      });
    }

    const videoIds = [
      ...new Set(
        (searchData.items ?? [])
          .map((item) => item.id?.videoId)
          .filter(
            (id): id is string =>
              typeof id === "string" &&
              /^[a-zA-Z0-9_-]{11}$/.test(id)
          )
      ),
    ];

    if (videoIds.length === 0) {
      return res.status(404).json({
        error: "검색된 영상이 없습니다.",
        code: "VIDEO_NOT_FOUND",
      });
    }

    // 2. 검색된 영상들의 실제 조회수와 상태 확인
    // videos.list는 후보 전체를 한 번에 조회합니다.
    const videoParams = new URLSearchParams({
      part: "snippet,statistics,status",
      id: videoIds.join(","),
      key: apiKey,
    });

    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videoParams}`,
      {
        signal: AbortSignal.timeout(8000),
      }
    );

    const videoData =
      (await videoResponse.json()) as YouTubeVideosResponse;

    if (!videoResponse.ok) {
      console.error(
        "[YouTube Videos]",
        videoResponse.status,
        videoData.error?.message
      );

      return res.status(502).json({
        error: "영상 정보를 확인하지 못했습니다.",
        code: "VIDEO_DETAILS_ERROR",
      });
    }

    // 3. 찬양팀/밴드 우선 + 조회수순 정렬
    const ranked = rankVideos(
      videoData.items,
      songTitle
    );

    const selected = ranked[0];

    if (!selected) {
      return res.status(404).json({
        error:
          "조건에 맞는 찬양팀 영상을 찾지 못했습니다. 다른 곡을 선택해 주세요.",
        code: "NO_MATCHING_VIDEO",
      });
    }

    const video: Video = {
      videoId: selected.videoId,
      title: selected.title,
      channelTitle: selected.channelTitle,
    };

    // 4. 선택한 영상을 24시간 캐시
    cache.set(hymnId, {
      video,
      expiresAt: Date.now() + CACHE_DURATION_MS,
    });

    return res.status(200).json({
      video,
      cached: false,
    });
  } catch (error) {
    console.error("[YouTube API Error]", error);

    return res.status(502).json({
      error:
        "영상을 불러오는 중 문제가 발생했습니다.",
      code: "YOUTUBE_API_ERROR",
    });
  }
}
