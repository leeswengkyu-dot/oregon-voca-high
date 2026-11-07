// 데이터 저장 계층
// - VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 있으면 Supabase(RPC) 사용
// - 없으면 이 기기의 브라우저 저장소(localStorage)에 저장하는 체험 모드
import { TOPICS, STAGES } from './data/words.js';
import { levelProgress } from './data/levels.js';
import { createClient } from '@supabase/supabase-js';

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY;
const callbackParams = new URLSearchParams((location.hash || '').replace(/^#/, '') || (location.search || '').replace(/^\?/, ''));
let authFlowType = callbackParams.get('type');
const sb = URL_ && KEY_ ? createClient(URL_, KEY_, { auth: { persistSession: true } }) : null;

export const isOnline = !!sb;

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { throw new Error('이 기기에 저장할 수 없어요. 브라우저 저장 공간을 확인해 주세요'); } },
  del(k) { try { localStorage.removeItem(k); } catch { /* noop */ } },
};

async function rpc(fn, args) {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(cleanMsg(error.message));
  if (data?.error) throw new Error(data.error);
  return data;
}
const cleanMsg = (m) => (m || '오류가 발생했어요').replace(/^.*?:\s(?=[가-힣])/, '');

// ---------------- 체험 모드(로컬) ----------------
const LDB = 'ojv_local_db';
const PENDING = 'ojv_pending_results';
function ldb() {
  return store.get(LDB, {
    classes: [{ id: 1, name: '새싹반' }, { id: 2, name: '줄기반' }, { id: 3, name: '나무반' }],
    students: [], activity: [], teacherPw: 'oregon1234', seq: 4,
  });
}
const lsave = (d) => store.set(LDB, d);
const uid = () => crypto.randomUUID();
function lstate(d, s) {
  const c = d.classes.find((x) => x.id === s.class_id);
  return { id: s.id, name: s.name, class_id: s.class_id, class_name: c ? c.name : '', acorns: s.acorns, badges: s.badges, token: s.token, progress: s.progress, checkpoints: s.checkpoints||{}, voice_consent:!!s.voice_consent };
}
function weekStart() {
  const d = new Date(); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day); return d.getTime();
}
const lteacher = (d, pw) => { if (pw !== d.teacherPw) throw new Error('선생님 비밀번호가 맞지 않아요'); };

