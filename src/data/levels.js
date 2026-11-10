export const STAGES = [
  { id: 'prep', level: 0, label: 'PREP', name: '예비고1', grade: '예비 고등학생', icon: '🚀', color: '#0f766e', target: 200, units: 10, description: '고등 영어를 시작하는 핵심 200단어', skills: '기본 독해 어휘 · 문맥 이해 · 철자', quizSize: 10, choices: 4 },
  { id: 'grade1', level: 1, label: '고1', name: '고1', grade: '고등학교 1학년', icon: '📘', color: '#2563eb', target: 300, units: 15, description: '고1 모의고사 대비 핵심 어휘', skills: '기본 독해 · 어휘 추론 · 문장 적용', quizSize: 15, choices: 4 },
  { id: 'grade2', level: 2, label: '고2', name: '고2', grade: '고등학교 2학년', icon: '📗', color: '#7c3aed', target: 300, units: 15, description: '고2 모의고사 대비 확장 어휘', skills: '문맥 분석 · 유의어 구별 · 빈칸 추론', quizSize: 15, choices: 4 },
  { id: 'grade3', level: 3, label: '고3', name: '고3', grade: '고등학교 3학년', icon: '🎓', color: '#be123c', target: 300, units: 15, description: '고3 수능 대비 심화 어휘', skills: '수능 독해 · 고난도 문맥 · 어휘 완성', quizSize: 15, choices: 4 },
];

export const stageById = (id) => STAGES.find((stage) => stage.id === id) ?? STAGES[0];
export const normalizeSentence = (sentence) => String(sentence).normalize('NFKC').trim().toLowerCase().replace(/[.!?]+$/, '').trim().replace(/\s+/g, ' ');
export const passingScore = (total) => Math.ceil(total * 0.8);

export function wordProgress(progress, word) {
  return [word.id, ...(word.legacyIds ?? [])].reduce((sum, key) => {
    const value = progress?.[key] ?? [0, 0];
    return [sum[0] + Number(value[0] ?? 0), sum[1] + Number(value[1] ?? 0)];
  }, [0, 0]);
}

export function levelProgress(progress, topics, stage) {
  const words = topics.filter((topic) => topic.stage === stage).flatMap((topic) => topic.words);
  return { learned: words.filter((word) => wordProgress(progress, word)[0] > 0).length, total: words.length };
}

const shuffleWith = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

export function clozeExample(word) {
  const escaped = word.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return word.ex.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '_____');
}

export function quizForTopic(topic, random = Math.random) {
  const stage = stageById(topic.stage);
  return shuffleWith(topic.words, random).slice(0, stage.quizSize).map((word) => ({
    w: word,
    type: 'context',
    opts: shuffleWith([word, ...shuffleWith(topic.words.filter((other) => other.id !== word.id), random).slice(0, stage.choices - 1)], random),
    cloze: clozeExample(word),
  }));
}
