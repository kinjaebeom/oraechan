import type { HymnVideoState } from "@/hooks/useHymnVideo";

type Props = {
  state: HymnVideoState;
  onClose: () => void;
};

export default function HymnVideoPlayer({ state, onClose }: Props) {
  const { song } = state;
  const query = `${song.title} ${song.id === "featured-time" ? "WELOVE" : "찬송가"}`;
  const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <div className="mt-5 min-w-0 rounded-3xl border border-[#D7DED4] bg-[#FFFCF7] p-5 max-sm:p-4">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h4 className="font-serif text-xl font-bold text-[#24382E]">{song.title}</h4>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-[#D7DED4] px-4 py-2 text-xs font-bold text-[#244E39]"
        >
          닫기
        </button>
      </div>

      {state.status === "loading" && (
        <p role="status" className="py-10 text-center text-sm text-[#526B59]">
          YouTube 영상을 검색하고 있어요...
        </p>
      )}

      {state.status === "error" && (
        <>
          <p role="alert" className="rounded-xl bg-[#F7F4EE] p-5 text-sm text-red-700">
            {state.error}
          </p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-bold text-[#244E39] underline"
          >
            YouTube에서 직접 검색하기 ↗
          </a>
        </>
      )}

      {state.status === "ready" && (
        <>
          <div className="aspect-video overflow-hidden rounded-2xl bg-[#24382E]">
            <iframe
              key={state.video.videoId}
              src={`https://www.youtube-nocookie.com/embed/${state.video.videoId}?autoplay=0&controls=1&playsinline=1`}
              title={`${song.title} YouTube 영상`}
              className="h-full w-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <p role="status" className="mt-4 text-sm font-semibold text-[#24382E]">
            검색된 영상: {state.video.title}
          </p>
          <p className="mt-2 text-xs text-[#6F786E]">채널: {state.video.channelTitle}</p>
          <p className="mt-2 text-xs leading-6 text-[#6F786E]">
            YouTube에서 검색한 결과이며 공식 영상이 아닐 수 있어요.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${state.video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-bold text-[#244E39] underline"
          >
            YouTube에서 전체 영상 보기 ↗
          </a>
        </>
      )}
    </div>
  );
}
