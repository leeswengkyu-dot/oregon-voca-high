import { TOPICS } from './words.js';

const LEVEL_STYLE = {
  sprout: { level: 1, steps: 4, suffix: '그림 탐험', npc: '🧚', npcName: '새싹 요정', bg: '#e8f6ec', intro: '그림과 소리를 보고 알맞은 단어를 찾아요.' },
  stem: { level: 2, steps: 5, suffix: '생활 대화', npc: '🧑‍🏫', npcName: '생활 영어 선생님', bg: '#fff3d6', intro: '학교와 일상생활에서 쓰는 문장을 골라 대화를 완성해요.' },
  tree: { level: 3, steps: 6, suffix: '문장 연구소', npc: '🤖', npcName: '문장 로봇', bg: '#f3ecfb', intro: '핵심 단어와 문법을 연결해 중학교 영어 문장을 완성해요.' },
};

const GRAMMAR_TARGETS = [
  '핵심 동사', '형용사', '시간·빈도 부사', '방법·정도 부사', '장소·방향 전치사',
  '시간 전치사', 'and · but · or · so', 'because · if', 'when · before · after',
  '주어와 동사', '현재·과거·미래', '부정문과 의문문', '조동사', '문장 확장', '이유와 의견',
];

function choicesWithAnswer(correct, distractors, answer) {
  const choices = distractors.slice(0, 3);
  choices.splice(answer, 0, correct);
  return choices;
}

function pictureStep(topic, index) {
  const word = topic.words[index];
  const answer = index % 4;
  const distractors = topic.words.filter((item) => item.id !== word.id).slice(index + 1).concat(topic.words).slice(0, 3);
  return {
    type: 'pick', wordId: word.id,
    say: `Can you find ${word.en}?`, sayKo: `${word.ko}을(를) 찾아볼까요?`,
    prompt: `그림을 보고 “${word.ko}”을(를) 골라요`,
    choices: choicesWithAnswer([word.pic, word.en, word.ko], distractors.map((item) => [item.pic, item.en, item.ko]), answer),
    answer, after: `Great! This is ${word.en}.`,
  };
}

function lifeStep(topic, index) {
  const word = topic.words[index];
  const answer = index % 4;
  const distractors = topic.words.filter((item) => item.id !== word.id).slice(index + 1).concat(topic.words).slice(0, 3);
  return {
    type: 'reply', wordId: word.id,
    say: `Let's use “${word.en}” in a daily sentence.`, sayKo: `${word.ko}을(를) 생활 문장에 사용해 봐요.`,
    prompt: `${word.exKo} — 알맞은 영어 문장을 골라요`,
    choices: choicesWithAnswer([word.ex, word.exKo], distractors.map((item) => [item.ex, item.exKo]), answer),
    answer, after: `Excellent! “${word.en}” fits this situation.`,
  };
}

function structureStep(topic, topicIndex, index) {
  const word = topic.words[index];
  const answer = (index + 1) % 4;
  const distractors = topic.words.filter((item) => item.id !== word.id).slice(index + 2).concat(topic.words).slice(0, 3);
  const grammarTarget = GRAMMAR_TARGETS[(topicIndex + index) % GRAMMAR_TARGETS.length];
  return {
    type: 'sentence', wordId: word.id, grammarTarget,
    say: `Choose the sentence that uses “${word.en}” correctly.`, sayKo: `${word.ko}의 쓰임과 문장 구조를 확인해요.`,
    prompt: `${grammarTarget} · “${word.ko}”을(를) 알맞게 사용한 문장을 골라요`,
    choices: choicesWithAnswer([word.ex, word.exKo], distractors.map((item) => [item.ex, item.exKo]), answer),
    answer, after: `Well done! You completed a ${grammarTarget} sentence.`,
  };
}

function createScene(topic) {
  const style = LEVEL_STYLE[topic.stage];
  const stageTopics = TOPICS.filter((item) => item.stage === topic.stage);
  const stageIndex = stageTopics.findIndex((item) => item.id === topic.id);
  const steps = Array.from({ length: style.steps }, (_, index) => {
    if (topic.stage === 'sprout') return pictureStep(topic, index);
    if (topic.stage === 'stem') return lifeStep(topic, index);
    return structureStep(topic, stageIndex, index);
  });
  return {
    id: `unit-${topic.id}`, unitId: topic.id, stage: topic.stage, level: style.level,
    name: `${topic.name} ${style.suffix}`, icon: topic.icon, bg: style.bg,
    npc: style.npc, npcName: style.npcName, words: [topic.id],
    intro: `LEVEL ${style.level} · ${topic.name}. ${style.intro}`,
    steps,
  };
}

export const SCENES = TOPICS.map(createScene);
export const sceneById = (id) => SCENES.find((scene) => scene.id === id);
export const sceneForUnit = (unitId) => SCENES.find((scene) => scene.unitId === unitId);
