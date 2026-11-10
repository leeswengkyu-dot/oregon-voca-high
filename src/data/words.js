import { CURRICULUM } from './high-school-source.js';

export { STAGES } from './levels.js';

const buildExamples = (en, ko) => ({
  ex: `The passage uses "${en}" as an important key word.`,
  exKo: `이 글에서는 "${en}"을(를) '${ko}'의 의미로 사용합니다.`,
  ex2: `Readers should understand "${en}" to follow the writer's point.`,
  ex2Ko: `글쓴이의 요지를 이해하려면 "${en}"의 문맥상 의미를 파악해야 합니다.`,
});

const EXACT_ICONS = {
  abandon: '🚪', ability: '💪', absorb: '🧽', abstract: '💭', academic: '🎓',
  accept: '🤝', access: '🔑', accommodate: '🏠', accomplish: '🏆', accurate: '🎯',
  achieve: '🏅', acquire: '📥', adapt: '🦎', adequate: '✅', adjust: '🎛️',
  admit: '🎟️', adopt: '🫶', advantage: '📈', advocate: '📣', affect: '🌊',
  analyze: '🔍', anticipate: '🔮', approach: '🚶', assess: '📋', attempt: '🧰',
  attitude: '😌', authority: '⚖️', available: '🟢', benefit: '🎁', challenge: '🧗',
  communicate: '💬', compare: '⚖️', concept: '💡', concentrate: '🎯', consequence: '🌊',
  context: '🧩', contrast: '↔️', contribute: '🤲', determine: '🧭', distinguish: '🔀',
  distribute: '📦', diverse: '🌈', efficient: '⚡', eliminate: '🗑️', evidence: '🔎',
  evolve: '🌱', expand: '📏', focus: '🎯', generate: '⚙️', hypothesis: '🧪',
  identify: '🏷️', influence: '🌊', integrate: '🧩', interpret: '📖', measure: '📏',
  objective: '🎯', perspective: '👁️', predict: '🔮', process: '⚙️', strategy: '♟️',
};

const ICON_RULES = [
  [/(school|student|teach|learn|educat|academic|knowledge|학업|교육|학습|지식)/i, '🎓'],
  [/(speak|say|tell|talk|communicat|language|voice|말하|언어|의사소통)/i, '💬'],
  [/(write|read|text|book|passage|liter|쓰다|읽다|글|문학)/i, '📖'],
  [/(think|idea|mind|concept|reason|infer|deduc|consider|생각|개념|추론|고려)/i, '💡'],
  [/(see|view|visual|appear|observe|perceive|recognize|보다|관점|인식)/i, '👁️'],
  [/(find|search|detect|discover|evidence|investigat|발견|검색|탐지|증거)/i, '🔎'],
  [/(change|convert|transform|modify|vary|shift|adapt|adjust|변화|변형|수정|적응|조절)/i, '🔄'],
  [/(grow|develop|evolve|expand|increase|enhance|promote|성장|발전|확대|향상|촉진)/i, '🌱'],
  [/(reduce|decline|decrease|eliminate|prevent|inhibit|restrict|감소|줄이|제거|억제|제한|예방)/i, '📉'],
  [/(move|travel|walk|run|approach|pursue|withdraw|이동|접근|추구|철회)/i, '🚶'],
  [/(time|period|initial|constant|persist|maintain|retain|sustain|시간|초기|지속|유지)/i, '⏳'],
  [/(people|person|individual|social|community|public|participate|사람|개인|사회|참여)/i, '👥'],
  [/(health|medical|hospital|body|disease|건강|의료|병원|신체|질병)/i, '🩺'],
  [/(nature|environment|plant|animal|earth|climate|자연|환경|식물|동물|기후)/i, '🌿'],
  [/(science|research|experiment|chemical|hypothesis|과학|연구|실험|화학|가설)/i, '🧪'],
  [/(technology|computer|digital|data|system|기술|컴퓨터|디지털|데이터|시스템)/i, '💻'],
  [/(money|cost|economic|market|consume|product|돈|비용|경제|시장|소비|제품)/i, '💰'],
  [/(law|rule|authority|ethical|justice|prohibit|법|규칙|권위|윤리|금지)/i, '⚖️'],
  [/(danger|risk|critical|crucial|warning|위험|중요|결정적|경고)/i, '⚠️'],
  [/(feel|emotion|love|attitude|concern|bias|감정|사랑|태도|걱정|편견)/i, '❤️'],
  [/(success|achieve|accomplish|win|victory|compete|성공|성취|승리|경쟁)/i, '🏆'],
  [/(number|measure|amount|proportion|dimension|estimate|수치|측정|비율|차원|추정)/i, '📏'],
  [/(work|job|conduct|perform|implement|function|process|일|수행|시행|기능|과정)/i, '⚙️'],
  [/(place|area|home|house|building|establish|장소|지역|집|설립)/i, '🏠'],
  [/(global|world|widespread|universal|세계|전 세계|널리)/i, '🌍'],
];

export function semanticIcon(en, ko) {
  const key = en.toLowerCase();
  if (EXACT_ICONS[key]) return EXACT_ICONS[key];
  const text = `${en} ${ko}`;
  return ICON_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? '🧩';
}

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
    icon: semanticIcon(en, ko),
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
