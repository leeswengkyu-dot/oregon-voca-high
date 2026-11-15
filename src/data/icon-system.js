// 의미를 설명하지 못하는 공통 책/abc 아이콘 대신 학습 맥락을 보여 주는 아이콘 체계입니다.
// 단원은 학습 여정의 성격을, 단어는 뜻과 품사를 우선해 결정합니다.

const unit = (icon, theme) => ({ icon, theme });

export const UNIT_THEMES = {
  'prep-01': unit('🧭', '고등 영어의 출발'), 'prep-02': unit('🔍', '분석과 판단'),
  'prep-03': unit('🧠', '개념과 사고'), 'prep-04': unit('🔗', '문맥과 논리'),
  'prep-05': unit('🌈', '차이와 변화'), 'prep-06': unit('🌱', '발전과 확장'),
  'prep-07': unit('💬', '해석과 상호작용'), 'prep-08': unit('🎯', '목표와 가능성'),
  'prep-09': unit('🛠️', '과정과 해결'), 'prep-10': unit('♟️', '전략과 결과'),

  'grade1-01': unit('🚀', '기초 역량'), 'grade1-02': unit('📣', '표현과 소통'),
  'grade1-03': unit('⚖️', '태도와 균형'), 'grade1-04': unit('🏗️', '선택과 도전'),
  'grade1-05': unit('🤝', '관계와 공동체'), 'grade1-06': unit('🗺️', '방향과 발견'),
  'grade1-07': unit('✨', '노력과 성장'), 'grade1-08': unit('🧪', '경험과 탐구'),
  'grade1-09': unit('🌍', '사람과 사회'), 'grade1-10': unit('💡', '정보와 발명'),
  'grade1-11': unit('📚', '지식과 관찰'), 'grade1-12': unit('🪴', '가능성과 연습'),
  'grade1-13': unit('🔧', '생산과 개선'), 'grade1-14': unit('🛡️', '문제와 해결'),
  'grade1-15': unit('🌟', '미래와 가치'),

  'grade2-01': unit('🧰', '변화와 실행'), 'grade2-02': unit('🏛️', '조직과 체계'),
  'grade2-03': unit('🧬', '과학과 분류'), 'grade2-04': unit('🧩', '구성과 논증'),
  'grade2-05': unit('🗳️', '기준과 사회'), 'grade2-06': unit('🌿', '환경과 다양성'),
  'grade2-07': unit('📈', '경제와 시대'), 'grade2-08': unit('🧭', '추론과 지침'),
  'grade2-09': unit('🏙️', '제도와 산업'), 'grade2-10': unit('📖', '서술과 변화'),
  'grade2-11': unit('⚙️', '운영과 선택'), 'grade2-12': unit('📊', '절차와 성과'),
  'grade2-13': unit('🧱', '책임과 제한'), 'grade2-14': unit('🧲', '자극과 강화'),
  'grade2-15': unit('🌐', '도시와 전환'),

  'grade3-01': unit('🏔️', '원칙과 성취'), 'grade3-02': unit('🕊️', '자율과 열망'),
  'grade3-03': unit('🔬', '인지와 검증'), 'grade3-04': unit('🧵', '통합과 제약'),
  'grade3-05': unit('📉', '결핍과 판단'), 'grade3-06': unit('🔥', '붕괴와 회복'),
  'grade3-07': unit('🧯', '오류와 대응'), 'grade3-08': unit('🪞', '성향과 관점'),
  'grade3-09': unit('🧱', '한계와 혁신'), 'grade3-10': unit('⚙️', '개입과 동력'),
  'grade3-11': unit('🌀', '패러다임과 변화'), 'grade3-12': unit('🛤️', '전제와 추진'),
  'grade3-13': unit('🩹', '회복과 보완'), 'grade3-14': unit('🧊', '긴장과 종합'),
  'grade3-15': unit('🌅', '전환과 전망'),
};

