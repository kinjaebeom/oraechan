import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>오래찬 | 오늘의 마음에, 오래된 찬양 한 곡</title>
        <meta name="description" content="오늘의 마음에, 오래된 찬양 한 곡. 오래찬은 감정과 상황에 맞는 찬양을 소개할 큐레이션 서비스입니다." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-5xl font-semibold text-green">오래찬</h1>
        <p className="text-lg">오늘의 마음에, 오래된 찬양 한 곡</p>
      </main>
    </>
  );
}
