
import type { AppProps } from "next/app";
import YouTubePreview from "@/components/YouTubePreview";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <YouTubePreview />
    </>
  );
}
