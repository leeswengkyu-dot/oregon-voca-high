export const STAGES = [
 {id:'sprout',level:1,name:'새싹 숲',grade:'초등 1~2학년',icon:'🌱',color:'#7cc576',target:300,units:15,description:'그림과 소리로 만나는 첫 영어',skills:'친숙한 명사 · 쉬운 표현',quizSize:10,choices:3},
 {id:'stem',level:2,name:'줄기 숲',grade:'초등 3~4학년',icon:'🌿',color:'#3fa36b',target:400,units:20,description:'하루의 이야기를 영어로 말해요',skills:'생활 어휘 · 동작 동사 · 기초 형용사',quizSize:12,choices:4},
 {id:'tree',level:3,name:'나무 숲',grade:'초등 5~6학년',icon:'🌳',color:'#0b4d2c',target:500,units:25,description:'생각을 연결해 문장으로 표현해요',skills:'핵심 동사 · 형용사 · 부사 · 전치사 · 접속사',quizSize:15,choices:4},
];
export const stageById=id=>STAGES.find(s=>s.id===id)??STAGES[0];
export const normalizeSentence=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/[.!?]+$/,'').trim().replace(/\s+/g,' ');
export const passingScore=total=>Math.ceil(total*.8);
export function wordProgress(progress,word){return [word.id,...(word.legacyIds??[])].reduce((sum,key)=>{const p=progress?.[key]??[0,0];return [sum[0]+Number(p[0]??0),sum[1]+Number(p[1]??0)];},[0,0]);}
export function levelProgress(progress,topics,stage){const words=topics.filter(t=>t.stage===stage).flatMap(t=>t.words);return {learned:words.filter(w=>wordProgress(progress,w)[0]>0).length,total:words.length};}
const shuffleWith=(items,random)=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function clozeExample(word){const escaped=word.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return word.ex.replace(new RegExp('\\b'+escaped+'\\b','i'),'_____');}
export function quizForTopic(topic,random=Math.random){const stage=stageById(topic.stage);return shuffleWith(topic.words,random).slice(0,stage.quizSize).map((w,k)=>({w,type:stage.level===1?(k%2?'read':'listen'):'context',opts:shuffleWith([w,...shuffleWith(topic.words.filter(o=>o.id!==w.id),random).slice(0,stage.choices-1)],random),cloze:clozeExample(w)}));}