const local = {
  needsPasswordSetup: () => false,
  async completePasswordSetup(){ throw new Error('비밀번호 설정은 Supabase 온라인 모드에서만 사용할 수 있어요'); },
  async teacherLogin(email,pw){const d=ldb();lteacher(d,pw);return pw;},
  async teacherLogout(){},
  async checkpoint(sid,token,topic,part,index,complete){const d=ldb(),s=d.students.find(x=>x.id===sid&&x.token===token);if(!s)throw new Error('다시 로그인해 주세요');s.checkpoints||={};s.checkpoints[topic+':'+part]={index,complete};lsave(d);return lstate(d,s);},
  async teacherVoiceConsent(pw,sid,value){const d=ldb();lteacher(d,pw);const s=d.students.find(x=>x.id===sid);if(s)s.voice_consent=!!value;lsave(d);},
  async listClasses() { return ldb().classes; },
  async enter(classId, name, pin) {
    const d = ldb(); name = name.trim();
    if (!name || name.length > 20) throw new Error('이름을 1~20자로 입력해 주세요');
    if (!/^\d{4}$/.test(pin)) throw new Error('비밀번호는 숫자 4자리예요');
    let s = d.students.find((x) => x.class_id === classId && x.name === name);
    if (!s) {
      s = { id: uid(), class_id: classId, name, pin, acorns: 0, badges: [], progress: {}, last_active: Date.now() };
      d.students.push(s);
    } else if (s.pin !== pin) throw new Error('비밀번호가 맞지 않아요');
    s.checkpoints ||= {};s.token = uid(); s.last_active = Date.now(); lsave(d);
    return lstate(d, s);
  },
  async state(sid, token) {
    const d = ldb(); const s = d.students.find((x) => x.id === sid && x.token === token);
    if (!s) throw new Error('다시 로그인해 주세요');
    return lstate(d, s);
  },
  async saveResult(sid, token, r) {
    const d = ldb(); const s = d.students.find((x) => x.id === sid && x.token === token);
    if (!s) throw new Error('다시 로그인해 주세요');
    d.receipts ||= [];if(r.requestId&&d.receipts.includes(r.requestId))return lstate(d,s);
    const ac = Math.max(0, Math.min(50, r.acorns));
    d.activity.push({ sid, kind: r.kind, topic: r.topic, score: r.score, total: r.total, acorns: ac, at: Date.now() });
    for (const w of r.words || []) {
      const p = s.progress[w.id] || [0, 0]; if (w.ok) p[0] += 1; else p[1] += 1; s.progress[w.id] = p;
    }
    if(r.requestId)d.receipts.push(r.requestId);
    s.acorns += ac; s.last_active = Date.now();
    if (r.badge && !s.badges.includes(r.badge)) s.badges.push(r.badge);
    lsave(d); return lstate(d, s);
  },
  async weeklyTop(sid, token) {
    const d = ldb(); const me = d.students.find((x) => x.id === sid && x.token === token);
    if (!me) throw new Error('다시 로그인해 주세요');
    const ws = weekStart();
    return [{ acorns: d.students.filter((s) => s.class_id === me.class_id)
      .reduce((sum, s) => sum + d.activity.filter((a) => a.sid === s.id && a.at >= ws).reduce((t, a) => t + a.acorns, 0), 0) }];
  },
  async teacherOverview(pw) {
    const d = ldb(); lteacher(d, pw);
    const wk = Date.now() - 7 * 864e5; const hard = {};
    const students = d.students.map((s) => {
      for (const [wid, [c, w]] of Object.entries(s.progress)) {
        if (w > 0) { const k = wid + '|' + s.class_id; hard[k] = hard[k] || { word_id: wid, class_id: s.class_id, wrong: 0, correct: 0 }; hard[k].wrong += w; hard[k].correct += c; }
      }
      const acts = d.activity.filter((a) => a.sid === s.id && a.at >= wk);
      return { id: s.id, class_id: s.class_id, name: s.name, acorns: s.acorns, badges: s.badges, voice_consent:!!s.voice_consent, last_active: new Date(s.last_active).toISOString(),
        learned: STAGES.reduce((sum,stage)=>sum+levelProgress(s.progress,TOPICS,stage.id).learned,0), learned_by_stage:Object.fromEntries(STAGES.map(stage=>[stage.id,levelProgress(s.progress,TOPICS,stage.id).learned])), week_acorns: acts.reduce((t, a) => t + a.acorns, 0), week_sessions: acts.length };
    });
    return { classes: d.classes, students, hard_words: Object.values(hard).sort((a, b) => b.wrong - a.wrong).slice(0, 60) };
  },
  async teacherAddClass(pw, name) {
    const d = ldb(); lteacher(d, pw); name = name.trim(); if (!name) throw new Error('반 이름을 입력해 주세요');
    if (d.classes.some((c) => c.name === name)) throw new Error('같은 이름의 반이 있어요');
    d.classes.push({ id: d.seq++, name }); lsave(d);
  },
  async teacherRenameClass(pw, id, name) { const d = ldb(); lteacher(d, pw); const c = d.classes.find((x) => x.id === id); if (c) c.name = name.trim(); lsave(d); },
  async teacherDeleteClass(pw, id) {
    const d = ldb(); lteacher(d, pw); d.classes = d.classes.filter((c) => c.id !== id);
    const gone = new Set(d.students.filter((s) => s.class_id === id).map((s) => s.id));
    d.students = d.students.filter((s) => !gone.has(s.id)); d.activity = d.activity.filter((a) => !gone.has(a.sid)); lsave(d);
  },
  async teacherAddStudent(pw, classId, name, pin) {
    const d = ldb(); lteacher(d, pw); if (!/^\d{4}$/.test(pin)) throw new Error('비밀번호는 숫자 4자리예요');
    if (d.students.some((s) => s.class_id === classId && s.name === name.trim())) throw new Error('같은 이름의 학생이 있어요');
    d.students.push({ id: uid(), class_id: classId, name: name.trim(), pin, acorns: 0, badges: [], progress: {}, last_active: Date.now() }); lsave(d);
  },
  async teacherResetPin(pw, sid, pin) {
    const d = ldb(); lteacher(d, pw); if (!/^\d{4}$/.test(pin)) throw new Error('비밀번호는 숫자 4자리예요');
    const s = d.students.find((x) => x.id === sid); if (s) { s.pin = pin; s.token = null; } lsave(d);
  },
  async teacherMoveStudent(pw, sid, classId) { const d = ldb(); lteacher(d, pw); const s = d.students.find((x) => x.id === sid); if (s) s.class_id = classId; lsave(d); },
  async teacherDeleteStudent(pw, sid) { const d = ldb(); lteacher(d, pw); d.students = d.students.filter((s) => s.id !== sid); d.activity = d.activity.filter((a) => a.sid !== sid); lsave(d); },
  async teacherSetPassword(pw, np) { const d = ldb(); lteacher(d, pw); if (np.length < 6) throw new Error('새 비밀번호는 6자 이상이어야 해요'); d.teacherPw = np; lsave(d); },
  async studentAssignments(){ return []; },
  async teacherSetAssignment(pw,classId,unitId,dueAt){const d=ldb();lteacher(d,pw);d.assignments||=[];d.assignments=d.assignments.filter(x=>!(x.class_id===classId&&x.unit_id===unitId));d.assignments.push({class_id:classId,unit_id:unitId,due_at:dueAt});lsave(d);},
  async adminImportContent(){ throw new Error('Excel 게시 기능은 Supabase 온라인 모드에서만 사용할 수 있어요'); },
  async adminContentVersions(){ return []; },
  async adminRollbackContent(){ throw new Error('롤백은 Supabase 온라인 모드에서만 사용할 수 있어요'); },
  async parentLogin(){ throw new Error('보호자 화면은 Supabase 온라인 모드에서만 사용할 수 있어요'); },
  async parentOverview(){ return []; },
  async parentLogout(){},
};

