import HymnVideoPlayer from "@/components/HymnVideoPlayer";
import { hymnCategories, type HymnCategoryId } from "@/data/hymns";
import {
  EMOTION_CATEGORIES,
  type EmotionId,
  type HymnRecommendation,
} from "@/features/recommendations/recommend";
import type { HymnVideoController } from "@/hooks/useHymnVideo";

type Props = {
  results: HymnRecommendation[];
  emotion: { id: EmotionId; title: string } | undefined;
  message: HymnCategoryId | null;
  player: HymnVideoController;
};

const labels = new Map(hymnCategories.map(({ id, label }) => [id, label]));

function getReason(
  categories: HymnCategoryId[],
  emotion: Props["emotion"],
  message: Props["message"]
): string {
  const emotionCategories: readonly HymnCategoryId[] = emotion
    ? EMOTION_CATEGORIES[emotion.id]
    : [];
  const emotionMatches = categories.filter((id) => emotionCategories.includes(id));
  const matchesMessage = message !== null && categories.includes(message);
  const emotionLabels = emotionMatches.map((id) => labels.get(id)).join("·");

  if (emotion && emotionMatches.length && matchesMessage) {
    return `선택한 메시지 ‘${labels.get(message)}’에 해당하고, ‘${emotion.title}’와 연결되는 ${emotionLabels} 주제에도 속해요.`;
  }
  if (emotion && emotionMatches.length) {
    return `‘${emotion.title}’와 연결되는 ${emotionLabels} 주제의 찬송가예요.`;
  }
  return `선택한 메시지 ‘${labels.get(categories[0])}’에 해당하는 찬송가예요.`;
}

export default function RecommendationResults({ results, emotion, message, player }: Props) {
  const state = player.state?.source === "recommendations" ? player.state : null;
  const selection = [emotion?.title, message && labels.get(message)].filter(Boolean).join(" · ");

  return (
    <section className="mt-8 rounded-[21px] border border-[#D4DFD1] bg-[#E8EEE5] p-4 sm:p-6" aria-labelledby="recommendation-title">
      <h3 id="recommendation-title" className="font-serif text-xl font-bold text-[#24382E]">
        내 마음에 맞는 추천 찬송가
      </h3>
      <p role="status" className="mt-2 text-sm text-[#526B57]">
        {selection
          ? `${selection}에 맞는 찬송가 ${results.length}곡을 찾았어요.`
          : "감정이나 원하는 메시지를 선택해 보세요."}
      </p>

      {results.length > 0 && (
        <ol aria-label="추천 찬송가 순위" className="mt-4 grid gap-3">
          {results.map(({ hymn, matchedCategoryIds }, index) => {
            const active = state?.song.id === hymn.id;
            return (
              <li key={hymn.id} className="min-w-0 rounded-2xl border border-[#D7DED4] bg-[#FFFCF7] p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <h4 className="flex items-baseline gap-2 font-serif text-lg font-bold text-[#24382E]">
                      <span className="shrink-0 text-sm text-[#526B57]">{index + 1}.</span>
                      {hymn.title}
                    </h4>
                    <ul aria-label="연관 메시지" className="mt-2 flex flex-wrap gap-1.5">
                      {matchedCategoryIds.map((id) => (
                        <li key={id} className="rounded-full bg-[#E8EEE5] px-2.5 py-1 text-xs font-bold text-[#244E39]">
                          {labels.get(id)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm leading-6 text-[#526B57]">
                      {getReason(matchedCategoryIds, emotion, message)}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`${hymn.title} YouTube로 듣기`}
                    aria-pressed={active}
                    onClick={(event) => player.select(hymn, "recommendations", event.currentTarget)}
                    className="justify-self-start rounded-full bg-[#244E39] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#193827]"
                  >
                    ▶ YouTube로 듣기
                  </button>
                </div>
                {state && active && <HymnVideoPlayer state={state} onClose={() => player.close(true)} />}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
