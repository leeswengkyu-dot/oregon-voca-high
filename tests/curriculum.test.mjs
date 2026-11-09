import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS,ALL_WORDS,WORD_BY_ID} from '../src/data/words.js';
import {TOPICS as LEGACY} from '../src/data/legacy-words.js';
import {STAGES,stageById,wordProgress,levelProgress,quizForTopic,passingScore,normalizeSentence} from '../src/data/levels.js';
import {SCENES,sceneForUnit} from '../src/data/scenes.js';
test('three levels contain exactly 300, 400 and 500 bilingual vocabulary entries',()=>{assert.equal(TOPICS.length,60);assert.equal(ALL_WORDS.length,1200);assert.equal(new Set(ALL_WORDS.map(w=>w.id)).size,1200);assert.equal(new Set(ALL_WORDS.map(w=>w.en.toLowerCase()+'|'+w.ko)).size,1200);for(const stage of STAGES){const topics=TOPICS.filter(t=>t.stage===stage.id);assert.equal(topics.length,stage.units);assert.equal(topics.flatMap(t=>t.words).length,stage.target);for(const t of topics){assert.equal(t.words.length,20);for(const w of t.words)for(const k of ['en','ko','pic','ex','exKo'])assert.ok(w[k]?.trim(),w.id+' '+k);}}});
test('all 120 existing vocabulary IDs remain resolvable and progress is not double counted',()=>{for(const old of LEGACY.flatMap(t=>t.words)){const w=WORD_BY_ID[old.id];assert.ok(w,old.id);assert.equal(w.en.toLowerCase(),old.en.toLowerCase());}const w=WORD_BY_ID['school:teacher'];assert.equal(w.id,'family:teacher');const progress={'school:teacher':[2,1],'family:teacher':[1,0]};assert.deepEqual(wordProgress(progress,w),[3,1]);assert.equal(levelProgress(progress,TOPICS,'sprout').learned,1);assert.equal(levelProgress(progress,TOPICS,'stem').learned,0);});
test('quiz difficulty changes by level; all choices are unique and include the answer',()=>{for(const topic of TOPICS){const stage=stageById(topic.stage),quiz=quizForTopic(topic,()=>.37);assert.equal(quiz.length,stage.quizSize);for(const q of quiz){assert.equal(q.opts.length,stage.choices);assert.equal(new Set(q.opts.map(o=>o.id)).size,q.opts.length);assert.equal(q.opts.filter(o=>o.id===q.w.id).length,1);assert.ok(topic.stage==='sprout'?['read','listen'].includes(q.type):q.type==='context');if(q.type==='context')assert.ok(q.cloze.includes('_____'),q.w.id);}}assert.deepEqual(STAGES.map(s=>passingScore(s.quizSize)),[8,10,12]);});
test('all three levels reach their exact denominators without inflating aliases',()=>{const p=Object.fromEntries(ALL_WORDS.map(w=>[w.id,[1,0]]));for(const stage of STAGES)assert.deepEqual(levelProgress(p,TOPICS,stage.id),{learned:stage.target,total:stage.target});assert.equal(stageById('invalid').id,'sprout');});

test('fifteen role-play simulations cover all 60 units with level-specific missions',()=>{
  assert.equal(SCENES.length,15);
  assert.deepEqual(STAGES.map(stage=>SCENES.filter(scene=>scene.stage===stage.id).length),[5,5,5]);
  const covered=SCENES.flatMap(scene=>scene.words);
  assert.equal(covered.length,60);
  assert.deepEqual(new Set(covered),new Set(TOPICS.map(topic=>topic.id)));
  for(const scene of SCENES){
    const expectedSteps=scene.stage==='sprout'?4:scene.stage==='stem'?5:6;
    assert.ok(scene.location&&scene.role&&scene.goal&&scene.intro,scene.id);
    assert.equal(scene.steps.length,expectedSteps);
    assert.equal(new Set(scene.steps.map(step=>step.say)).size,expectedSteps);
    assert.ok(scene.steps.every(step=>step.choices.length===4&&step.answer>=0&&step.answer<4));
    assert.ok(scene.steps.every(step=>scene.words.includes(WORD_BY_ID[step.wordId]?.topic)),scene.id);
    assert.ok(scene.steps.every(step=>!/^Can you find “|^Let's use|^Choose the sentence that uses/.test(step.say)),scene.id);
    if(scene.stage==='sprout')assert.ok(scene.steps.every(step=>step.type==='pick'));
    if(scene.stage==='stem')assert.ok(scene.steps.every(step=>step.type==='reply'));
    if(scene.stage==='tree')assert.ok(scene.steps.every(step=>step.type==='decision'&&step.grammarTarget));
  }
  for(const topic of TOPICS){
    const scene=sceneForUnit(topic.id);
    assert.ok(scene,topic.id);
    assert.equal(scene.stage,topic.stage);
  }
});
test('sentence checking preserves grammar and ignores terminal punctuation and case',()=>{assert.equal(normalizeSentence(' I  can do it. '),normalizeSentence('i can do it'));assert.notEqual(normalizeSentence('I can do it.'),normalizeSentence('I do it.'));});