const EXACT_ICONS = {
  abandon: '🚪', ability: '💪', absorb: '🧽', abstract: '💭', academic: '🎓',
  accept: '🤝', access: '🔑', accommodate: '🏠', accomplish: '🏆', accurate: '🎯',
  achieve: '🏅', acquire: '📥', adapt: '🦎', adequate: '✅', adjust: '🎛️',
  admit: '🎟️', adopt: '🫶', advantage: '📈', advocate: '📣', affect: '🌊',
  analyze: '🔍', anticipate: '🔮', approach: '🚶', assess: '📋', attempt: '🧰',
  attitude: '🙂', authority: '⚖️', available: '🟢', benefit: '🎁', challenge: '🧗',
  communicate: '💬', compare: '⚖️', concept: '💡', concentrate: '🎯', consequence: '↪️',
  context: '🔗', contrast: '↔️', contribute: '🤲', determine: '🧭', distinguish: '🔀',
  distribute: '📦', diverse: '🌈', efficient: '⚡', eliminate: '🗑️', evidence: '🔎',
  evolve: '🌱', expand: '📏', focus: '🎯', generate: '⚙️', hypothesis: '🧪',
  identify: '🏷️', influence: '🌊', integrate: '🧩', interpret: '📖', measure: '📏',
  objective: '🎯', perspective: '👁️', predict: '🔮', process: '⚙️', strategy: '♟️',
};

