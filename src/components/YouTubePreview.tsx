
import { useState, type FormEvent } from "react";

const PREVIEW_DURATION = 20;

function getYouTubeVideoId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.toLowerCase();

    let id: string | null = null;

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else {
        const match = url.pathname.match(
          /^\/(?:shorts|embed|live)\/([^/]+)/
        );
        id = match?.[1] ?? null;
      }
    } else if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      id = url.pathname.split("/")[1] ?? null;
    }

    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return null;
    }

    return id;
  } catch {
    return null;
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

type ActivePreview = {
  videoId: string;
  start: number;
};

export default function YouTubePreview() {
  const [url, setUrl] = useState("");
  const [startSeconds, setStartSeconds] = useState("30");
  const [activePreview, setActivePreview] =
    useState<ActivePreview | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const videoId = getYouTubeVideoId(url);
    const start = Number(startSeconds);

    if (!videoId) {
      setError("올바른 YouTube 영상 주소를 입력해 주세요.");
      setActivePreview(null);
      return;
    }

    if (
      !Number.isSafeInteger(start) ||
      start < 0 ||
      start > 86400
    ) {
      setError("시작 시간은 0~86400초 사이로 입력해 주세요.");
      setActivePreview(null);
      return;
    }

    setError("");
    setActivePreview({
      videoId,
      start,
    });
  }

  function handleStop() {
    setActivePreview(null);
  }

  const embedUrl = activePreview
    ? `https://www.youtube.com/embed/${
        activePreview.videoId
      }?start=${activePreview.start}&end=${
        activePreview.start + PREVIEW_DURATION
      }&autoplay=0&controls=1&playsinline=1&rel=0`
    : null;

  const originalUrl = activePreview
    ? `https://www.youtube.com/watch?v=${activePreview.videoId}`
    : null;

  return (
    <section
      id="youtube-preview"
      aria-labelledby="youtube-preview-title"
      className="mx-auto max-w-[1250px] scroll-mt-8 px-[26px] py-16 max-sm:px-5"
    >
      <div className="mx-auto max-w-[820px]">
        <p className="mb-3 text-[11px] font-extrabold tracking-[2.5px] text-[#63846B]">
          03 · LISTEN TO A SONG
        </p>

        <h2
          id="youtube-preview-title"
          className="mb-3 font-serif text-3xl font-semibold tracking-tight text-[#24382E] max-sm:text-[27px]"
        >
          찬양을 잠시 들어볼까요?
        </h2>

        <p className="mb-8 text-sm leading-7 text-[#6F786E]">
          YouTube 영상 주소를 입력하면 원하는 부분부터
          20초간 미리 들어볼 수 있어요.
          <br />
          현재는 실제 찬양 데이터를 연결하기 전의 테스트
          기능입니다.
        </p>

        <div className="rounded-[24px] border border-[#E7E4DC] bg-[#FFFCF7] p-6 shadow-sm max-sm:p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="youtube-url"
                className="mb-2 block text-sm font-semibold text-[#24382E]"
              >
                YouTube 영상 링크
              </label>

              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-describedby={
                  error ? "youtube-preview-error" : undefined
                }
                className="w-full rounded-xl border border-[#D7DED4] bg-white px-4 py-3 text-sm text-[#24382E] outline-none transition-colors focus:border-[#244E39]"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="preview-start"
                className="mb-2 block text-sm font-semibold text-[#24382E]"
              >
                미리 듣기 시작 시간 (초)
              </label>

              <input
                id="preview-start"
                type="number"
                min="0"
                max="86400"
                step="1"
                value={startSeconds}
                onChange={(event) =>
                  setStartSeconds(event.target.value)
                }
                className="w-full rounded-xl border border-[#D7DED4] bg-white px-4 py-3 text-sm text-[#24382E] outline-none focus:border-[#244E39]"
              />

              <p className="mt-2 text-xs text-[#6F786E]">
                예: 70초를 입력하면 1분 10초부터 1분
                30초까지 재생 구간을 설정해요.
              </p>
            </div>

            {error && (
              <p
                id="youtube-preview-error"
                role="alert"
                className="mb-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-[#244E39] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#35664B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#244E39]"
            >
              ♪ 미리 듣기 준비하기
            </button>
          </form>

          {activePreview && embedUrl && originalUrl && (
            <div className="mt-8 border-t border-[#E7E4DC] pt-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#24382E]">
                    찬양 미리 듣기
                  </h3>

                  <p className="mt-1 text-xs text-[#6F786E]">
                    {formatTime(activePreview.start)} ~{" "}
                    {formatTime(
                      activePreview.start + PREVIEW_DURATION
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStop}
                  className="rounded-full border border-[#D7DED4] px-4 py-2 text-xs font-semibold text-[#526B59] hover:bg-[#E3EBE0]"
                >
                  플레이어 닫기
                </button>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#24382E]">
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title="YouTube 찬양 미리 듣기"
                  className="h-full w-full"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              <p className="mt-3 text-xs leading-6 text-[#6F786E]">
                영상 가운데 재생 버튼을 눌러 주세요.
                YouTube 정책이나 영상 설정에 따라
                재생이 제한될 수 있어요.
              </p>

              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-[#244E39] underline underline-offset-4"
              >
                YouTube에서 전체 영상 보기 ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
