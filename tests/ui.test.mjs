import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import * as css from 'css-tree';
import {TOPICS,STAGES,ALL_WORDS,WORD_BY_ID,topicById} from '../src/data/words.js';
import {SCENES,sceneById,sceneForUnit} from '../src/data/scenes.js';
import {stageById,wordProgress,levelProgress,quizForTopic,passingScore,normalizeSentence} from '../src/data/levels.js';
const tick=()=>new Promise(r=>setTimeout(r,5));
async function harness(){
 const {window,document}=parseHTML('<html><body><div id="app"></div></body></html>');const memory=new Map();
 const location={_hash:'#/home',get hash(){return this._hash;},set hash(value){this._hash=value;window.dispatchEvent(new window.Event('hashchange'));}};
 window.scrollTo=()=>{};
 const context=vm.createContext({window,document,location,crypto,structuredClone,console,URLSearchParams,TOPICS,STAGES,ALL_WORDS,WORD_BY_ID,topicById,SCENES,sceneById,sceneForUnit,stageById,wordProgress,levelProgress,quizForTopic,passingScore,normalizeSentence,
  localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},
  setTimeout:(fn,ms)=>{const t=setTimeout(fn,ms);t.unref();return t;},clearTimeout,confirm:()=>true,prompt:()=>null,createClient:()=>{throw Error('Unexpected real Supabase client');}});
 const strip=s=>s.replace(/^import .*?;\s*$/gm,'').replace(/import\.meta\.env/g,'({})').replace(/^export \{.*?\};?\s*$/gm,'').replace(/^export /gm,'');
 vm.runInContext(strip(readFileSync(new URL('../src/db.js',import.meta.url),'utf8'))+'\n'+strip(readFileSync(new URL('../src/main.js',import.meta.url),'utf8'))+'\n globalThis.h={api,state,routes,render,go,store};',context);
 await tick();const h=context.h;h.state.sound=false;h.state.me=await h.api.enter(1,'테스트 대원','1234');await h.routes.home();
 return {h,context,window,document,memory};
}
test('four level tabs show 10/15/15/15 units with correct denominators',async()=>{const x=await harness();assert.equal(x.document.querySelectorAll('.stage-tab').length,4);assert.equal(x.document.querySelectorAll('.village').length,10);assert.ok(x.document.querySelector('.level-summary').textContent.includes('/ 200'));for(const stage of ['grade1','grade2','grade3']){x.document.querySelector(`[data-s="${stage}"]`).onclick();await tick();assert.equal(x.document.querySelectorAll('.village').length,15);assert.ok(x.document.querySelector('.level-summary').textContent.includes('/ 300'));}});
test('high-school units omit the junior role-play section',async()=>{const x=await harness();assert.equal(x.document.querySelectorAll('.scene-card').length,0);assert.equal(x.document.querySelector('.scene-grid'),null);x.h.routes.topic('prep-01');assert.equal(x.document.querySelector('a[href^="#/scene/"]'),null);assert.ok(x.document.body.textContent.includes('문장 구조 학습'));});
test('five-word lessons resume checkpoints and record progress only for their level',async()=>{const x=await harness();x.h.routes.topic('grade1-01');assert.equal(x.document.querySelectorAll('.part-card').length,4);x.h.routes.learn('grade1-01','0');assert.equal(x.document.querySelectorAll('.dots i').length,5);await x.document.querySelector('#next').onclick();await x.document.querySelector('#next').onclick();assert.equal(x.h.state.me.checkpoints['grade1-01:0'].index,2);x.h.routes.learn('grade1-01','0');assert.ok(x.document.querySelector('.muted.small').textContent.includes('3 / 5'));for(let i=0;i<3;i++)await x.document.querySelector('#next').onclick();assert.equal(x.h.state.me.checkpoints['grade1-01:0'].complete,true);assert.equal(levelProgress(x.h.state.me.progress,TOPICS,'grade1').learned,5);assert.equal(levelProgress(x.h.state.me.progress,TOPICS,'prep').learned,0);});
test('lost save response can be retried without awarding duplicate points',async()=>{const x=await harness();x.h.routes.learn('prep-01','0');for(let i=0;i<4;i++)await x.document.querySelector('#next').onclick();const save=x.h.api.saveResult;let first=true;x.h.api.saveResult=async(...args)=>{const result=await save(...args);if(first){first=false;throw Error('연결 중단');}return result;};const pending=x.document.querySelector('#next').onclick();await tick();assert.ok(x.document.querySelector('#retry-result'));x.document.querySelector('#retry-result').onclick();await pending;assert.equal(x.h.state.me.acorns,3);assert.equal(levelProgress(x.h.state.me.progress,TOPICS,'prep').learned,5);});
test('context quizzes and sentence blocks work with duplicate tokens',async()=>{const x=await harness();x.h.routes.quiz('grade1-01');assert.ok(x.document.querySelector('.context-sentence').textContent.includes('_____'));assert.equal(x.document.querySelectorAll('.opt').length,4);assert.ok(x.document.querySelector('.qhead').textContent.includes('/ 15'));const fixture={id:'repeat-fixture',stage:'grade3',name:'문장 테스트',words:Array.from({length:5},(_,i)=>({id:'fixture:'+i,en:'learn',ko:'배우다',ex:'I can learn and I can play.',exKo:'나는 배우고 놀 수 있어요.'}))};x.context.topicById=id=>id==='repeat-fixture'?fixture:topicById(id);x.h.routes.sentence('repeat-fixture');const pool=x.document.querySelector('#sentence-pool');assert.ok(pool);assert.equal([...pool.querySelectorAll('button')].filter(b=>b.textContent==='I').length,2);const count=pool.querySelectorAll('button').length;for(let i=0;i<count;i++){const b=x.document.querySelector(`#sentence-pool [data-k="${i}"]`);x.document.querySelector('#sentence-pool').onclick({target:b});}assert.equal(x.document.querySelectorAll('#sentence-answer button').length,count);});
test('voice recognition requires teacher-confirmed guardian consent and CSS is valid',async()=>{const x=await harness();x.h.routes.speak('prep-01');assert.ok(x.document.querySelector('.page').textContent.includes('보호자 동의'));assert.equal(x.document.querySelector('#mic'),null);const errors=[];css.parse(readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),{onParseError:e=>errors.push(e.message)});assert.deepEqual(errors,[]);});
test('scenario dialogue waits for answer and reaction speech before advancing',()=>{const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');assert.match(main,/await speak\(st\.type === 'pick'/);assert.match(main,/await speak\(st\.after\)/);assert.doesNotMatch(main,/setTimeout\(step,\s*1300\)/);});

test('invited administrators receive a first-password setup flow',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const db=readFileSync(new URL('../src/db.js',import.meta.url),'utf8');
  assert.match(main,/관리자 계정 만들기/);
  assert.match(main,/completePasswordSetup/);
  assert.match(db,/authFlowType === 'invite'/);
  assert.match(db,/updateUser\(\{password\}\)/);
});
