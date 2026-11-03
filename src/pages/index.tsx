
import Head from "next/head";
import { useState } from "react";

const emotions = [
  {
    id: "tired",
    icon: "☁",
    title: "지치고 힘들어요",
    sub: "잠시 쉬어 가고 싶은 마음",
  },
  {
    id: "anxious",
    icon: "◌",
    title: "마음이 불안해요",
    sub: "평안이 필요한 오늘",
  },
  {
    id: "lonely",
    icon: "☾",
    title: "외롭고 쓸쓸해요",
    sub: "따뜻한 위로가 그리운 순간",
  },
  {
    id: "grateful",
    icon: "✳",
    title: "감사한 하루예요",
    sub: "기쁨을 찬양으로 나누고 싶어요",
  },
  {
    id: "beginning",
    icon: "↗",
    title: "새로운 시작 앞에",
    sub: "용기와 소망이 필요해요",
  },
  {
    id: "reflective",
    icon: "✦",
    title: "조용히 묵상하고 싶어요",
    sub: "말씀 앞에 머물고 싶은 시간",
  },
] as const;

const messages = [
  "위로",
  "평안",
  "감사",
  "회복",
  "소망",
  "용기",
  "믿음",
  "사명",
] as const;

type EmotionId = (typeof emotions)[number]["id"];
type Message = (typeof messages)[number];

