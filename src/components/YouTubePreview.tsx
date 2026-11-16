
import { useState } from "react";
import HymnVideoPlayer from "@/components/HymnVideoPlayer";
import type { HymnVideoController } from "@/hooks/useHymnVideo";
import {
  getHymnsByCategory,
  hymnCategories,
  type HymnCategoryId,
} from "@/data/hymns";

const FEATURED_SONG = { id: "featured-time", title: "시간을 뚫고" };

export default function YouTubePreview({ player }: { player: HymnVideoController }) {
  const [categoryId, setCategoryId] = useState<HymnCategoryId>("comfort");
  const state = player.state?.source === "collection" ? player.state : null;
  const activeCategory = hymnCategories.find((category) => category.id === categoryId);
  const categorySongs = getHymnsByCategory(categoryId);

  function changeCategory(id: HymnCategoryId) {
    setCategoryId(id);
    if (state) player.close();
  }

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
              onClick={(event) => player.select(FEATURED_SONG, "collection", event.currentTarget)}
              className="w-full rounded-full bg-[#244E39] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#35664B]"
            >
              ▶ 시간을 뚫고 듣기
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
              const active = state?.song.id === song.id;

              return (
                <button
                  key={song.id}
                  type="button"
                  aria-pressed={active}
                  onClick={(event) => player.select(song, "collection", event.currentTarget)}
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
                    {active && state?.status === "loading"
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

      {state && <HymnVideoPlayer state={state} onClose={() => player.close(true)} />}

      <p className="mt-6 text-center text-xs leading-6 text-[#839184]">
        오래찬은 음원을 별도로 저장하지 않으며
        YouTube 플레이어로 찬양을 소개합니다.
      </p>
    </section>
  );
}
