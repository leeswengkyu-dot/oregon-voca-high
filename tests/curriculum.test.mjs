import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, ALL_WORDS, WORD_BY_ID } from '../src/data/words.js';
import { STAGES, stageById, wordProgress, levelProgress, quizForTopic, passingScore, normalizeSentence } from '../src/data/levels.js';

test('four levels contain 200, 300, 300 and 300 learning entries', () => {
  assert.equal(TOPICS.length, 55);
  assert.equal(ALL_WORDS.length, 1100);
  assert.equal(new Set(ALL_WORDS.map((word) => word.id)).size, 1100);
  assert.deepEqual(STAGES.map((stage) => stage.target), [200, 300, 300, 300]);
  assert.deepEqual(STAGES.map((stage) => stage.units), [10, 15, 15, 15]);
  for (const stage of STAGES) {
    const topics = TOPICS.filter((topic) => topic.stage === stage.id);
    assert.equal(topics.length, stage.units);
    assert.equal(topics.flatMap((topic) => topic.words).length, stage.target);
    for (const topic of topics) {
      assert.equal(topic.words.length, 20);
      for (const word of topic.words) {
        for (const key of ['en', 'ko', 'icon', 'ex', 'exKo', 'ex2', 'ex2Ko']) assert.ok(word[key]?.trim(), `${word.id} ${key}`);
        assert.notEqual(word.icon, '🔤');
        assert.equal(WORD_BY_ID[word.id], word);
      }
    }
  }
});

test('semantic icons replace the repeated abc placeholder', () => {
  const prep = TOPICS.find((topic) => topic.id === 'prep-01').words;
  assert.deepEqual(prep.slice(0, 5).map((word) => word.icon), ['🚪', '💪', '🧽', '💭', '🎓']);
  assert.equal(ALL_WORDS.some((word) => /abc|🔤/i.test(word.icon)), false);
  assert.ok(new Set(ALL_WORDS.map((word) => word.icon)).size >= 20);
});

test('prep list preserves the approved image order and boundaries', () => {
  const prep = TOPICS.filter((topic) => topic.stage === 'prep').flatMap((topic) => topic.words);
  assert.equal(prep[0].en, 'abandon');
  assert.equal(prep[0].ko, '버리다, 포기하다');
  assert.equal(prep.at(-1).en, 'yield');
  assert.equal(prep.at(-1).ko, '산출하다, 양보하다');
  assert.equal(new Set(prep.map((word) => word.en.toLowerCase())).size, 200);
});

test('same spelling in different levels keeps independent progress IDs', () => {
  const ability = ALL_WORDS.filter((word) => word.en.toLowerCase() === 'ability');
  assert.ok(ability.length >= 2);
  assert.equal(new Set(ability.map((word) => word.id)).size, ability.length);
  const progress = { [ability[0].id]: [2, 1] };
  assert.deepEqual(wordProgress(progress, ability[0]), [2, 1]);
  assert.deepEqual(wordProgress(progress, ability[1]), [0, 0]);
});

test('context quizzes have unique choices and include the answer', () => {
  for (const topic of TOPICS) {
    const stage = stageById(topic.stage);
    const quiz = quizForTopic(topic, () => 0.37);
    assert.equal(quiz.length, stage.quizSize);
    for (const question of quiz) {
      assert.equal(question.type, 'context');
      assert.equal(question.opts.length, stage.choices);
      assert.equal(new Set(question.opts.map((option) => option.id)).size, question.opts.length);
      assert.equal(question.opts.filter((option) => option.id === question.w.id).length, 1);
      assert.ok(question.cloze.includes('_____'), question.w.id);
    }
  }
  assert.deepEqual(STAGES.map((stage) => passingScore(stage.quizSize)), [8, 12, 12, 12]);
});

test('level progress reaches exact denominators', () => {
  const progress = Object.fromEntries(ALL_WORDS.map((word) => [word.id, [1, 0]]));
  for (const stage of STAGES) assert.deepEqual(levelProgress(progress, TOPICS, stage.id), { learned: stage.target, total: stage.target });
  assert.equal(stageById('invalid').id, 'prep');
});

test('sentence checking preserves grammar and ignores terminal punctuation and case', () => {
  assert.equal(normalizeSentence(' I can do it. '), normalizeSentence('i can do it'));
  assert.notEqual(normalizeSentence('I can do it.'), normalizeSentence('I do it.'));
});
