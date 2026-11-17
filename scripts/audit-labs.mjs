import { FAMILY_QUESTIONS } from '../src/data/csat-labs.js';

const errors=[];
const token=(text,word)=>new RegExp(`(?:^|[^A-Za-z])${word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:$|[^A-Za-z])`,'i').test(text);
const targets={noun:0,verb:0,adjective:0,adverb:0};

if(FAMILY_QUESTIONS.length!==60)errors.push(`단어 변신 문항 수가 60개가 아닙니다: ${FAMILY_QUESTIONS.length}`);
for(const level of ['core','challenge']){
  const count=FAMILY_QUESTIONS.filter(item=>item.level===level).length;
  if(count!==30)errors.push(`${level} 문항 수가 30개가 아닙니다: ${count}`);
}
for(const item of FAMILY_QUESTIONS){
  targets[item.target]=(targets[item.target]||0)+1;
  const prefix=`${item.id}(${item.base})`;
  if(item.source.toLowerCase()===item.answer.toLowerCase())errors.push(`${prefix}: 제시어와 정답이 같습니다.`);
  if((item.sentence.match(/_____/g)||[]).length!==1)errors.push(`${prefix}: 빈칸은 정확히 1개여야 합니다.`);
  if(token(item.sentence,item.answer))errors.push(`${prefix}: 문장에 정답이 노출됩니다.`);
  if(!item.translation?.trim())errors.push(`${prefix}: 한글 해석이 없습니다.`);
  if(!item.explain?.includes(item.answer))errors.push(`${prefix}: 품사 해설에 정답이 없습니다.`);
  if(item.choices.length!==4||new Set(item.choices.map(x=>x.toLowerCase())).size!==4)errors.push(`${prefix}: 보기 4개가 고유하지 않습니다.`);
  if(item.choices.filter(x=>x===item.answer).length!==1)errors.push(`${prefix}: 정답은 보기에 정확히 1개 있어야 합니다.`);
}
for(const [target,count] of Object.entries(targets))if(count<5)errors.push(`${target} 문항이 너무 적습니다: ${count}`);

if(errors.length){console.error(`연구소 문항 감사 실패 ${errors.length}건\n${errors.join('\n')}`);process.exit(1);}
console.log(`연구소 문항 감사: ${FAMILY_QUESTIONS.length}문항, 정답 노출 0, 중복 보기 0, 해석 누락 0`);
