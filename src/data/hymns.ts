
export const hymnCategories = [
  {
    id: "comfort",
    label: "위로",
    emoji: "🤍",
    description: "지친 마음에 따뜻한 위로가 필요할 때",
    songs: [
      "너 근심 걱정 말아라",
      "주 안에 있는 나에게",
      "내 영혼이 은총 입어",
      "내 평생에 가는 길",
      "주의 친절한 팔에 안기세",
      "나의 갈 길 다 가도록",
      "내 주를 가까이 하게 함은",
      "오 놀라운 구세주",
      "어머니의 넓은 사랑",
      "내 영혼의 그윽히 깊은 데서",
    ],
  },
  {
    id: "peace",
    label: "평안",
    emoji: "🌿",
    description: "복잡한 마음을 내려놓고 평안을 구할 때",
    songs: [
      "내 평생에 가는 길",
      "내 영혼의 그윽히 깊은 데서",
      "주 안에 있는 나에게",
      "너 근심 걱정 말아라",
      "주의 친절한 팔에 안기세",
      "내 주 되신 주를 참 사랑하고",
      "주 하나님 지으신 모든 세계",
      "예수로 나의 구주 삼고",
      "내 주를 가까이 하게 함은",
      "어저께나 오늘이나",
    ],
  },
  {
    id: "gratitude",
    label: "감사",
    emoji: "☀️",
    description: "감사한 마음을 찬양으로 표현하고 싶을 때",
    songs: [
      "지금까지 지내온 것",
      "날 구원하신 예수님",
      "주 하나님 지으신 모든 세계",
      "만복의 근원 하나님",
      "다 감사드리세",
      "감사하는 성도여",
      "논밭에 오곡백과",
      "온 세상 위하여",
      "찬양하라 복되신 구세주 예수",
      "내 영혼이 은총 입어",
    ],
  },
  {
    id: "recovery",
    label: "회복",
    emoji: "🌱",
    description: "다시 일어서고 새 힘을 얻고 싶을 때",
    songs: [
      "나 같은 죄인 살리신",
      "죄짐 맡은 우리 구주",
      "빈 들에 마른 풀같이",
      "정결하게 하는 샘이",
      "내 주의 보혈은",
      "주의 음성을 내가 들으니",
      "예수 나를 위하여",
      "아 하나님의 은혜로",
      "나의 죄를 씻기는",
      "하나님의 나팔 소리",
    ],
  },
  {
    id: "hope",
    label: "소망",
    emoji: "🌅",
    description: "앞으로의 날을 믿음으로 바라보고 싶을 때",
    songs: [
      "저 높은 곳을 향하여",
      "주가 맡긴 모든 역사",
      "하늘 가는 밝은 길이",
      "내 주를 가까이 하게 함은",
      "괴로운 인생길 가는 몸이",
      "나의 갈 길 다 가도록",
      "예수로 나의 구주 삼고",
      "이 몸의 소망 무언가",
      "잠시 세상에 내가 살면서",
      "주 하나님 지으신 모든 세계",
    ],
  },
  {
    id: "courage",
    label: "용기",
    emoji: "🕊️",
    description: "두려움보다 믿음을 선택하고 싶을 때",
    songs: [
      "십자가 군병들아",
      "믿는 사람들은 주의 군사니",
      "주와 같이 길 가는 것",
      "예수 따라가며",
      "어려운 일 당할 때",
      "주 믿는 사람 일어나",
      "주의 진리 위해 십자가 군기",
      "주님의 마음을 본받는 자",
      "행군 나팔 소리에",
      "주의 약속하신 말씀 위에서",
    ],
  },
  {
    id: "faith",
    label: "믿음",
    emoji: "📖",
    description: "하나님을 더욱 신뢰하고 싶은 순간",
    songs: [
      "구주 예수 의지함이",
      "예수로 나의 구주 삼고",
      "아 하나님의 은혜로",
      "주와 같이 길 가는 것",
      "내 주 되신 주를 참 사랑하고",
      "주 믿는 사람 일어나",
      "주의 약속하신 말씀 위에서",
      "어저께나 오늘이나",
      "이 몸의 소망 무언가",
      "나의 갈 길 다 가도록",
    ],
  },
  {
    id: "mission",
    label: "사명",
    emoji: "✨",
    description: "부르심과 맡겨진 사명을 생각할 때",
    songs: [
      "부름 받아 나선 이 몸",
      "어느 민족 누구게나",
      "온 세상 위하여",
      "빛의 사자들이여",
      "어서 돌아오오",
      "하나님의 진리 등대",
      "우리는 주님을 늘 배반하나",
      "십자가 군병들아",
      "주가 맡긴 모든 역사",
      "일어나라 주의 백성",
    ],
  },
] as const;

export type HymnCategoryId =
  (typeof hymnCategories)[number]["id"];

export type Hymn = {
  id: string;
  title: string;
  categoryIds: HymnCategoryId[];
};

// 제목이 같으면 하나의 곡으로 관리하고,
// 여러 카테고리에 연결할 수 있도록 정규화합니다.
export const hymns: Hymn[] = Array.from(
  new Set(
    hymnCategories.flatMap((category) => category.songs)
  )
).map((title, index) => ({
  id: `hymn-${String(index + 1).padStart(3, "0")}`,
  title,
  categoryIds: hymnCategories
    .filter((category) =>
      (category.songs as readonly string[]).includes(title)
    )
    .map((category) => category.id),
}));

export function getHymnsByCategory(
  categoryId: HymnCategoryId
): Hymn[] {
  const category = hymnCategories.find(
    (item) => item.id === categoryId
  );

  if (!category) return [];

  return category.songs
    .map((title) => hymns.find((hymn) => hymn.title === title))
    .filter((hymn): hymn is Hymn => Boolean(hymn));
}
