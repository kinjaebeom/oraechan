
import { useState } from "react";

const FEATURED_SONG = {
  id: "sending-song",
  title: "파송의 노래",
  artist: "예수전도단 버전",
  composer: "고형원",
  genre: "CCM",
  description:
    "새로운 길을 앞두고 있을 때, 주님이 함께하신다는 믿음과 용기를 전하는 찬양입니다.",
  message: "평안 · 용기 · 사명",
  youtubeId: "CnqNsp-6yRE",
  previewStart: 0,
  previewDuration: 20,
} as const;

export default function YouTubePreview() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { youtubeId, previewStart, previewDuration } =
    FEATURED_SONG;

  const previewEnd = previewStart + previewDuration;

  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${youtubeId}` +
    `?start=${previewStart}` +
    `&end=${previewEnd}` +
    `&autoplay=0` +
    `&controls=1` +
    `&playsinline=1`;

  const youtubeUrl =
    `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <section
      id="youtube-preview"
      aria-labelledby="featured-song-title"
      className="mx-auto max-w-[1250px] scroll-mt-8 px-[26px] py-20 max-sm:px-5"
    >
      <div className="mx-auto max-w-[850px]">
        <p className="mb-3 text-[11px] font-extrabold tracking-[2.5px] text-[#63846B]">
          03 · TODAY&apos;S PRAISE
        </p>

        <h2 className="mb-3 font-serif text-3xl font-semibold text-[#24382E] max-sm:text-[27px]">
          오늘의 오래찬
        </h2>

        <p className="mb-8 text-sm leading-7 text-[#6F786E]">
          오래도록 사랑받아 온 찬양 한 곡을 소개합니다.
          <br />
          잠시 멈춰, 찬양이 전하는 메시지에 귀 기울여 보세요.
        </p>

        <article className="overflow-hidden rounded-[24px] border border-[#E7E4DC] bg-[#FFFCF7] shadow-[0_12px_38px_rgba(27,54,39,0.07)]">
          {/* Song Header */}
          <div className="flex items-center gap-5 border-b border-[#E7E4DC] p-7 max-sm:gap-4 max-sm:p-5">
            <div
              aria-hidden="true"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-[#E3EBE0] font-serif text-4xl text-[#244E39] max-sm:h-16 max-sm:w-16"
            >
              ♫
            </div>

            <div className="min-w-0 flex-1">
              <span className="mb-2 inline-block rounded-full bg-[#E3EBE0] px-3 py-1 text-[11px] font-semibold text-[#244E39]">
                첫 번째 추천 찬양
              </span>

              <h3
                id="featured-song-title"
                className="font-serif text-[26px] font-bold text-[#24382E] max-sm:text-[22px]"
              >
                {FEATURED_SONG.title}
              </h3>

              <p className="mt-1 text-xs text-[#6F786E]">
                {FEATURED_SONG.artist} · {FEATURED_SONG.genre}
              </p>
            </div>
          </div>

          {/* Song Description */}
          <div className="px-7 pt-7 max-sm:px-5">
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold tracking-[1.5px] text-[#63846B]">
                ABOUT THIS SONG
              </p>

              <p className="text-sm leading-7 text-[#526B59]">
                {FEATURED_SONG.description}
              </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {FEATURED_SONG.message.split(" · ").map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#D7DED4] px-3 py-1.5 text-xs text-[#526B59]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mb-7 rounded-2xl bg-[#F7F4EE] px-5 py-4">
              <p className="mb-1 text-xs font-bold text-[#244E39]">
                오래찬의 한마디
              </p>

              <p className="text-sm leading-7 text-[#6F786E]">
                아직 앞에 놓인 길이 낯설게 느껴지나요?
                이 찬양을 들으며 그 길을 혼자 걷는 것이
                아니라는 메시지를 묵상해 보세요.
              </p>
            </div>

            {/* Preview Player */}
            {isPlayerOpen ? (
              <div className="mb-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#24382E]">
                      {FEATURED_SONG.title} · 미리 듣기
                    </p>

                    <p className="mt-1 text-xs text-[#6F786E]">
                      {previewStart}초 ~ {previewEnd}초 구간
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPlayerOpen(false)}
                    className="rounded-full border border-[#D7DED4] px-4 py-2 text-xs font-semibold text-[#526B59] transition hover:bg-[#E3EBE0]"
                  >
                    플레이어 닫기
                  </button>
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#24382E]">
                  <iframe
                    src={embedUrl}
                    title={`${FEATURED_SONG.title} YouTube 미리 듣기`}
                    className="h-full w-full"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                <p className="mt-3 text-xs leading-6 text-[#6F786E]">
                  영상의 재생 버튼을 누르면 지정된 구간을
                  감상할 수 있어요. 영상 설정에 따라
                  재생이 제한될 수 있습니다.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPlayerOpen(true)}
                className="mb-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#244E39] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#35664B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#244E39]"
              >
                <span aria-hidden="true">▶</span>
                20초 미리 듣기
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7E4DC] bg-[#F7F4EE] px-7 py-5 max-sm:px-5">
            <div>
              <p className="text-xs font-semibold text-[#526B59]">
                작사 · 작곡: {FEATURED_SONG.composer}
              </p>

              <p className="mt-1 text-[11px] text-[#839184]">
                YouTube 영상 출처 확인 중
              </p>
            </div>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#244E39] underline underline-offset-4"
            >
              YouTube에서 전체 듣기 ↗
            </a>
          </div>
        </article>

        <p className="mt-5 text-center text-xs leading-6 text-[#839184]">
          오래찬은 음원을 직접 저장하거나 제공하지 않으며,
          YouTube 플레이어를 통해 찬양을 소개합니다.
        </p>
      </div>
    </section>
  );
}
