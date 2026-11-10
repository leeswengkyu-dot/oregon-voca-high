import { CURRICULUM } from './high-school-source.js';

export { STAGES } from './levels.js';

const buildExamples = (en, ko) => ({
  ex: `The passage uses "${en}" as an important key word.`,
  exKo: `이 글에서는 "${en}"을(를) '${ko}'의 의미로 사용합니다.`,
  ex2: `Readers should understand "${en}" to follow the writer's point.`,
  ex2Ko: `글쓴이의 요지를 이해하려면 "${en}"의 문맥상 의미를 파악해야 합니다.`,
});

export const TOPICS = CURRICULUM.map((unit) => ({
  id: unit.id,
  stage: unit.stage,
  name: unit.name,
  en: unit.en,
  icon: unit.icon,
  words: unit.rows.map(([en, ko], index) => ({
    id: `${unit.id}:${en.toLowerCase()}`,
    en,
    ko,
    pic: '🔤',
    topic: unit.id,
    stage: unit.stage,
    order: index + 1,
    source: unit.stage === 'prep' ? '예비고1 필수 영단어 200' : '2024~2026 모의고사 대비 후보본',
    reviewStatus: 'needs-review',
    legacyIds: [],
    ...buildExamples(en, ko),
  })),
}));

export const ALL_WORDS = TOPICS.flatMap((topic) => topic.words);
export const WORD_BY_ID = Object.fromEntries(ALL_WORDS.map((word) => [word.id, word]));
export const topicById = (id) => TOPICS.find((topic) => topic.id === id);
