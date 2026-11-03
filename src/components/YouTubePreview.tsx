
import { useEffect, useRef, useState } from "react";
import {
  getHymnsByCategory,
  hymnCategories,
  type HymnCategoryId,
} from "@/data/hymns";

type Song = {
  id: string;
  title: string;
};

type Video = {
  videoId: string;
  title: string;
  channelTitle: string;
};

type ApiResponse =
  | { video: Video; cached?: boolean }
  | { error: string; code?: string };

const FEATURED_SONG: Song = {
  id: "featured-time",
  title: "시간을 뚫고",
};

const PREVIEW_DURATION = 20;

export default function YouTubePreview() {
  const [categoryId, setCategoryId] =
    useState<HymnCategoryId>("comfort");

  const [selectedSong, setSelectedSong] =
    useState<Song | null>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new Map<string, Video>());

  const activeCategory = hymnCategories.find(
    (category) => category.id === categoryId
  );

  const categorySongs = getHymnsByCategory(categoryId);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function changeCategory(id: HymnCategoryId) {
    abortRef.current?.abort();
    abortRef.current = null;

    setCategoryId(id);
    setSelectedSong(null);
    setVideo(null);
    setLoading(false);
    setError("");
  }

  async function selectSong(song: Song) {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedSong(song);
    setVideo(null);
    setError("");

    const cached = cacheRef.current.get(song.id);

    if (cached) {
      setVideo(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/hymn-video?hymnId=${encodeURIComponent(
          song.id
        )}`,
        { signal: controller.signal }
      );

      const result =
        (await response.json()) as ApiResponse;

      if (!response.ok || !("video" in result)) {
        throw new Error(
          "error" in result
            ? result.error
            : "영상을 찾지 못했어요."
        );
      }

      if (controller.signal.aborted) return;

      cacheRef.current.set(song.id, result.video);
      setVideo(result.video);
    } catch (err) {
      if (controller.signal.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "영상 검색 중 오류가 발생했어요."
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  function closePlayer() {
    abortRef.current?.abort();
    abortRef.current = null;

    setSelectedSong(null);
    setVideo(null);
    setLoading(false);
    setError("");
  }

  const embedUrl = video
    ? `https://www.youtube-nocookie.com/embed/${video.videoId}` +
      `?start=0&end=${PREVIEW_DURATION}` +
      "&autoplay=0&controls=1&playsinline=1"
    : null;

  const youtubeUrl = video
    ? `https://www.youtube.com/watch?v=${video.videoId}`
    : null;

  const fallbackUrl = selectedSong
    ? `https://www.youtube.com/results?search_query=${
        encodeURIComponent(
          `${selectedSong.title} ${
            selectedSong.id === "featured-time"
              ? "WELOVE"
              : "찬송가"
          }`
        )
      }`
    : null;

  return (
    <section
      id="hymn-collection"
      aria-labelledby="collection-title"
      className="mx-auto max-w-[1250px] px-5 py-20"
    >
      {/* 대표 찬양 */}
      <div className="mb-16">
        <p className="mb-3 text-xs font-bold tracking-[2px] text-[#63846B]">
          03 · FEATURED PRAISE
        </p>

        <h2 className="font-serif text-3xl font-semibold text-[#24382E]">
          오늘의 오래찬
        </h2>

        <p className="mt-3 text-sm text-[#6F786E]">
          오늘의 마음에 오래 머무를 찬양 한 곡
        </p>

        <div className="mt-7 overflow-hidden rounded-3xl border border-[#E7E4DC] bg-[#FFFCF7]">
          <div className="flex items-center gap-5 p-7 max-sm:p-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#E3EBE0] text-4xl text-[#244E39] max-sm:h-16 max-sm:w-16">
              ♫
            </div>

            <div>
              <span className="rounded-full bg-[#E3EBE0] px-3 py-1 text-xs font-bold text-[#244E39]">
                오래찬 첫 번째 대표곡
              </span>

              <h3 className="mt-3 font-serif text-2xl font-bold text-[#24382E]">
                시간을 뚫고
              </h3>

              <p className="mt-1 text-sm text-[#6F786E]">
                WELOVE · CCM
              </p>
            </div>
          </div>

          <div className="border-t border-[#E7E4DC] px-7 py-6 max-sm:px-5">
            <p className="text-sm leading-8 text-[#526B59]">
              가장 낮은 자리까지 찾아오신 사랑을
              기억하는 찬양입니다. 지치고 외로운 순간에도
              우리와 함께하시는 하나님을 묵상해 보세요.
            </p>

            <div className="my-5 flex flex-wrap gap-2">
              {["위로", "평안", "믿음"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#D7DED4] px-3 py-1.5 text-xs text-[#526B59]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => selectSong(FEATURED_SONG)}
              className="w-full rounded-full bg-[#244E39] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#35664B]"
            >
              ▶ 시간을 뚫고 · 20초 미리 듣기
            </button>
          </div>

          <div className="border-t border-[#E7E4DC] bg-[#F7F4EE] px-7 py-4 text-xs text-[#6F786E] max-sm:px-5">
            작사 · 작곡: 김강현
          </div>
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-[2px] text-[#63846B]">
          04 · HYMN COLLECTION
        </p>

        <h2
          id="collection-title"
          className="font-serif text-3xl font-semibold text-[#24382E]"
        >
          내 마음에 맞는 찬송가
        </h2>

        <p className="mt-3 text-sm leading-7 text-[#6F786E]">
          원하는 메시지를 선택하면 찬송가 10곡을
          추천해 드려요.
        </p>

        <div
          role="group"
          aria-label="찬송가 카테고리"
          className="mt-8 grid grid-cols-4 gap-3 max-sm:grid-cols-2"
        >
          {hymnCategories.map((category) => {
            const active = category.id === categoryId;

            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  changeCategory(category.id)
                }
                className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition ${
                  active
                    ? "border-[#244E39] bg-[#244E39] text-white"
                    : "border-[#E7E4DC] bg-[#FFFCF7] text-[#24382E] hover:border-[#63846B]"
                }`}
              >
                <span aria-hidden="true" className="text-2xl">
                  {category.emoji}
                </span>

                <span className="text-sm font-bold">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 찬송가 10곡 */}
        <div className="mt-7 overflow-hidden rounded-3xl border border-[#E7E4DC] bg-[#FFFCF7]">
          <div className="flex items-center justify-between gap-3 bg-[#E3EBE0] px-6 py-5 max-sm:px-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#24382E]">
                {activeCategory?.label}의 찬송가
              </h3>

              <p className="mt-2 text-xs text-[#6F786E]">
                {activeCategory?.description}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#244E39]">
              {categorySongs.length}곡
            </span>
          </div>

          <div className="divide-y divide-[#E7E4DC]">
            {categorySongs.map((song, index) => {
              const active = selectedSong?.id === song.id;

              return (
                <button
                  key={song.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectSong(song)}
                  className={`flex w-full items-center gap-4 px-6 py-4 text-left transition max-sm:px-4 ${
                    active
                      ? "bg-[#EDF3EB]"
                      : "hover:bg-[#F7F4EE]"
                  }`}
                >
                  <span className="w-6 shrink-0 text-xs font-semibold text-[#8A9B8B]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3EBE0] text-xl text-[#244E39]">
                    ♫
                  </span>

                  <span className="min-w-0 flex-1 text-sm font-bold text-[#24382E]">
                    {song.title}
                  </span>

                  <span className="shrink-0 rounded-full border border-[#D7DED4] px-3 py-2 text-xs font-bold text-[#244E39]">
                    {active && loading
                      ? "검색 중"
                      : active
                        ? "선택됨"
                        : "▶ 듣기"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 공통 YouTube 플레이어 */}
      {selectedSong && (
        <div
          className="mt-8 rounded-3xl border border-[#D7DED4] bg-[#FFFCF7] p-6 max-sm:p-4"
          aria-live="polite"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#63846B]">
                YOUTUBE PREVIEW
              </p>

              <h3 className="mt-2 font-serif text-2xl font-bold text-[#24382E]">
                {selectedSong.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={closePlayer}
              className="rounded-full border border-[#D7DED4] px-4 py-2 text-xs font-bold text-[#244E39]"
            >
              닫기
            </button>
          </div>

          {loading && (
            <p role="status" className="py-10 text-center text-sm text-[#63846B]">
              YouTube 영상을 검색하고 있어요...
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-[#F7F4EE] p-5 text-sm text-red-700">
              {error}
            </p>
          )}

          {video && embedUrl && (
            <>
              <div className="aspect-video overflow-hidden rounded-2xl bg-[#24382E]">
                <iframe
                  key={video.videoId}
                  src={embedUrl}
                  title={`${selectedSong.title} 미리 듣기`}
                  className="h-full w-full"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#24382E]">
                검색된 영상: {video.title}
              </p>

              <p className="mt-2 text-xs text-[#6F786E]">
                채널: {video.channelTitle}
              </p>

              <p className="mt-2 text-xs leading-6 text-[#6F786E]">
                YouTube에서 검색한 결과이며 공식 영상이
                아닐 수 있어요. 재생 버튼을 누르면
                처음 20초 구간을 감상할 수 있어요.
              </p>

              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-bold text-[#244E39] underline"
                >
                  YouTube에서 전체 영상 보기 ↗
                </a>
              )}
            </>
          )}

          {error && fallbackUrl && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-bold text-[#244E39] underline"
            >
              YouTube에서 직접 검색하기 ↗
            </a>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs leading-6 text-[#839184]">
        오래찬은 음원을 별도로 저장하지 않으며
        YouTube 플레이어로 찬양을 소개합니다.
      </p>
    </section>
  );
}