export default function Home() {
  const [emotion, setEmotion] = useState<EmotionId | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const selectedEmotion = emotions.find(
    (item) => item.id === emotion
  );

  return (
    <>
      <Head>
        <title>오래찬 | 오늘의 마음에, 오래된 찬양 한 곡</title>
        <meta
          name="description"
          content="오늘의 마음에, 오래된 찬양 한 곡. 감정과 메시지로 오래 사랑받아 온 찬송가와 CCM을 발견하는 찬양 큐레이션 서비스, 오래찬."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="theme-color" content="#f7f4ee" />
      </Head>

      {/* 첫 진입 시 재생되는 브랜드 인트로 */}
      <div className="intro-overlay" aria-hidden="true">
        <div className="intro-content">
          <div className="intro-word-wrapper">
            <span className="intro-word">오래찬</span>
          </div>
          <div className="intro-subtitle">
            오늘의 마음에, 오래된 찬양 한 곡
          </div>
          <span className="intro-english">ORAECHAN</span>
        </div>
      </div>

      <div className="page-shell" id="top">
        {/* Header */}
        <header className="site-header wrap">
          <a
            className="wordmark"
            href="#top"
            aria-label="오래찬 홈으로 이동"
          >
            <span className="wordmark-symbol" aria-hidden="true">
              ✳
            </span>
            <span className="wordmark-text">
              오래찬
              <span className="wordmark-en">ORAECHAN</span>
            </span>
          </a>

          <nav className="site-nav" aria-label="주요 메뉴">
            <a href="#find">찬양 찾기</a>
            <a href="#about">오래찬 이야기</a>
          </nav>

          <a className="nav-action" href="#find">
            나의 찬양 찾기 <span aria-hidden="true">↗</span>
          </a>
        </header>

        <main>
          {/* Hero */}
          <section
            className="hero wrap"
            aria-labelledby="hero-title"
          >
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-rule" />
                A SONG FOR YOUR HEART
              </p>

              <h1 id="hero-title">
                오늘의 마음에,
                <br />
                <span>오래된 찬양</span> 한 곡.
              </h1>

              <p className="hero-description">
                어떤 말보다 한 곡의 찬양이 더 깊이 와닿는 날이
                있어요.
                <br className="desktop-break" />
                지금의 마음을 따라, 오래도록 사랑받아 온 찬양을
                만나보세요.
              </p>

              <div className="hero-buttons">
                <a className="btn btn-primary" href="#find">
                  내 마음에 맞는 찬양 찾기
                  <span aria-hidden="true">↗</span>
                </a>

                <a className="btn btn-outline" href="#about">
                  오래찬 알아보기
                </a>
              </div>

              <p className="hero-footnote">
                <span aria-hidden="true">✦</span>
                오래된 찬양, 오늘의 위로
              </p>
            </div>

            {/* CSS 풍경 일러스트 */}
            <div
              className="hero-illustration"
              role="img"
              aria-label="따뜻한 햇살과 초록빛 언덕이 펼쳐진 풍경"
            >
              <div className="sun-disc" />
              <div className="hill hill-back" />
              <div className="hill hill-front" />
              <div className="hill hill-foreground" />

              <span className="hero-cross" aria-hidden="true">
                ✝
              </span>

              <p className="art-caption">
                마음에 머무는
                <br />
                한 곡의 찬양
              </p>

              <span className="art-signature">Oraechan</span>
            </div>
          </section>

          {/* 서비스 가치 */}
          <div
            className="value-strip"
            aria-label="오래찬이 전하는 가치"
          >
            <div className="wrap value-strip-inner">
              <span>오늘의 마음을 듣고</span>
              <span>오래된 찬양을 발견하고</span>
              <span>그 안의 메시지를 새기다</span>
            </div>
          </div>

          {/* 감정 및 메시지 선택 */}
          <section
            className="selection-section wrap"
            id="find"
            aria-labelledby="find-title"
          >
            <div className="section-header">
              <div>
                <p className="section-kicker">
                  01 · FIND YOUR SONG
                </p>
                <h2 id="find-title">
                  오늘은 어떤 마음인가요?
                </h2>
              </div>

              <p className="section-aside">
                지금 느끼는 마음을 골라보세요.
                <br />
                정답은 없어요. 있는 그대로 괜찮아요.
              </p>
            </div>

            <div
              className="emotion-grid"
              role="group"
              aria-label="현재 감정 선택"
            >
              {emotions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`emotion-card${
                    emotion === item.id ? " is-selected" : ""
                  }`}
                  aria-pressed={emotion === item.id}
                  onClick={() => setEmotion(item.id)}
                >
                  <span
                    className="emotion-icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="emotion-title">
                    {item.title}
                  </span>

                  <span className="emotion-sub">
                    {item.sub}
                  </span>

                  {emotion === item.id && (
                    <span
                      className="selected-mark"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 메시지 선택 */}
            <div className="message-heading">
              <div>
                <p className="section-kicker">
                  02 · YOUR MESSAGE
                </p>

                <h3>어떤 메시지가 필요하신가요?</h3>
              </div>

              <span>하나를 선택해 주세요</span>
            </div>

            <div
              className="message-options"
              role="group"
              aria-label="원하는 메시지 선택"
            >
              {messages.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`message-chip${
                    message === item ? " is-selected" : ""
                  }`}
                  aria-pressed={message === item}
                  onClick={() => setMessage(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 선택 결과 안내 */}
            <div
              className="selection-result"
              aria-live="polite"
            >
              <div>
                <span
                  className="result-sparkle"
                  aria-hidden="true"
                >
                  ✳
                </span>

                <div>
                  <strong>
                    {selectedEmotion && message
                      ? `${selectedEmotion.title} · ${message}`
                      : "내 마음을 위한 찬양 찾기"}
                  </strong>

                  <p>
                    {selectedEmotion && message
                      ? "선택한 마음과 메시지를 바탕으로 추천할 준비가 되었어요."
                      : "감정과 메시지를 선택하면, 내 마음을 위한 찬양을 찾는 여정이 시작돼요."}
                  </p>
                </div>
              </div>

              <span className="result-status">
                추천 기능 준비 중
              </span>
            </div>

            <p className="implementation-note">
              ※ 현재는 감정과 메시지 선택 UI를 체험할 수 있어요.
              실제 곡 추천은 다음 개발 단계에서 연결됩니다.
            </p>
          </section>

          {/* 서비스 소개 */}
          <section
            className="about-section"
            id="about"
            aria-labelledby="about-title"
          >
            <div className="wrap about-layout">
              <div
                className="about-ornament"
                aria-hidden="true"
              >
                <div className="ornament-ring">
                  <span>♫</span>
                </div>

                <span className="ornament-small">
                  A SONG THAT STAYS
                </span>
              </div>

              <div className="about-copy">
                <p className="section-kicker">
                  THE STORY OF ORAECHAN
                </p>

                <h2 id="about-title">
                  시간이 지나도
                  <br />
                  마음에 남는 찬양
                </h2>

                <p>
                  오래찬은 익숙한 찬송가 속에서 새로운 위로를
                  발견하는 공간이에요. 제목이 기억나지 않아도
                  괜찮아요. 오늘의 감정에서 시작해 찬양이
                  전하는 메시지까지 천천히 만나보세요.
                </p>

                <p className="about-closing">
                  오래된 찬양, 오늘의 위로.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="site-footer wrap">
          <div>
            <a className="footer-brand" href="#top">
              오래찬 <span>ORAECHAN</span>
            </a>

            <p>오늘의 마음에, 오래된 찬양 한 곡</p>
          </div>

          <p>
            © {new Date().getFullYear()} Oraechan.
            Made with care.
          </p>
        </footer>
      </div>
    </>
  );
}
