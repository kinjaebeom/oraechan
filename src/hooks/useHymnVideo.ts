import { useEffect, useRef, useState } from "react";

export type Song = {
  id: string;
  title: string;
};

type Video = {
  videoId: string;
  title: string;
  channelTitle: string;
};

type ApiResponse =
  | { video: Video; cached: boolean }
  | { error: string; code?: string };

type Selection = {
  song: Song;
  source: "recommendations" | "collection";
};

export type HymnVideoState = Selection & (
  | { status: "loading" }
  | { status: "ready"; video: Video }
  | { status: "error"; error: string }
);

export function useHymnVideo() {
  const [state, setState] = useState<HymnVideoState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new Map<string, Video>());
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function close(restoreFocus = false) {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(null);
    if (restoreFocus) triggerRef.current?.focus();
    triggerRef.current = null;
  }

  async function select(
    song: Song,
    source: Selection["source"],
    trigger: HTMLButtonElement
  ) {
    abortRef.current?.abort();
    abortRef.current = null;
    triggerRef.current = trigger;

    const selection = { song, source };
    const cached = cacheRef.current.get(song.id);
    if (cached) {
      setState({ ...selection, status: "ready", video: cached });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setState({ ...selection, status: "loading" });

    try {
      const response = await fetch(
        `/api/hymn-video?hymnId=${encodeURIComponent(song.id)}`,
        { signal: controller.signal }
      );
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !("video" in result)) {
        throw new Error("error" in result ? result.error : "영상을 찾지 못했어요.");
      }

      if (controller.signal.aborted) return;
      cacheRef.current.set(song.id, result.video);
      setState({ ...selection, status: "ready", video: result.video });
    } catch (err) {
      if (controller.signal.aborted) return;
      const error = err instanceof Error ? err.message : "영상 검색 중 오류가 발생했어요.";
      setState({ ...selection, status: "error", error });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  return { state, select, close };
}

export type HymnVideoController = ReturnType<typeof useHymnVideo>;