const ICON_RULES = [
  [/(school|student|teach|learn|educat|academic|knowledge|학업|교육|학습|지식|학교)/i, '🎓'],
  [/(speak|say|tell|talk|communicat|language|voice|announce|말하|언어|의사소통|발표)/i, '💬'],
  [/(write|read|text|book|passage|liter|narrative|쓰다|읽다|글|문학|서술)/i, '📖'],
  [/(think|idea|mind|concept|reason|infer|deduc|consider|cognitive|생각|개념|추론|고려|인지)/i, '💡'],
  [/(see|view|visual|appear|observe|perceive|recognize|visible|보다|관점|인식|관찰|가시)/i, '👁️'],
  [/(find|search|detect|discover|evidence|investigat|inquiry|inspect|발견|검색|탐지|증거|조사)/i, '🔎'],
  [/(change|convert|transform|modify|vary|shift|adapt|adjust|alter|mutate|변화|변형|수정|적응|조절|바꾸)/i, '🔄'],
  [/(grow|develop|evolve|expand|increase|enhance|promote|progress|foster|성장|발전|확대|향상|촉진|증가)/i, '🌱'],
  [/(reduce|decline|decrease|eliminate|prevent|inhibit|restrict|diminish|curtail|감소|줄이|제거|억제|제한|예방|축소)/i, '📉'],
  [/(move|travel|walk|run|approach|pursue|withdraw|migrate|transport|journey|이동|접근|추구|철회|여행|운송)/i, '🚶'],
  [/(time|period|initial|constant|persist|maintain|retain|sustain|duration|temporary|eternal|시간|초기|지속|유지|일시|영원)/i, '⏳'],
  [/(people|person|individual|social|community|public|participate|citizen|society|human|사람|개인|사회|참여|시민|인간)/i, '👥'],
  [/(health|medical|hospital|body|disease|allergy|immune|epidemic|건강|의료|병원|신체|질병|면역|유행병)/i, '🩺'],
  [/(nature|environment|plant|animal|earth|climate|ecology|biodiversity|organic|자연|환경|식물|동물|기후|생태)/i, '🌿'],
  [/(science|research|experiment|chemical|hypothesis|genetic|bacteria|empirical|과학|연구|실험|화학|가설|유전|세균)/i, '🧪'],
  [/(technology|computer|digital|data|system|automatic|simulate|기술|컴퓨터|디지털|데이터|시스템|자동|모의)/i, '💻'],
  [/(money|cost|economic|market|consume|product|income|budget|wealth|invest|돈|비용|경제|시장|소비|제품|소득|예산|투자)/i, '💰'],
  [/(law|legal|rule|authority|ethical|justice|prohibit|jurisdiction|sanction|법|규칙|권위|윤리|금지|관할|제재)/i, '⚖️'],
  [/(danger|risk|critical|crucial|warning|hazard|threat|jeopard|위험|중요|결정적|경고|위협)/i, '⚠️'],
  [/(feel|emotion|love|attitude|concern|bias|anxiety|fear|afraid|감정|사랑|태도|걱정|편견|불안|두려)/i, '❤️'],
  [/(success|achieve|accomplish|win|victory|compete|award|reward|성공|성취|승리|경쟁|보상)/i, '🏆'],
  [/(number|measure|amount|proportion|dimension|estimate|quantity|percentage|density|frequency|수치|측정|비율|차원|추정|수량|밀도|빈도)/i, '📏'],
  [/(work|job|conduct|perform|implement|function|process|operate|labor|career|employ|일|수행|시행|기능|과정|작동|노동|직업|고용)/i, '⚙️'],
  [/(place|area|home|house|building|establish|urban|local|domestic|장소|지역|집|설립|도시|국내)/i, '🏠'],
  [/(global|world|widespread|universal|universe|세계|전 세계|널리|우주)/i, '🌍'],
  [/(create|creative|invent|design|formulate|devise|innovation|창조|창의|발명|설계|고안|혁신)/i, '🛠️'],
  [/(connect|relate|associate|interact|cooperate|collaborate|relationship|연결|관련|상호작용|협력|관계)/i, '🔗'],
  [/(choose|choice|select|option|prefer|priority|alternative|선택|선호|우선|대안)/i, '☑️'],
  [/(protect|defend|safe|security|preserve|rescue|보호|방어|안전|보존|구조)/i, '🛡️'],
  [/(help|assist|support|provide|service|facilitate|aid|돕|지원|제공|서비스|용이)/i, '🤲'],
  [/(build|structure|component|constitute|comprise|integrate|construct|구성|통합|건설|짓다)/i, '🏗️'],
  [/(order|sequence|arrange|organize|category|classify|hierarchy|순서|정리|범주|분류|위계)/i, '🗂️'],
  [/(true|valid|correct|accurate|precise|exact|authentic|credible|타당|정확|옳|진정|믿을)/i, '✅'],
  [/(wrong|error|false|invalid|distort|misinterpret|fallacious|잘못|오류|왜곡|무효)/i, '❌'],
  [/(strong|strength|reinforce|robust|bolster|강하|강화|튼튼)/i, '💪'],
  [/(light|bright|visible|transparent|clarify|clear|밝|투명|명확)/i, '🔆'],
  [/(culture|tradition|history|ancient|heritage|문화|전통|역사|고대)/i, '🏺'],
  [/(government|policy|democracy|politic|institution|bureaucracy|정부|정책|민주|제도|관료)/i, '🏛️'],
  [/(art|beauty|aesthetic|creative|genre|예술|아름|미적|장르)/i, '🎨'],
  [/(sound|music|voice|hear|listen|소리|음악|음성|듣)/i, '🎧'],
  [/(food|ingredient|consume|eat|product|음식|재료|먹|소비)/i, '🍽️'],
  [/(energy|power|accelerate|momentum|impetus|stimulate|에너지|힘|가속|동력|자극)/i, '⚡'],
  [/(balance|equal|equivalent|fair|equitable|impartial|균형|동등|공정)/i, '⚖️'],
  [/(problem|issue|obstacle|barrier|difficulty|challenge|문제|쟁점|장애|난제)/i, '🧱'],
  [/(solution|resolve|repair|remedy|recover|해결|수리|치료|회복)/i, '🩹'],
];

const PART_FALLBACK = {
  verb: '🎬', noun: '🗂️', adjective: '🔎', adverb: '➡️',
  conjunction: '🔗', preposition: '🧭',
};

export function semanticIcon(en, ko, partOfSpeech) {
  const key = en.toLowerCase();
  if (EXACT_ICONS[key]) return EXACT_ICONS[key];
  const text = `${en} ${ko}`;
  return ICON_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? PART_FALLBACK[partOfSpeech] ?? '💡';
}

export function unitTheme(id, fallbackIcon) {
  return UNIT_THEMES[id] ?? { icon: fallbackIcon || '🧭', theme: '핵심 어휘 탐구' };
}
