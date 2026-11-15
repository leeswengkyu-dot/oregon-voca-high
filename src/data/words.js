import { CURRICULUM } from './high-school-source.js';
import { EXAMPLE_DATA } from './example-data.js';
import { semanticIcon, unitTheme } from './icon-system.js';
import { curatedExamples } from './example-overrides.js';

export { STAGES } from './levels.js';

const curriculumExamples = (id) => {
  const item = EXAMPLE_DATA[id];
  if (!item) throw new Error(`Missing curriculum example data: ${id}`);
  return {
    partOfSpeech: item.partOfSpeech,
    ex: item.example,
    exKo: item.translation,
    ex2: item.example2,
    ex2Ko: item.translation2,
  };
};

export const TOPICS = CURRICULUM.map((unit) => ({
  id: unit.id,
  stage: unit.stage,
  name: unit.name,
  en: unit.en,
  ...unitTheme(unit.id, unit.icon),
  words: unit.rows.map(([en, ko], index) => {
    const id = `${unit.id}:${en.toLowerCase()}`;
    const examples = curatedExamples(en, curriculumExamples(id));
    return {
    id,
    en,
    ko,
    icon: semanticIcon(en, ko, examples.partOfSpeech),
    topic: unit.id,
    stage: unit.stage,
    order: index + 1,
    source: unit.stage === 'prep' ? '예비고1 필수 영단어 200' : '2024~2026 모의고사 대비 후보본',
    reviewStatus: 'reviewed',
    legacyIds: [],
    ...examples,
  };
  }),
}));

export const ALL_WORDS = TOPICS.flatMap((topic) => topic.words);
export const WORD_BY_ID = Object.fromEntries(ALL_WORDS.map((word) => [word.id, word]));
export const topicById = (id) => TOPICS.find((topic) => topic.id === id);
