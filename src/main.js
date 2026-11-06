import './style.css';
import { STAGES, TOPICS, WORD_BY_ID, topicById } from './data/words.js';
import { SCENES, sceneById } from './data/scenes.js';
import { api, isOnline, store } from './db.js';

// ================= 공통 도우미 =================
const app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const $ = (sel, root = app) => root.querySelector(sel);
const $$ = (sel, root = app) => [...root.querySelectorAll(sel)];

const RANKS = [
  { min: 0, name: '새싹 대원', icon: '🌱' },
  { min: 50, name: '다람쥐 대원', icon: '🐿️' },
  { min: 150, name: '사슴 대원', icon: '🦌' },
  { min: 300, name: '부엉이 대원', icon: '🦉' },
  { min: 500, name: '숲지기', icon: '🌲' },
];
const rankOf = (n) => RANKS.filter((r) => n >= r.min).pop();
const nextRank = (n) => RANKS.find((r) => r.min > n);

// ---- 소리: 발음(TTS)과 효과음 ----
// 기기마다 음성이 늦게 로드되거나(크롬), 첫 터치 전에는 소리를 막거나(아이폰·안드로이드),
// 취소 직후 바로 말하면 소리가 사라지는(크롬) 문제가 있어 아래처럼 보완합니다.
const hasTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let enVoice = null; let voicesChecked = false; let ttsUnlocked = false; let speakTimer = null;
function pickVoice() {
  if (!hasTTS) return;
  const all = speechSynthesis.getVoices();
  if (all.length) voicesChecked = true;
  const vs = all.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const us = vs.filter((v) => /en[-_]US/i.test(v.lang));
  enVoice = us.find((v) => /Google|Samantha|Aria|Jenny|Ava|Zira|Natural/i.test(v.name))
    || us[0] || vs.find((v) => /GB|AU/i.test(v.lang)) || vs[0] || null;
}
if (hasTTS) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  speechSynthesis.onvoiceschanged = pickVoice;
  // 일부 브라우저는 voiceschanged 이벤트를 보내지 않아 몇 번 더 확인
  let tries = 0; const poll = setInterval(() => { pickVoice(); if (enVoice || ++tries > 20) { voicesChecked = true; clearInterval(poll); } }, 250);
  // 첫 터치 때 무음 발화로 음성 기능을 깨워 둠 (모바일 자동재생 제한 대응)
  const unlock = () => {
    if (ttsUnlocked) return; ttsUnlocked = true;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'en-US'; speechSynthesis.speak(u); } catch { /* noop */ }
    try { speechSynthesis.resume(); } catch { /* noop */ }
  };
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });
}
function speak(text, rate = 0.85) {
  if (!hasTTS || !text) return;
  if (!enVoice) pickVoice();
  clearTimeout(speakTimer);
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  // 취소 직후 곧바로 말하면 크롬에서 소리가 사라지므로 잠깐 쉬고 말함
  speakTimer = setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = enVoice ? enVoice.lang : 'en-US'; u.rate = rate; u.pitch = 1.05; u.volume = 1;
    if (enVoice) u.voice = enVoice;
    try { speechSynthesis.resume(); } catch { /* noop */ }
    speechSynthesis.speak(u);
  }, 80);
}
function stopSpeak() { if (hasTTS) { clearTimeout(speakTimer); speechSynthesis.cancel(); } }
function voiceHelp(always = false) {
  const st = voiceStatus();
  if (st.ok && !always) return '';
  return `<div class="voice-help ${st.ok ? 'ok' : ''}"><b>${st.ok ? '🔊' : '🔇'} ${st.msg}</b>
    ${st.ok ? '<small>소리가 안 들리면 기기 음량과 무음(매너) 모드를 확인해 주세요.</small>' : `<ul>
      <li><b>윈도우 PC</b>: 설정 → 시간 및 언어 → 음성 → 음성 추가 → <i>English (United States)</i> 설치 후 새로고침 (크롬·엣지 권장)</li>
      <li><b>안드로이드</b>: 설정 → 일반 → 텍스트 음성 변환 → Google 음성 엔진 → 영어(미국) 음성 데이터 설치</li>
      <li><b>아이폰·아이패드</b>: 설정 → 손쉬운 사용 → 읽기 및 말하기 → 음성 → 영어 음성 다운로드, 무음 모드 해제</li>
      <li>카카오톡·네이버 앱 안에서 열었다면 <b>크롬이나 사파리</b>로 다시 열어 주세요.</li></ul>`}</div>`;
}
function voiceStatus() {
  if (!hasTTS) return { ok: false, msg: '이 브라우저는 읽어 주기 기능을 지원하지 않아요. 크롬이나 사파리로 열어 주세요.' };
  if (enVoice) return { ok: true, msg: `영어 음성: ${enVoice.name}` };
  if (!voicesChecked) return { ok: false, msg: '음성을 불러오는 중이에요. 잠시 뒤 다시 눌러 주세요.' };
  return { ok: false, msg: '이 기기에 영어 음성이 없어요. 아래 방법으로 영어 음성을 추가해 주세요.' };
}
let actx = null;
function beep(good) {
  if (!state.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = good ? [660, 880] : [220, 180];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(); const g = actx.createGain();
      o.type = good ? 'triangle' : 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, actx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.18, actx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + i * 0.12 + 0.18);
      o.connect(g).connect(actx.destination); o.start(actx.currentTime + i * 0.12); o.stop(actx.currentTime + i * 0.12 + 0.2);
    });
  } catch { /* 소리를 못 내는 환경 */ }
}
function confetti() {
  const box = document.createElement('div'); box.className = 'confetti';
  const items = ['🌰', '⭐', '🍃', '🎉', '✨'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span'); s.textContent = items[i % items.length];
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * 0.5 + 's';
    s.style.fontSize = 18 + Math.random() * 18 + 'px'; box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

// ================= 상태 =================
const state = {
  me: null,             // { id, name, class_name, acorns, badges, progress, token }
  sound: store.get('ojv_sound', true),
  subtitle: store.get('ojv_sub', true),
  stage: store.get('ojv_stage', 'sprout'),
  teacherPw: null,
};
const session = { get: () => store.get('ojv_session', null), set: (v) => store.set('ojv_session', v), clear: () => store.del('ojv_session') };

async function save(result) {
  try {
    const me = await api.saveResult(state.me.id, state.me.token, result);
    const before = rankOf(state.me.acorns);
    state.me = me;
    const after = rankOf(me.acorns);
    if (after.min > before.min) setTimeout(() => { confetti(); toast(`${after.icon} ${after.name}(으)로 승급했어요!`); }, 600);
  } catch (e) {
    toast('저장하지 못했어요: ' + e.message);
  }
}
const learnedIn = (topic) => topic.words.filter((w) => (state.me.progress[w.id] || [0])[0] > 0).length;

// ================= 라우터 =================
const routes = {};
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
window.addEventListener('hashchange', render);
async function render() {
  stopSpeak();
  const [path, ...args] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  if (path === 'teacher') return routes.teacher();
  if (!state.me) return routes.login();
  const fn = routes[path] || routes.home;
  window.scrollTo(0, 0);
  return fn(...args.map(decodeURIComponent));
}

function topbar(title, back = '#/home') {
  return `<header class="topbar">
    <a class="back" href="${back}" aria-label="뒤로">←</a>
    <h1>${title}</h1>
    <span class="acorn-pill">🌰 ${state.me ? state.me.acorns : 0}</span>
  </header>`;
}

// ================= 로그인 =================
routes.login = async () => {
  app.innerHTML = `<div class="login">
    <img class="login-logo" src="/logo.png" alt="뉴오리건영어학원">
    <h1 class="title-kid">보카 트레일 <span>주니어</span></h1>
    <p class="sub">오리건 숲 탐험대에 입장해요! 🌲</p>
    <form class="card form" id="f">
      <label>우리 반</label>
      <div class="class-pick" id="classes"><span class="muted">불러오는 중…</span></div>
      <label for="nm">이름</label>
      <input id="nm" maxlength="20" autocomplete="off" placeholder="예) 김하늘" required>
      <label for="pin">비밀번호 (숫자 4자리)</label>
      <input id="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" type="password" placeholder="••••" required>
      <p class="hint">처음이면 이름과 비밀번호를 정하면 바로 대원이 돼요.</p>
      <p class="err" id="err"></p>
      <button class="btn big primary" type="submit">탐험 시작! 🚀</button>
    </form>
    <a class="teacher-link" href="#/teacher">👩‍🏫 선생님 화면</a>
    ${isOnline ? '' : '<p class="demo">체험 모드: 기록이 이 기기에만 저장돼요</p>'}
  </div>`;
  let classId = store.get('ojv_last_class', null);
  try {
    const classes = await api.listClasses();
    const box = $('#classes');
    if (!classes.length) { box.innerHTML = '<span class="muted">선생님이 반을 만들어야 해요</span>'; return; }
    if (!classes.some((c) => c.id === classId)) classId = null;
    box.innerHTML = classes.map((c) => `<button type="button" class="chip ${c.id === classId ? 'on' : ''}" data-id="${c.id}">${esc(c.name)}</button>`).join('');
    box.onclick = (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      classId = Number(b.dataset.id); $$('.chip', box).forEach((x) => x.classList.toggle('on', x === b));
    };
  } catch (e) { $('#classes').innerHTML = `<span class="err">반 목록을 못 불러왔어요 (${esc(e.message)})</span>`; }
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    const err = $('#err'); err.textContent = '';
    if (!classId) { err.textContent = '우리 반을 골라 주세요'; return; }
    const btn = $('#f button[type=submit]'); btn.disabled = true;
    try {
      const me = await api.enter(classId, $('#nm').value, $('#pin').value);
      state.me = me; session.set({ id: me.id, token: me.token }); store.set('ojv_last_class', classId);
      speak('Welcome, explorer!');
      go('#/home');
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  };
};

// ================= 홈(숲 지도) =================
routes.home = async () => {
  const me = state.me; const r = rankOf(me.acorns); const nx = nextRank(me.acorns);
  const pct = nx ? Math.round(((me.acorns - r.min) / (nx.min - r.min)) * 100) : 100;
  const topics = TOPICS.filter((t) => t.stage === state.stage);
  const stage = STAGES.find((s) => s.id === state.stage);
  app.innerHTML = `
  <header class="hero">
    <div class="hero-row">
      <img src="/emblem.png" alt="" class="emblem">
      <div class="hero-txt">
        <div class="academy">NEW OREGON 초등부</div>
        <div class="hello">${r.icon} <b>${esc(me.name)}</b> 대원님, 안녕!</div>
        <div class="muted small">${esc(me.class_name)} · ${r.name}</div>
      </div>
      <button class="icon-btn" id="menu" aria-label="설정">⚙️</button>
    </div>
    <div class="rank-bar"><div style="width:${pct}%"></div></div>
    <div class="rank-meta"><span>🌰 도토리 ${me.acorns}개</span><span>${nx ? `${nx.icon} ${nx.name}까지 ${nx.min - me.acorns}개` : '최고 계급 달성! 🏆'}</span></div>
  </header>

  <nav class="stage-tabs">
    ${STAGES.map((s) => `<button class="stage-tab ${s.id === state.stage ? 'on' : ''}" data-s="${s.id}">${s.icon} ${s.name}<small>${s.grade}</small></button>`).join('')}
  </nav>

  <section>
    <h2 class="sec">${stage.icon} ${stage.name} 마을 지도</h2>
    <div class="trail">
      ${topics.map((t, i) => {
        const n = learnedIn(t); const badge = me.badges.includes('topic:' + t.id);
        return `<a class="village ${i % 2 ? 'r' : 'l'}" href="#/topic/${t.id}">
          <span class="v-icon">${t.icon}</span>
          <span class="v-name">${t.name}<small>${t.en}</small></span>
          <span class="v-prog"><i style="width:${n * 10}%"></i></span>
          <span class="v-count">${badge ? '🏅' : `${n}/10`}</span>
        </a>`;
      }).join('')}
    </div>
  </section>

  <section>
    <h2 class="sec">🎬 상황 시뮬레이션</h2>
    <div class="scene-grid">
      ${SCENES.map((s) => `<a class="scene-card" href="#/scene/${s.id}" style="background:${s.bg}">
        <span class="s-icon">${s.icon}</span><b>${s.name}</b>
        <small>${s.npc} ${s.npcName}와 대화 ${me.badges.includes('scene:' + s.id) ? '· 🏅' : ''}</small></a>`).join('')}
    </div>
  </section>

  <section class="two">
    <div class="card">
      <h3>🏆 이번 주 우리 반 열심상</h3>
      <ol class="top5" id="top5"><li class="muted">불러오는 중…</li></ol>
    </div>
    <div class="card">
      <h3>🏅 내 배지 (${me.badges.length})</h3>
      <div class="badges">${me.badges.length ? me.badges.map(badgeChip).join('') : '<span class="muted">마을 퀴즈 8개 이상 맞히면 배지를 받아요!</span>'}</div>
    </div>
  </section>
  <footer class="foot">뉴오리건영어학원 · New Oregon English Academy</footer>`;

  $$('.stage-tab').forEach((b) => b.onclick = () => { state.stage = b.dataset.s; store.set('ojv_stage', state.stage); render(); });
  $('#menu').onclick = settingsSheet;
  try {
    const top = await api.weeklyTop(me.id, me.token);
    $('#top5').innerHTML = top.length
      ? top.map((t, i) => `<li><span class="medal">${['🥇', '🥈', '🥉', '4', '5'][i]}</span>${esc(t.name)}<b>🌰 ${t.acorns}</b></li>`).join('')
      : '<li class="muted">이번 주 첫 번째 주인공이 되어 봐요!</li>';
  } catch { $('#top5').innerHTML = '<li class="muted">순위를 불러오지 못했어요</li>'; }
};
function badgeChip(b) {
  const [kind, id] = b.split(':');
  if (kind === 'topic') { const t = topicById(id); return t ? `<span class="badge">${t.icon} ${t.name}</span>` : ''; }
  if (kind === 'scene') { const s = sceneById(id); return s ? `<span class="badge">${s.icon} ${s.name}</span>` : ''; }
  return '';
}
function settingsSheet() {
  const d = document.createElement('div'); d.className = 'sheet-bg';
  d.innerHTML = `<div class="sheet">
    <h3>설정</h3>
    <label class="row"><span>효과음</span><input type="checkbox" id="snd" ${state.sound ? 'checked' : ''}></label>
    <label class="row"><span>한글 자막 보기</span><input type="checkbox" id="sub" ${state.subtitle ? 'checked' : ''}></label>
    <button class="btn" id="test">🔊 발음 소리 확인</button>
    <div id="vstat"></div>
    <button class="btn danger" id="out">로그아웃</button>
    <button class="btn ghost" id="close">닫기</button>
  </div>`;
  document.body.appendChild(d);
  const close = () => d.remove();
  d.onclick = (e) => { if (e.target === d) close(); };
  d.querySelector('#snd').onchange = (e) => { state.sound = e.target.checked; store.set('ojv_sound', state.sound); };
  d.querySelector('#sub').onchange = (e) => { state.subtitle = e.target.checked; store.set('ojv_sub', state.subtitle); };
  d.querySelector('#test').onclick = () => {
    speak('Hello! Welcome to New Oregon English Academy.');
    setTimeout(() => { d.querySelector('#vstat').innerHTML = voiceHelp(true); }, 400);
  };
  d.querySelector('#out').onclick = () => { session.clear(); state.me = null; close(); go('#/login'); };
  d.querySelector('#close').onclick = close;
}

// ================= 주제(마을) =================
const hasSTT = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
routes.topic = (id) => {
  const t = topicById(id); if (!t) return go('#/home');
  const badge = state.me.badges.includes('topic:' + t.id);
  app.innerHTML = `${topbar(`${t.icon} ${t.name}`)}
  <div class="page">
    <div class="modes">
      <a class="mode m1" href="#/learn/${t.id}"><span>📖</span><b>단어 카드</b><small>보고 듣고 따라 말하기</small></a>
      <a class="mode m2" href="#/match/${t.id}"><span>🃏</span><b>짝 맞추기</b><small>그림과 단어 짝 찾기</small></a>
      <a class="mode m3" href="#/spell/${t.id}"><span>🎈</span><b>스펠링 풍선</b><small>철자 순서대로 터뜨리기</small></a>
      ${hasSTT ? `<a class="mode m4" href="#/speak/${t.id}"><span>🎤</span><b>말하기 도전</b><small>소리 내어 읽어 봐요</small></a>` : ''}
      <a class="mode m5 wide" href="#/quiz/${t.id}"><span>${badge ? '🏅' : '🎯'}</span><b>마을 퀴즈</b><small>${badge ? '배지 획득 완료! 다시 도전해 도토리 모으기' : '10문제 중 8개 이상 맞히면 배지!'}</small></a>
    </div>
    <h2 class="sec">이 마을 단어 (${learnedIn(t)}/10 익힘)</h2>
    <div class="word-grid">
      ${t.words.map((w) => { const p = state.me.progress[w.id] || [0, 0];
        return `<button class="word-tile ${p[0] > 0 ? 'done' : ''}" data-en="${esc(w.en)}"><span class="pic">${w.pic}</span><b>${esc(w.en)}</b><small>${esc(w.ko)}</small></button>`; }).join('')}
    </div>
  </div>`;
  $$('.word-tile').forEach((b) => b.onclick = () => speak(b.dataset.en));
};

// ---- 단어 카드 ----
routes.learn = (id) => {
  const t = topicById(id); if (!t) return go('#/home');
  let i = 0; let flipped = false;
  const draw = () => {
    const w = t.words[i];
    app.innerHTML = `${topbar('📖 단어 카드', '#/topic/' + t.id)}
    <div class="page center">
      <div class="dots">${t.words.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('')}</div>
      <div class="flash ${flipped ? 'flipped' : ''}" id="card">
        <div class="face front"><span class="pic xl">${w.pic}</span><b class="word">${esc(w.en)}</b><small>카드를 누르면 뜻이 나와요</small></div>
        <div class="face back"><span class="pic">${w.pic}</span><b class="word">${esc(w.en)}</b><span class="ko">${esc(w.ko)}</span>
          <p class="ex">${esc(w.ex)}</p>${state.subtitle ? `<p class="ex-ko">${esc(w.exKo)}</p>` : ''}</div>
      </div>
      <div class="row-btns">
        <button class="btn" id="say">🔊 단어</button>
        <button class="btn" id="slow">🐢 천천히</button>
        <button class="btn" id="sent">💬 예문</button>
      </div>
      <div class="row-btns">
        <button class="btn ghost" id="prev" ${i === 0 ? 'disabled' : ''}>◀ 이전</button>
        <button class="btn primary" id="next">${i === t.words.length - 1 ? '다 봤어요! ✅' : '다음 ▶'}</button>
      </div>
      <div id="vhelp"></div>
    </div>`;
    speak(w.en);
    setTimeout(() => { const h = $('#vhelp'); if (h) h.innerHTML = voiceHelp(); }, 1500);
    $('#card').onclick = () => { flipped = !flipped; $('#card').classList.toggle('flipped', flipped); if (flipped) setTimeout(() => speak(w.ex), 300); };
    $('#say').onclick = () => speak(w.en);
    $('#slow').onclick = () => speak(w.en, 0.5);
    $('#sent').onclick = () => speak(w.ex);
    $('#prev').onclick = () => { i--; flipped = false; draw(); };
    $('#next').onclick = async () => {
      if (i < t.words.length - 1) { i++; flipped = false; draw(); return; }
      await save({ kind: 'learn', topic: t.id, score: 10, total: 10, acorns: 3 });
      finish({ title: '단어 카드 완료!', emoji: '📖', lines: ['10개 단어를 모두 살펴봤어요.'], acorns: 3, back: '#/topic/' + t.id, again: '#/learn/' + t.id });
    };
  };
  draw();
};

// ---- 결과 화면 ----
function finish({ title, emoji, lines = [], acorns = 0, stars = 0, back, again, badge }) {
  confetti(); beep(true);
  app.innerHTML = `${topbar('결과', back)}
  <div class="page center result">
    <div class="big-emoji bounce">${emoji}</div>
    <h2>${title}</h2>
    ${stars ? `<div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>` : ''}
    ${lines.map((l) => `<p>${l}</p>`).join('')}
    <p class="earn">🌰 도토리 +${acorns}</p>
    ${badge ? `<p class="new-badge">🏅 새 배지: ${badge}</p>` : ''}
    <div class="row-btns">
      ${again ? `<a class="btn" href="${again}">🔁 다시 하기</a>` : ''}
      <a class="btn primary" href="${back}">계속하기 ▶</a>
    </div>
  </div>`;
}

// ---- 마을 퀴즈 (듣고 고르기 + 보고 고르기) ----
routes.quiz = (id) => {
  const t = topicById(id); if (!t) return go('#/home');
  const qs = shuffle(t.words).map((w, k) => ({ w, type: k % 2 ? 'read' : 'listen', opts: shuffle([w, ...sample(t.words.filter((x) => x.id !== w.id), 3)]) }));
  let i = 0; let score = 0; const log = [];
  const draw = () => {
    const q = qs[i];
    app.innerHTML = `${topbar('🎯 마을 퀴즈', '#/topic/' + t.id)}
    <div class="page center">
      <div class="qhead"><span>${i + 1} / ${qs.length}</span><span>✅ ${score}</span></div>
      <div class="progress"><i style="width:${(i / qs.length) * 100}%"></i></div>
      ${q.type === 'listen'
        ? `<p class="ask">잘 듣고 알맞은 그림을 골라요</p><button class="speaker" id="play">🔊</button>
           <div class="opts pics">${q.opts.map((o) => `<button class="opt" data-id="${o.id}"><span class="pic">${o.pic}</span></button>`).join('')}</div>`
        : `<p class="ask">그림에 맞는 영어 단어를 골라요</p><div class="pic xl">${q.w.pic}</div>${state.subtitle ? `<p class="muted">${esc(q.w.ko)}</p>` : ''}
           <div class="opts words">${q.opts.map((o) => `<button class="opt" data-id="${o.id}">${esc(o.en)}</button>`).join('')}</div>`}
    </div>`;
    if (q.type === 'listen') {
      speak(q.w.en); $('#play').onclick = () => speak(q.w.en);
      if (i === 0) setTimeout(() => { const st = voiceStatus(); if (!st.ok && $('.page')) $('.page').insertAdjacentHTML('beforeend', voiceHelp()); }, 1500);
    }
    let locked = false;
    $$('.opt').forEach((b) => b.onclick = () => {
      if (locked) return; locked = true;
      const ok = b.dataset.id === q.w.id; log.push({ id: q.w.id, ok });
      if (ok) score++;
      beep(ok); b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) $$('.opt').find((x) => x.dataset.id === q.w.id).classList.add('right');
      speak(q.w.en);
      setTimeout(async () => {
        i++; if (i < qs.length) return draw();
        const pass = score >= 8; const key = 'topic:' + t.id; const isNew = pass && !state.me.badges.includes(key);
        const ac = score + (isNew ? 10 : 0);
        await save({ kind: 'quiz', topic: t.id, score, total: qs.length, acorns: ac, words: log, badge: pass ? key : null });
        finish({ title: pass ? '퀴즈 통과! 🎉' : '조금만 더 힘내요!', emoji: pass ? '🏆' : '💪', stars: score >= 10 ? 3 : score >= 8 ? 2 : score >= 5 ? 1 : 0,
          lines: [`${qs.length}문제 중 <b>${score}개</b> 맞혔어요.`, pass ? '' : '8개 이상 맞히면 배지를 받아요.'],
          acorns: ac, badge: isNew ? `${t.icon} ${t.name}` : null, back: '#/topic/' + t.id, again: '#/quiz/' + t.id });
      }, ok ? 900 : 1600);
    });
  };
  draw();
};

// ---- 짝 맞추기 ----
routes.match = (id) => {
  const t = topicById(id); if (!t) return go('#/home');
  const words = sample(t.words, 6);
  const cards = shuffle(words.flatMap((w) => [{ w, side: 'pic' }, { w, side: 'en' }]));
  let open = []; let found = 0; let tries = 0; let busy = false;
  app.innerHTML = `${topbar('🃏 짝 맞추기', '#/topic/' + t.id)}
  <div class="page center">
    <p class="ask">그림 카드와 영어 단어 카드의 짝을 찾아요!</p>
    <div class="qhead"><span>찾은 짝 <b id="found">0</b>/6</span><span>시도 <b id="tries">0</b></span></div>
    <div class="memory">${cards.map((c, k) => `<button class="mcard" data-k="${k}"><span class="back">🌲</span><span class="front">${c.side === 'pic' ? `<span class="pic">${c.w.pic}</span>` : `<b>${esc(c.w.en)}</b>`}</span></button>`).join('')}</div>
  </div>`;
  $$('.mcard').forEach((b) => b.onclick = () => {
    const k = Number(b.dataset.k);
    if (busy || b.classList.contains('open')) return;
    b.classList.add('open'); open.push(k);
    if (cards[k].side === 'en') speak(cards[k].w.en);
    if (open.length < 2) return;
    tries++; $('#tries').textContent = tries;
    const [a, c] = open; open = [];
    if (cards[a].w.id === cards[c].w.id) {
      found++; $('#found').textContent = found; beep(true); speak(cards[a].w.en);
      $$('.mcard').filter((x) => [a, c].includes(Number(x.dataset.k))).forEach((x) => x.classList.add('matched'));
      if (found === 6) setTimeout(async () => {
        const stars = tries <= 8 ? 3 : tries <= 12 ? 2 : 1; const ac = 3 + stars;
        await save({ kind: 'match', topic: t.id, score: 6, total: tries, acorns: ac, words: words.map((w) => ({ id: w.id, ok: true })) });
        finish({ title: '짝을 모두 찾았어요!', emoji: '🃏', stars, lines: [`${tries}번 만에 성공!`], acorns: ac, back: '#/topic/' + t.id, again: '#/match/' + t.id });
      }, 700);
    } else {
      busy = true; beep(false);
      setTimeout(() => { $$('.mcard').filter((x) => [a, c].includes(Number(x.dataset.k))).forEach((x) => x.classList.remove('open')); busy = false; }, 900);
    }
  });
};

// ---- 스펠링 풍선 ----
routes.spell = (id) => {
  const t = topicById(id); if (!t) return go('#/home');
  const words = sample(t.words.filter((w) => /^[a-z]+$/.test(w.en) && w.en.length <= 10), 5);
  let i = 0; let total = 0; const log = [];
  const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac'];
  const draw = () => {
    const w = words[i]; let pos = 0; let miss = 0;
    const letters = shuffle(w.en.split('').map((ch, k) => ({ ch, k })));
    app.innerHTML = `${topbar('🎈 스펠링 풍선', '#/topic/' + t.id)}
    <div class="page center">
      <div class="qhead"><span>${i + 1} / ${words.length}</span><span>🌰 ${total}</span></div>
      <div class="pic xl">${w.pic}</div>
      <p class="muted">${esc(w.ko)} <button class="mini" id="play">🔊</button></p>
      <div class="slots">${w.en.split('').map(() => '<span class="slot"></span>').join('')}</div>
      <p class="ask">순서대로 풍선을 터뜨려 철자를 완성해요!</p>
      <div class="balloons">${letters.map((l, k) => `<button class="balloon" data-ch="${l.ch}" style="--c:${colors[k % colors.length]};--d:${(k % 4) * 0.3}s">${l.ch}</button>`).join('')}</div>
      <button class="btn ghost small" id="hint">💡 힌트</button>
    </div>`;
    speak(w.en); $('#play').onclick = () => speak(w.en);
    $('#hint').onclick = () => { miss++; const b = $$('.balloon').find((x) => !x.classList.contains('pop') && x.dataset.ch === w.en[pos]); if (b) { b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 1200); } };
    $$('.balloon').forEach((b) => b.onclick = () => {
      if (b.classList.contains('pop')) return;
      if (b.dataset.ch === w.en[pos]) {
        b.classList.add('pop'); $$('.slot')[pos].textContent = b.dataset.ch; $$('.slot')[pos].classList.add('fill'); pos++;
        beep(true);
        if (pos === w.en.length) {
          const ac = miss === 0 ? 2 : 1; total += ac; log.push({ id: w.id, ok: miss === 0 }); speak(w.en);
          setTimeout(async () => {
            i++; if (i < words.length) return draw();
            const good = log.filter((l) => l.ok).length;
            await save({ kind: 'spell', topic: t.id, score: good, total: words.length, acorns: total, words: log });
            finish({ title: '스펠링 완성!', emoji: '🎈', stars: good === 5 ? 3 : good >= 3 ? 2 : 1, lines: [`실수 없이 ${good}개 완성했어요.`], acorns: total, back: '#/topic/' + t.id, again: '#/spell/' + t.id });
          }, 900);
        }
      } else { miss++; beep(false); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
    });
  };
  draw();
};

// ---- 말하기 도전 ----
routes.speak = (id) => {
  const t = topicById(id); if (!t) return go('#/home');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return go('#/topic/' + id);
  const words = sample(t.words, 5); let i = 0; let total = 0; const log = [];
  const draw = () => {
    const w = words[i]; let tries = 0;
    app.innerHTML = `${topbar('🎤 말하기 도전', '#/topic/' + t.id)}
    <div class="page center">
      <div class="qhead"><span>${i + 1} / ${words.length}</span><span>🌰 ${total}</span></div>
      <div class="pic xl">${w.pic}</div>
      <b class="word">${esc(w.en)}</b><p class="muted">${esc(w.ko)}</p>
      <button class="btn" id="listen">🔊 먼저 들어 보기</button>
      <button class="mic" id="mic">🎤</button>
      <p class="ask" id="msg">마이크를 누르고 단어를 말해 봐요!</p>
      <button class="btn ghost small" id="skip">건너뛰기 ▶</button>
    </div>`;
    speak(w.en);
    const next = async (ok, ac) => {
      log.push({ id: w.id, ok }); total += ac; i++;
      if (i < words.length) return setTimeout(draw, 900);
      const good = log.filter((l) => l.ok).length;
      await save({ kind: 'speak', topic: t.id, score: good, total: words.length, acorns: total, words: log });
      finish({ title: '말하기 도전 끝!', emoji: '🎤', stars: good === 5 ? 3 : good >= 3 ? 2 : 1, lines: [`${words.length}개 중 ${good}개를 정확히 말했어요.`], acorns: total, back: '#/topic/' + t.id, again: '#/speak/' + t.id });
    };
    $('#listen').onclick = () => speak(w.en);
    $('#skip').onclick = () => next(false, 0);
    $('#mic').onclick = () => {
      const rec = new SR(); rec.lang = 'en-US'; rec.maxAlternatives = 5; rec.interimResults = false;
      const mic = $('#mic'); mic.classList.add('on'); $('#msg').textContent = '듣고 있어요… 🎧';
      rec.onresult = (e) => {
        const alts = [...e.results[0]].map((r) => r.transcript.toLowerCase());
        const ok = alts.some((a) => a.replace(/[^a-z ]/g, '').includes(w.en));
        tries++;
        if (ok) { beep(true); $('#msg').innerHTML = `<b class="good">훌륭해요! 🎉</b> "${esc(alts[0])}"`; next(true, 2); }
        else { beep(false); $('#msg').innerHTML = `"${esc(alts[0])}"(으)로 들렸어요. ${tries >= 2 ? '' : '다시 해 볼까요?'}`; if (tries >= 3) next(false, 1); }
      };
      rec.onerror = () => { $('#msg').textContent = '소리를 못 들었어요. 다시 눌러 주세요.'; };
      rec.onend = () => mic.classList.remove('on');
      try { rec.start(); } catch { /* 이미 듣는 중 */ }
    };
  };
  draw();
};

// ================= 상황 시뮬레이션 =================
routes.scene = (id) => {
  const sc = sceneById(id); if (!sc) return go('#/home');
  let i = -1; let miss = 0;
  const chat = [];
  const bubble = (who, en, ko) => `<div class="msg ${who}"><span class="ava">${who === 'npc' ? sc.npc : '🧒'}</span><div class="bub"><button class="say" data-say="${esc(en)}">🔊</button> ${esc(en)}${ko && state.subtitle ? `<small>${esc(ko)}</small>` : ''}</div></div>`;
  const draw = () => {
    const st = sc.steps[i];
    app.innerHTML = `${topbar(`${sc.icon} ${sc.name}`, '#/home')}
    <div class="scene" style="background:${sc.bg}">
      <div class="stage-npc"><span class="npc-big">${sc.npc}</span><span class="npc-name">${sc.npcName}</span>
        <span class="step-dots">${sc.steps.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</span></div>
      <div class="chat" id="chat">${chat.join('')}</div>
      <div class="answer">
        <p class="ask">👉 ${esc(st.prompt)}</p>
        <div class="opts ${st.type === 'pick' ? 'pics' : 'sentences'}">
          ${st.choices.map((c, k) => st.type === 'pick'
            ? `<button class="opt" data-k="${k}"><span class="pic">${c[0]}</span><small>${esc(c[1])}</small></button>`
            : `<button class="opt" data-k="${k}">${esc(c[0])}${state.subtitle ? `<small>${esc(c[1])}</small>` : ''}</button>`).join('')}
        </div>
      </div>
    </div>`;
    const ch = $('#chat'); ch.scrollTop = ch.scrollHeight;
    $$('.say').forEach((b) => b.onclick = () => speak(b.dataset.say));
    let locked = false;
    $$('.opt').forEach((b) => b.onclick = () => {
      if (locked) return;
      const k = Number(b.dataset.k); const c = st.choices[k];
      if (k === st.answer) {
        locked = true; beep(true); b.classList.add('right');
        const mine = st.type === 'pick' ? `${c[0]} ${c[1]}` : c[0];
        speak(st.type === 'pick' ? c[1] : c[0]);
        setTimeout(() => {
          chat.push(bubble('me', mine, st.type === 'pick' ? c[2] : c[1]));
          chat.push(bubble('npc', st.after, ''));
          speak(st.after);
          setTimeout(step, 1300);
        }, 600);
      } else {
        miss++; beep(false); b.classList.add('wrong', 'shake'); setTimeout(() => b.classList.remove('shake'), 400);
        speak(st.type === 'pick' ? c[1] : c[0]);
      }
    });
  };
  const step = async () => {
    i++;
    if (i < sc.steps.length) {
      const st = sc.steps[i]; chat.push(bubble('npc', st.say, st.sayKo)); draw(); speak(st.say); return;
    }
    const stars = miss === 0 ? 3 : miss <= 2 ? 2 : 1; const key = 'scene:' + sc.id; const isNew = !state.me.badges.includes(key);
    const ac = 4 + stars * 2 + (isNew ? 5 : 0);
    const words = sc.steps.filter((s) => s.type === 'pick').map((s) => {
      const en = s.choices[s.answer][1]; const w = Object.values(WORD_BY_ID).find((x) => x.en === en && sc.words.includes(x.topic));
      return w ? { id: w.id, ok: true } : null; }).filter(Boolean);
    await save({ kind: 'scene', topic: sc.id, score: sc.steps.length, total: sc.steps.length + miss, acorns: ac, words, badge: key });
    finish({ title: '미션 성공!', emoji: sc.icon, stars, lines: [miss ? `실수 ${miss}번, 그래도 끝까지 해냈어요!` : '한 번도 틀리지 않았어요. 완벽해요!'], acorns: ac,
      badge: isNew ? `${sc.icon} ${sc.name}` : null, back: '#/home', again: '#/scene/' + sc.id });
  };
  app.innerHTML = `${topbar(`${sc.icon} ${sc.name}`, '#/home')}
  <div class="page center">
    <div class="big-emoji">${sc.npc}</div>
    <h2>${sc.name}</h2>
    <p>${sc.intro}</p>
    <p class="muted small">상대방 말을 듣고 알맞은 대답을 골라요. 🔊를 누르면 다시 들을 수 있어요.</p>
    <button class="btn big primary" id="start">시작하기 ▶</button>
  </div>`;
  $('#start').onclick = step;
};

// ================= 선생님 화면 =================
routes.teacher = async () => {
  if (!state.teacherPw) {
    app.innerHTML = `<div class="login">
      <img class="login-logo small" src="/logo.png" alt="뉴오리건영어학원">
      <h1 class="title-kid">선생님 화면</h1>
      <form class="card form" id="tf">
        <label for="tpw">선생님 비밀번호</label>
        <input id="tpw" type="password" autocomplete="current-password" required>
        <p class="err" id="err"></p>
        <button class="btn big primary">들어가기</button>
      </form>
      <a class="teacher-link" href="#/home">← 학생 화면으로</a>
    </div>`;
    $('#tf').onsubmit = async (e) => {
      e.preventDefault();
      try { const pw = $('#tpw').value; await api.teacherOverview(pw); state.teacherPw = pw; render(); }
      catch (ex) { $('#err').textContent = ex.message; }
    };
    return;
  }
  const pw = state.teacherPw;
  let data;
  try { data = await api.teacherOverview(pw); } catch (e) { state.teacherPw = null; toast(e.message); return render(); }
  const tab = store.get('ojv_ttab', 'students'); let cls = store.get('ojv_tcls', 'all');
  const cname = (id) => (data.classes.find((c) => c.id === id) || {}).name || '-';
  const fmt = (d) => { const x = new Date(d); return `${x.getMonth() + 1}/${x.getDate()} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`; };
  const studs = data.students.filter((s) => cls === 'all' || s.class_id === Number(cls));
  const hard = data.hard_words.filter((h) => cls === 'all' || h.class_id === Number(cls));
  const hardAgg = Object.values(hard.reduce((m, h) => { (m[h.word_id] ||= { word_id: h.word_id, wrong: 0, correct: 0 }); m[h.word_id].wrong += Number(h.wrong); m[h.word_id].correct += Number(h.correct); return m; }, {}))
    .sort((a, b) => b.wrong - a.wrong).slice(0, 20);

  app.innerHTML = `<header class="topbar t">
    <a class="back" href="#/home">←</a><h1>👩‍🏫 선생님 화면</h1>
    <button class="btn ghost small" id="tout">나가기</button></header>
  <div class="page wide">
    ${isOnline ? '' : '<p class="demo">체험 모드: 이 기기에 저장된 기록만 보여요. 초기 비밀번호 oregon1234</p>'}
    <nav class="ttabs">
      ${[['students', '학생 현황'], ['hard', '어려운 단어'], ['classes', '반 관리'], ['settings', '설정']].map(([k, n]) => `<button class="${k === tab ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}
    </nav>
    ${tab === 'students' || tab === 'hard' ? `<div class="class-pick">
      <button class="chip ${cls === 'all' ? 'on' : ''}" data-c="all">전체</button>
      ${data.classes.map((c) => `<button class="chip ${String(c.id) === String(cls) ? 'on' : ''}" data-c="${c.id}">${esc(c.name)}</button>`).join('')}</div>` : ''}
    <div id="tbody"></div>
  </div>`;
  const body = $('#tbody');
  if (tab === 'students') {
    body.innerHTML = `
    <div class="stat-row">
      <div class="stat"><b>${studs.length}</b><small>학생 수</small></div>
      <div class="stat"><b>${studs.filter((s) => s.week_sessions > 0).length}</b><small>이번 주 참여</small></div>
      <div class="stat"><b>${studs.length ? Math.round(studs.reduce((t, s) => t + Number(s.learned), 0) / studs.length) : 0}</b><small>평균 익힌 단어</small></div>
    </div>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th>반</th><th>이름</th><th>도토리</th><th>7일 도토리</th><th>7일 학습</th><th>익힌 단어</th><th>배지</th><th>최근 접속</th><th></th></tr></thead>
      <tbody>${studs.map((s) => `<tr>
        <td>${esc(cname(s.class_id))}</td><td><b>${esc(s.name)}</b></td><td>${s.acorns}</td><td>${s.week_acorns}</td><td>${s.week_sessions}회</td>
        <td>${s.learned}/120</td><td>${(s.badges || []).length}</td><td>${fmt(s.last_active)}</td>
        <td class="acts"><button class="mini" data-act="pin" data-id="${s.id}" title="비밀번호 재설정">🔑</button>
          <button class="mini" data-act="move" data-id="${s.id}" title="반 이동">↔️</button>
          <button class="mini" data-act="del" data-id="${s.id}" data-n="${esc(s.name)}" title="삭제">🗑️</button></td></tr>`).join('') || '<tr><td colspan="9" class="muted">아직 학생이 없어요. 학생이 첫 로그인하면 자동으로 등록돼요.</td></tr>'}</tbody>
    </table></div>
    <form class="card form inline" id="addst">
      <b>학생 미리 등록</b>
      <select id="sc">${data.classes.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
      <input id="sn" placeholder="이름" required maxlength="20"><input id="sp" placeholder="비밀번호 4자리" inputmode="numeric" maxlength="4" required>
      <button class="btn primary">추가</button>
    </form>`;
    body.onclick = async (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      try {
        if (b.dataset.act === 'pin') { const p = prompt('새 비밀번호(숫자 4자리)'); if (!p) return; await api.teacherResetPin(pw, b.dataset.id, p); toast('비밀번호를 바꿨어요'); }
        if (b.dataset.act === 'move') {
          const list = data.classes.map((c, k) => `${k + 1}. ${c.name}`).join('\n'); const n = Number(prompt('옮길 반 번호를 입력하세요\n' + list));
          const c = data.classes[n - 1]; if (!c) return; await api.teacherMoveStudent(pw, b.dataset.id, c.id); toast('반을 옮겼어요');
        }
        if (b.dataset.act === 'del') { if (!confirm(`${b.dataset.n} 학생과 학습 기록을 모두 지울까요?`)) return; await api.teacherDeleteStudent(pw, b.dataset.id); toast('삭제했어요'); }
        render();
      } catch (ex) { toast(ex.message); }
    };
    $('#addst').onsubmit = async (e) => {
      e.preventDefault();
      try { await api.teacherAddStudent(pw, Number($('#sc').value), $('#sn').value, $('#sp').value); toast('학생을 추가했어요'); render(); } catch (ex) { toast(ex.message); }
    };
  } else if (tab === 'hard') {
    body.innerHTML = `<p class="muted">퀴즈·스펠링·말하기에서 많이 틀린 단어예요. 수업 시간 복습에 활용하세요.</p>
    <div class="hard-list">${hardAgg.map((h) => { const w = WORD_BY_ID[h.word_id]; if (!w) return '';
      const rate = Math.round((h.wrong / (h.wrong + h.correct)) * 100);
      return `<div class="hard"><span class="pic">${w.pic}</span><b>${esc(w.en)}</b><small>${esc(w.ko)} · ${topicById(w.topic).name}</small>
        <span class="bar"><i style="width:${rate}%"></i></span><span class="num">오답 ${h.wrong}회 (${rate}%)</span></div>`; }).join('') || '<p class="muted">아직 기록이 없어요.</p>'}</div>`;
  } else if (tab === 'classes') {
    body.innerHTML = `<div class="card">
      ${data.classes.map((c) => `<div class="class-row"><b>${esc(c.name)}</b><span class="muted">${data.students.filter((s) => s.class_id === c.id).length}명</span>
        <button class="mini" data-act="ren" data-id="${c.id}">✏️ 이름 변경</button><button class="mini" data-act="cdel" data-id="${c.id}" data-n="${esc(c.name)}">🗑️ 삭제</button></div>`).join('')}
      <form class="form inline" id="addc"><input id="cn" placeholder="새 반 이름 (예: 3학년 화목반)" required maxlength="30"><button class="btn primary">반 추가</button></form>
    </div>`;
    body.onclick = async (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      try {
        if (b.dataset.act === 'ren') { const n = prompt('새 반 이름'); if (!n) return; await api.teacherRenameClass(pw, Number(b.dataset.id), n); }
        if (b.dataset.act === 'cdel') { if (!confirm(`${b.dataset.n}을(를) 삭제하면 그 반 학생 기록도 모두 지워져요. 계속할까요?`)) return; await api.teacherDeleteClass(pw, Number(b.dataset.id)); }
        render();
      } catch (ex) { toast(ex.message); }
    };
    $('#addc').onsubmit = async (e) => { e.preventDefault(); try { await api.teacherAddClass(pw, $('#cn').value); render(); } catch (ex) { toast(ex.message); } };
  } else {
    body.innerHTML = `<form class="card form" id="cpw">
      <b>선생님 비밀번호 변경</b>
      <input id="np" type="password" placeholder="새 비밀번호 (6자 이상)" required minlength="6" autocomplete="new-password">
      <input id="np2" type="password" placeholder="새 비밀번호 확인" required autocomplete="new-password">
      <button class="btn primary">변경</button></form>
      <div class="card"><b>앱 정보</b><p class="muted small">단어 ${Object.keys(WORD_BY_ID).length}개 · 주제 ${TOPICS.length}개 · 상황 ${SCENES.length}개<br>저장 방식: ${isOnline ? 'Supabase 온라인 저장' : '이 기기 저장(체험 모드)'}</p></div>`;
    $('#cpw').onsubmit = async (e) => {
      e.preventDefault(); const a = $('#np').value;
      if (a !== $('#np2').value) return toast('두 비밀번호가 달라요');
      try { await api.teacherSetPassword(pw, a); state.teacherPw = a; toast('비밀번호를 바꿨어요'); } catch (ex) { toast(ex.message); }
    };
  }
  $$('.ttabs button').forEach((b) => b.onclick = () => { store.set('ojv_ttab', b.dataset.t); render(); });
  $$('[data-c]').forEach((b) => b.onclick = () => { store.set('ojv_tcls', b.dataset.c); render(); });
  $('#tout').onclick = () => { state.teacherPw = null; go('#/home'); };
};

// ================= 시작 =================
(async function boot() {
  const s = session.get();
  if (s) { try { state.me = await api.state(s.id, s.token); } catch { session.clear(); } }
  render();
})();