// ---------------- Supabase 모드 ----------------
const remote = {
  needsPasswordSetup: () => authFlowType === 'invite' || authFlowType === 'recovery',
  async completePasswordSetup(password){
    if(password.length<8)throw new Error('비밀번호는 8자 이상이어야 해요');
    const {data:{session}}=await sb.auth.getSession();
    if(!session)throw new Error('초대 링크가 만료되었어요. 새 초대 메일을 요청해 주세요');
    const {error}=await sb.auth.updateUser({password});
    if(error)throw new Error('비밀번호를 설정하지 못했어요. 새 초대 메일로 다시 시도해 주세요');
    authFlowType=null;
  },
  async teacherLogin(email,password){const {error}=await sb.auth.signInWithPassword({email:email.trim(),password});if(error)throw new Error('선생님 이메일과 비밀번호를 확인해 주세요');return 'authenticated';},
  async teacherLogout(){await sb.auth.signOut();},
  checkpoint:(sid,token,topic,part,index,complete)=>rpc('ojv_save_checkpoint',{p_sid:sid,p_token:token,p_topic:topic,p_part:part,p_index:index,p_complete:complete}),
  teacherVoiceConsent:(pw,sid,value)=>rpc('ojv_teacher_voice_consent',{p_pw:pw,p_sid:sid,p_value:value}),
  listClasses: () => rpc('ojv_list_classes', {}),
  async enter(classId,name,pin){await sb.auth.signOut();return rpc('ojv_student_enter',{p_class_id:classId,p_name:name,p_pin:pin});},
  state: (sid, token) => rpc('ojv_student_state', { p_sid: sid, p_token: token }),
  saveResult: (sid, token, r) => rpc('ojv_save_result_v2', {
    p_request_id:r.requestId,
    p_sid: sid, p_token: token, p_kind: r.kind, p_topic: r.topic || null, p_score: r.score, p_total: r.total,
    p_acorns: r.acorns, p_words: r.words || [], p_badge: r.badge || null,
  }),
  weeklyTop: (sid, token) => rpc('ojv_class_weekly_top', { p_sid: sid, p_token: token }),
  teacherOverview: (pw) => rpc('ojv_teacher_overview', { p_pw: pw }),
  teacherAddClass: (pw, name) => rpc('ojv_teacher_add_class', { p_pw: pw, p_name: name }),
  teacherRenameClass: (pw, id, name) => rpc('ojv_teacher_rename_class', { p_pw: pw, p_class_id: id, p_name: name }),
  teacherDeleteClass: (pw, id) => rpc('ojv_teacher_delete_class', { p_pw: pw, p_class_id: id }),
  teacherAddStudent: (pw, classId, name, pin) => rpc('ojv_teacher_add_student', { p_pw: pw, p_class_id: classId, p_name: name, p_pin: pin }),
  teacherResetPin: (pw, sid, pin) => rpc('ojv_teacher_reset_pin', { p_pw: pw, p_sid: sid, p_pin: pin }),
  teacherMoveStudent: (pw, sid, classId) => rpc('ojv_teacher_move_student', { p_pw: pw, p_sid: sid, p_class_id: classId }),
  teacherDeleteStudent: (pw, sid) => rpc('ojv_teacher_delete_student', { p_pw: pw, p_sid: sid }),
  studentAssignments: (sid, token) => rpc('ojv_student_assignments', { p_sid: sid, p_token: token }),
  teacherSetAssignment: (pw,classId,unitId,dueAt) => rpc('ojv_teacher_set_assignment',{p_pw:pw,p_class_id:classId,p_unit_id:unitId,p_due_at:dueAt||null}),
  adminImportContent: (fileName,payload,publish=false) => rpc('ojv_admin_import_content',{p_file_name:fileName,p_payload:payload,p_publish:publish}),
  adminContentVersions: () => rpc('ojv_admin_content_versions',{}),
  adminRollbackContent: (version) => rpc('ojv_admin_rollback_content',{p_version:version}),
  async parentLogin(email,password){const {error}=await sb.auth.signInWithPassword({email:email.trim(),password});if(error)throw new Error('보호자 이메일과 비밀번호를 확인해 주세요');},
  parentOverview: () => rpc('ojv_parent_overview',{}),
  async parentLogout(){await sb.auth.signOut();},
  async teacherSetPassword(pw,np){if(np.length<8)throw new Error('새 비밀번호는 8자 이상이어야 해요');const {error}=await sb.auth.updateUser({password:np});if(error)throw new Error('비밀번호 변경에 실패했어요. 다시 로그인해 주세요');},
};

const base = sb ? remote : local;
export const api = {
  ...base,
  async saveResult(sid, token, result) {
    try { return await base.saveResult(sid, token, result); }
    catch (error) {
      if (!sb || navigator.onLine || /로그인|비밀번호|세션/.test(error.message)) throw error;
      const pending = store.get(PENDING, []);
      if (!pending.some((item) => item.result.requestId === result.requestId)) pending.push({ sid, token, result, queuedAt: Date.now() });
      store.set(PENDING, pending);
      const state = await base.state(sid, token).catch(() => null);
      if (!state) throw error;
      return { ...state, offlineQueued: true };
    }
  },
  async flushPendingResults() {
    if (!sb || !navigator.onLine) return { sent: 0, remaining: store.get(PENDING, []).length };
    const pending = store.get(PENDING, []); const remaining = []; let sent = 0;
    for (const item of pending) {
      try { await base.saveResult(item.sid, item.token, item.result); sent += 1; }
      catch { remaining.push(item); }
    }
    store.set(PENDING, remaining); return { sent, remaining: remaining.length };
  },
};
export { store };
