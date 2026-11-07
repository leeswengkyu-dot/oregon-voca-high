import { UNITS } from './level1-source.js';
import { TOPICS as LEGACY_TOPICS } from './legacy-words.js';
import { EXTRA } from './curriculum-extra.js';
export { STAGES } from './levels.js';
const ids=['fruits','vegetables','animals','weather','colors','numbers','family','body','food','clothes','school','toys','feelings','nature','actions'];
const objectParticle=s=>{const n=s.codePointAt(s.length-1)-44032;return n>=0&&n<11172&&n%28?'을':'를';};
const initial=UNITS.map((u,i)=>({id:ids[i],stage:'sprout',name:u.name.replace(/섬$/,' 마을'),en:u.english,icon:u.emoji,words:u.words.map(w=>({en:w.word,ko:w.meaning,pic:w.emoji,ex:w.example,exKo:w.translation}))}));
// 같은 영어라도 'orange: 과일/색깔'처럼 뜻이 다르면 별도 어휘 항목입니다.
const color=initial.find(t=>t.id==='colors');Object.assign(color.words.find(w=>w.en==='silver'),{en:'orange',ko:'주황색',pic:'🟧',ex:'The carrot is orange.',exKo:'당근은 주황색이에요.'});
const school=initial.find(t=>t.id==='school');Object.assign(school.words.find(w=>w.en==='library'),{en:'lunchbox',ko:'도시락',pic:'🍱',ex:'This is my lunchbox.',exKo:'이것은 내 도시락이에요.'});
const feelings=initial.find(t=>t.id==='feelings');Object.assign(feelings.words.find(w=>w.en==='calm'),{en:'sick',ko:'아픈',pic:'🤒',ex:'I am sick today.',exKo:'나는 오늘 아파요.'});
const expanded=EXTRA.map(t=>({...t,words:t.rows.map(row=>{const [en,ko,ex,exKo]=row.split('|');if(!en||!ko)throw new Error(`Invalid word in ${t.id}`);if(!ex&&t.kind==='X')throw new Error(`Missing context: ${en}`);return {en:en.trim(),ko,pic:t.icon,ex:ex??`Look at the ${en}.`,exKo:exKo??`${ko}${objectParticle(ko)} 보세요.`};})}));
export const TOPICS=[...initial,...expanded].map(t=>({id:t.id,stage:t.stage,name:t.name,en:t.en,icon:t.icon,words:t.words.map(w=>({...w,id:`${t.id}:${w.en}`,topic:t.id,stage:t.stage,legacyIds:[]}))}));
export const ALL_WORDS=TOPICS.flatMap(t=>t.words);
export const WORD_BY_ID=Object.fromEntries(ALL_WORDS.map(w=>[w.id,w]));
// 기존 120개 단어의 기록·배지를 지우지 않고 새 커리큘럼의 해당 어휘로 연결합니다.
for(const old of LEGACY_TOPICS.flatMap(t=>t.words)){
 const direct=WORD_BY_ID[old.id];const target=direct??ALL_WORDS.find(w=>w.en.toLowerCase()===old.en.toLowerCase());
 if(!target)throw new Error(`Missing legacy vocabulary: ${old.id}`);
 if(!direct){target.legacyIds.push(old.id);WORD_BY_ID[old.id]=target;}
}
export const topicById=id=>TOPICS.find(t=>t.id===id);
