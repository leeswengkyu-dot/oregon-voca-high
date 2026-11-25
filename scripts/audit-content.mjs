import { ALL_WORDS, TOPICS } from '../src/data/words.js';

const errors=[];const review=[];const seenExamples=new Map();
const unsafeContext=/drowned in the deluge|nonbinary people|unarmed protesters|trying to get shot|promising to destroy your life|deadly skin cancers|colonial divide-and-conquer|political satire|culture war|violent argument|affect a smile|dark[ -]?web|\bhack(?:ing|er|ed)?\b|pornography|sexually explicit|drag shows|\b(?:heroin|opioid|xylazine|cannabis|marijuana|cocaine)\b|nuclear (?:weapons|arms)|preserving slavery|massive twat|marginalized people|scope on (?:his|her|a) rifle|solitary confinement|election fraud|schadenfreude|\bguano\b|\bchampers\b|다크 ?웹|해킹|포르노|헤로인|오피오이드|마리화나/i;
const reviewTerms=/\b(death|dead|killed|killing|murder|war|violence|violent|politics|political|religion|religious|suicide|gun|bomb|disaster|cancer|pandemic|atrocity|atrocities|rifle|firearm|prison|torture|slavery)\b|사망|죽음|살해|전쟁|폭력|종교|자살|폭탄|재난|폐암|피부암|참사|소총|교도소|노예/i;

for(const word of ALL_WORDS){
  const escaped=word.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const target=new RegExp(`(?<![a-z])${escaped}(?![a-z])`,'i');
  for(const [field,translation] of [['ex','exKo'],['ex2','ex2Ko']]){
    const value=word[field];
    if(!target.test(value))errors.push(`${word.id} ${field}: 표제어 누락`);
    if(!word[translation]||!/[가-힣]/.test(word[translation]))errors.push(`${word.id} ${translation}: 번역 누락`);
    if(/\.[\"']?\.$/.test(value)||/[.!?]{2,}$/.test(value))errors.push(`${word.id} ${field}: 문장부호 오류`);
    if(unsafeContext.test(`${value} ${word[translation]}`))errors.push(`${word.id} ${field}: 학습용으로 부적절한 맥락`);
    if(word.en!=='atrocity'&&reviewTerms.test(`${value} ${word[translation]}`))review.push(`${word.id} ${field}`);
    const normalized=value.toLowerCase().replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim();
    const prior=seenExamples.get(normalized)||[];prior.push(`${word.id}:${field}`);seenExamples.set(normalized,prior);
  }
  if(word.ex===word.ex2)errors.push(`${word.id}: 예문 중복`);
}
const repeated=[...seenExamples.entries()].filter(([,ids])=>ids.length>4);
if(ALL_WORDS.length!==1100)errors.push(`단어 수 오류: ${ALL_WORDS.length}`);
if(TOPICS.length!==55)errors.push(`단원 수 오류: ${TOPICS.length}`);

console.log(`콘텐츠 감사: 단어 ${ALL_WORDS.length}, 예문 ${ALL_WORDS.length*2}, 단원 ${TOPICS.length}`);
console.log(`자동검사 오류 ${errors.length}, 민감 맥락 수동검토 표식 ${review.length}, 과다 반복 예문 ${repeated.length}`);
if(review.length)console.log(`수동검토 표식(최대 20): ${review.slice(0,20).join(', ')}`);
if(repeated.length)console.log(`반복 예문(최대 10): ${repeated.slice(0,10).map(([,ids])=>ids.join(' / ')).join(' | ')}`);
if(errors.length){console.error(errors.slice(0,50).join('\n'));process.exitCode=1;}
