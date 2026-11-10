-- ============================================================
-- Oregon Voca High (뉴오리건영어학원 고등부) - Supabase 스키마
-- 다른 앱과 같은 프로젝트를 써도 겹치지 않도록 모든 테이블·함수 이름 앞에 ovh_ 를 붙였습니다.
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여 넣고 Run 하세요.
-- 학생·선생님은 테이블에 직접 접근하지 못하고, 아래 함수(RPC)로만 읽고 씁니다.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- 테이블 ----------
create table if not exists ovh_app_settings (
  key text primary key,
  value text not null
);

create table if not exists ovh_classes (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists ovh_students (
  id uuid primary key default gen_random_uuid(),
  class_id bigint not null references ovh_classes(id) on delete cascade,
  name text not null,
  pin_hash text not null,
  token text,
  acorns int not null default 0,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists ovh_word_progress (
  student_id uuid not null references ovh_students(id) on delete cascade,
  word_id text not null,
  correct int not null default 0,
  wrong int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, word_id)
);

create table if not exists ovh_activity (
  id bigint generated always as identity primary key,
  student_id uuid not null references ovh_students(id) on delete cascade,
  kind text not null,
  topic text,
  score int not null default 0,
  total int not null default 0,
  acorns int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ovh_activity_student_time on ovh_activity (student_id, created_at);

alter table ovh_app_settings enable row level security;
alter table ovh_classes enable row level security;
alter table ovh_students enable row level security;
alter table ovh_word_progress enable row level security;
alter table ovh_activity enable row level security;
-- 정책(policy)을 만들지 않으므로 anon 키로는 테이블 직접 접근 불가

-- 온라인 선생님은 Supabase Auth 계정 + ovh_teachers 등록으로 인증합니다.
insert into ovh_classes (name) values ('예비고1반'), ('고1반'), ('고2반'), ('고3반')
on conflict (name) do nothing;

-- ---------- 내부 도우미 ----------
create or replace function ovh__student_ok(p_sid uuid, p_token text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from ovh_students where id = p_sid and token is not null and token = p_token);
$$;

create or replace function ovh__teacher_ok(p_pw text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from ovh_app_settings where key = 'teacher_pw' and value = crypt(p_pw, value));
$$;

create or replace function ovh__student_state(p_sid uuid)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', s.id, 'name', s.name, 'class_id', s.class_id, 'class_name', c.name,
    'acorns', s.acorns, 'badges', s.badges, 'token', s.token,
    'progress', coalesce((select json_object_agg(word_id, json_build_array(correct, wrong))
                          from ovh_word_progress where student_id = s.id), '{}'::json)
  )
  from ovh_students s join ovh_classes c on c.id = s.class_id where s.id = p_sid;
$$;

-- ---------- 학생용 ----------
create or replace function ovh_list_classes()
returns table (id bigint, name text) language sql stable security definer set search_path = public as $$
  select id, name from ovh_classes order by id;
$$;

create or replace function ovh_student_enter(p_class_id bigint, p_name text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare s ovh_students;
begin
  p_name := btrim(p_name);
  if p_name = '' or length(p_name) > 20 then raise exception '이름을 1~20자로 입력해 주세요'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요'; end if;
  if not exists (select 1 from ovh_classes where id = p_class_id) then raise exception '반을 다시 골라 주세요'; end if;

  select * into s from ovh_students where class_id = p_class_id and name = p_name;
  if not found then
    insert into ovh_students (class_id, name, pin_hash, token)
    values (p_class_id, p_name, crypt(p_pin, gen_salt('bf')), encode(gen_random_bytes(18), 'hex'))
    returning * into s;
  else
    if s.pin_hash <> crypt(p_pin, s.pin_hash) then raise exception '비밀번호가 맞지 않아요'; end if;
    update ovh_students set token = encode(gen_random_bytes(18), 'hex'), last_active = now()
    where id = s.id returning * into s;
  end if;
  return ovh__student_state(s.id);
end $$;

create or replace function ovh_student_state(p_sid uuid, p_token text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not ovh__student_ok(p_sid, p_token) then raise exception '다시 로그인해 주세요'; end if;
  update ovh_students set last_active = now() where id = p_sid;
  return ovh__student_state(p_sid);
end $$;

-- p_words: [{"id":"animals:dog","ok":true}, ...]
create or replace function ovh_save_result(p_sid uuid, p_token text, p_kind text, p_topic text,
  p_score int, p_total int, p_acorns int, p_words jsonb, p_badge text)
returns json language plpgsql security definer set search_path = public as $$
declare w jsonb;
begin
  if not ovh__student_ok(p_sid, p_token) then raise exception '다시 로그인해 주세요'; end if;
  p_acorns := greatest(0, least(p_acorns, 50));
  insert into ovh_activity (student_id, kind, topic, score, total, acorns)
  values (p_sid, left(p_kind, 30), left(p_topic, 40), p_score, p_total, p_acorns);
  for w in select * from jsonb_array_elements(coalesce(p_words, '[]'::jsonb)) loop
    insert into ovh_word_progress (student_id, word_id, correct, wrong)
    values (p_sid, left(w->>'id', 60), case when (w->>'ok')::boolean then 1 else 0 end,
                                       case when (w->>'ok')::boolean then 0 else 1 end)
    on conflict (student_id, word_id) do update
      set correct = ovh_word_progress.correct + excluded.correct,
          wrong = ovh_word_progress.wrong + excluded.wrong,
          updated_at = now();
  end loop;
  update ovh_students set acorns = acorns + p_acorns, last_active = now(),
    badges = case when p_badge is null or badges ? p_badge then badges
                  else badges || to_jsonb(left(p_badge, 40)) end
  where id = p_sid;
  return ovh__student_state(p_sid);
end $$;

-- 이번 주(월요일부터) 우리 반 열심상 상위 5명
create or replace function ovh_class_weekly_top(p_sid uuid, p_token text)
returns table (name text, acorns bigint) language plpgsql security definer set search_path = public as $$
begin
  if not ovh__student_ok(p_sid, p_token) then raise exception '다시 로그인해 주세요'; end if;
  return query
    select s.name, coalesce(sum(a.acorns), 0)::bigint as acorns
    from ovh_students s
    join ovh_activity a on a.student_id = s.id
      and a.created_at >= date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    where s.class_id = (select class_id from ovh_students where id = p_sid)
    group by s.id, s.name
    order by 2 desc, s.name
    limit 5;
end $$;

-- ---------- 선생님용 ----------
create or replace function ovh_teacher_overview(p_pw text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  return json_build_object(
    'classes', coalesce((select json_agg(json_build_object('id', id, 'name', name) order by id) from ovh_classes), '[]'::json),
    'students', coalesce((select json_agg(x order by x.class_id, x.name) from (
        select s.id, s.class_id, s.name, s.acorns, s.badges, s.last_active,
          (select count(*) from ovh_word_progress p where p.student_id = s.id and p.correct > 0) as learned,
          (select coalesce(sum(a.acorns), 0) from ovh_activity a where a.student_id = s.id
             and a.created_at >= now() - interval '7 days') as week_acorns,
          (select count(*) from ovh_activity a where a.student_id = s.id
             and a.created_at >= now() - interval '7 days') as week_sessions
        from ovh_students s) x), '[]'::json),
    'hard_words', coalesce((select json_agg(y) from (
        select p.word_id, s.class_id, sum(p.wrong) as wrong, sum(p.correct) as correct
        from ovh_word_progress p join ovh_students s on s.id = p.student_id
        group by p.word_id, s.class_id having sum(p.wrong) > 0
        order by sum(p.wrong) desc limit 60) y), '[]'::json)
  );
end $$;

create or replace function ovh_teacher_add_class(p_pw text, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if btrim(p_name) = '' then raise exception '반 이름을 입력해 주세요'; end if;
  insert into ovh_classes (name) values (btrim(p_name));
end $$;

create or replace function ovh_teacher_rename_class(p_pw text, p_class_id bigint, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  update ovh_classes set name = btrim(p_name) where id = p_class_id;
end $$;

create or replace function ovh_teacher_delete_class(p_pw text, p_class_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  delete from ovh_classes where id = p_class_id;
end $$;

create or replace function ovh_teacher_add_student(p_pw text, p_class_id bigint, p_name text, p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요'; end if;
  insert into ovh_students (class_id, name, pin_hash) values (p_class_id, btrim(p_name), crypt(p_pin, gen_salt('bf')));
end $$;

create or replace function ovh_teacher_reset_pin(p_pw text, p_sid uuid, p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요'; end if;
  update ovh_students set pin_hash = crypt(p_pin, gen_salt('bf')), token = null where id = p_sid;
end $$;

create or replace function ovh_teacher_move_student(p_pw text, p_sid uuid, p_class_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  update ovh_students set class_id = p_class_id where id = p_sid;
end $$;

create or replace function ovh_teacher_delete_student(p_pw text, p_sid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  delete from ovh_students where id = p_sid;
end $$;

create or replace function ovh_teacher_set_password(p_pw text, p_new text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not ovh__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if length(p_new) < 6 then raise exception '새 비밀번호는 6자 이상이어야 해요'; end if;
  update ovh_app_settings set value = crypt(p_new, gen_salt('bf')) where key = 'teacher_pw';
end $$;

-- ---------- 권한 ----------
revoke all on function ovh__student_ok(uuid, text), ovh__teacher_ok(text), ovh__student_state(uuid) from public, anon, authenticated;
grant execute on function
  ovh_list_classes(), ovh_student_enter(bigint, text, text), ovh_student_state(uuid, text),
  ovh_save_result(uuid, text, text, text, int, int, int, jsonb, text), ovh_class_weekly_top(uuid, text),
  ovh_teacher_overview(text), ovh_teacher_add_class(text, text), ovh_teacher_rename_class(text, bigint, text),
  ovh_teacher_delete_class(text, bigint), ovh_teacher_add_student(text, bigint, text, text),
  ovh_teacher_reset_pin(text, uuid, text), ovh_teacher_move_student(text, uuid, bigint),
  ovh_teacher_delete_student(text, uuid), ovh_teacher_set_password(text, text)
to anon, authenticated;

-- ===== 3레벨 확장 및 Auth 기반 교사 권한 =====
-- 기존 학생·단어 진도·배지를 삭제하지 않는 3레벨 확장.
create table if not exists public.ovh_teachers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.ovh_teachers enable row level security;
revoke all on public.ovh_teachers from public, anon, authenticated;

alter table public.ovh_students add column if not exists checkpoints jsonb not null default '{}'::jsonb;
alter table public.ovh_students add column if not exists voice_consent boolean not null default false;
alter table public.ovh_students add column if not exists consent_at timestamptz;
alter table public.ovh_students add column if not exists consent_by uuid;
alter table public.ovh_students add column if not exists token_expires_at timestamptz;

create table if not exists public.ovh_vocabulary (
 id text primary key, stage text not null check(stage in ('prep','grade1','grade2','grade3')),
 topic text not null, en text not null, ko text not null, example text not null, translation text not null
);
create table if not exists public.ovh_word_aliases (
 legacy_id text primary key, word_id text not null references public.ovh_vocabulary(id)
);
alter table public.ovh_vocabulary enable row level security;
alter table public.ovh_word_aliases enable row level security;
revoke all on public.ovh_vocabulary, public.ovh_word_aliases from public, anon, authenticated;

create table if not exists public.ovh_login_limits (
 key text primary key, attempts integer not null default 0, started_at timestamptz not null default now()
);
alter table public.ovh_login_limits enable row level security;
revoke all on public.ovh_login_limits from public, anon, authenticated;

create or replace function public.ovh__teacher_ok(p_pw text)
returns boolean language sql stable security definer set search_path = public as $$
 select auth.uid() is not null and exists(select 1 from ovh_teachers where user_id=auth.uid());
$$;
-- 공개 기본 비밀번호는 온라인 관리자 인증에 사용하지 않습니다.
delete from public.ovh_app_settings where key='teacher_pw';
revoke all on function public.ovh_teacher_set_password(text,text) from public,anon,authenticated;

create or replace function public.ovh__student_ok(p_sid uuid,p_token text)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from ovh_students where id=p_sid and token is not null and token=p_token and token_expires_at>now());
$$;
create or replace function public.ovh__student_state(p_sid uuid)
returns json language sql stable security definer set search_path=public as $$
 select json_build_object('id',s.id,'name',s.name,'class_id',s.class_id,'class_name',c.name,
 'acorns',s.acorns,'badges',s.badges,'token',s.token,'checkpoints',s.checkpoints,'voice_consent',s.voice_consent,
 'progress',coalesce((select json_object_agg(word_id,json_build_array(correct,wrong)) from ovh_word_progress where student_id=s.id),'{}'::json))
 from ovh_students s join ovh_classes c on c.id=s.class_id where s.id=p_sid;
$$;

create or replace function public.ovh_student_enter(p_class_id bigint,p_name text,p_pin text)
returns json language plpgsql security definer set search_path=public,extensions as $$
declare s ovh_students; attempt_count int; limit_key text;
begin
 p_name:=btrim(p_name);
 if p_name is null or p_name='' or length(p_name)>20 then raise exception '이름을 1~20자로 입력해 주세요';end if;
 if p_pin is null or p_pin!~'^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요';end if;
 if not exists(select 1 from ovh_classes where id=p_class_id) then raise exception '반을 다시 골라 주세요';end if;
 limit_key:=p_class_id::text||':'||p_name;
 insert into ovh_login_limits(key,attempts,started_at) values(limit_key,1,now())
 on conflict(key) do update set attempts=case when ovh_login_limits.started_at<now()-interval '15 minutes' then 1 else ovh_login_limits.attempts+1 end,
 started_at=case when ovh_login_limits.started_at<now()-interval '15 minutes' then now() else ovh_login_limits.started_at end
 returning attempts into attempt_count;
 -- JSON 오류를 반환해 실패 횟수가 예외의 롤백으로 사라지지 않게 합니다.
 if attempt_count>20 then return json_build_object('error','잠시 후 다시 로그인해 주세요');end if;
 select * into s from ovh_students where class_id=p_class_id and name=p_name;
 if not found then
  insert into ovh_students(class_id,name,pin_hash,token,token_expires_at)
  values(p_class_id,p_name,crypt(p_pin,gen_salt('bf')),encode(gen_random_bytes(24),'hex'),now()+interval '7 days') returning * into s;
 else
  if s.pin_hash<>crypt(p_pin,s.pin_hash) then return json_build_object('error','비밀번호가 맞지 않아요');end if;
  update ovh_students set token=encode(gen_random_bytes(24),'hex'),token_expires_at=now()+interval '7 days',last_active=now()
  where id=s.id returning * into s;
 end if;
 delete from ovh_login_limits where key=limit_key;
 return ovh__student_state(s.id);
end $$;

create or replace function public.ovh_save_checkpoint(p_sid uuid,p_token text,p_topic text,p_part int,p_index int,p_complete boolean)
returns json language plpgsql security definer set search_path=public as $$
begin
 if not ovh__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 if p_topic is null or p_topic!~'^[a-z0-9-]{1,40}$' or p_part is null or p_part<0 or p_part>3 or p_index is null or p_index<0 or p_index>4 or p_complete is null
 then raise exception '학습 위치를 다시 확인해 주세요';end if;
 if p_complete and p_index<>4 then raise exception '마지막 카드까지 확인해 주세요';end if;
 update ovh_students set checkpoints=jsonb_set(checkpoints,array[p_topic||':'||p_part::text],jsonb_build_object('index',p_index,'complete',p_complete)),last_active=now() where id=p_sid;
 return ovh__student_state(p_sid);
end $$;
create or replace function public.ovh_teacher_voice_consent(p_pw text,p_sid uuid,p_value boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not ovh__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 update ovh_students set voice_consent=coalesce(p_value,false),consent_at=now(),consent_by=auth.uid() where id=p_sid;
end $$;

create or replace function public.ovh_teacher_overview(p_pw text)
returns json language plpgsql security definer set search_path=public as $$
begin
 if not ovh__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 return json_build_object(
  'classes',coalesce((select json_agg(json_build_object('id',id,'name',name) order by id) from ovh_classes),'[]'::json),
  'students',coalesce((select json_agg(x order by x.class_id,x.name) from (
   select s.id,s.class_id,s.name,s.acorns,s.badges,s.last_active,s.voice_consent,
   (select count(distinct coalesce(a.word_id,p.word_id)) from ovh_word_progress p left join ovh_word_aliases a on a.legacy_id=p.word_id where p.student_id=s.id and p.correct>0) as learned,
   json_build_object(
    'prep',(select count(distinct v.id) from ovh_word_progress p left join ovh_word_aliases a on a.legacy_id=p.word_id join ovh_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='prep'),
    'grade1',(select count(distinct v.id) from ovh_word_progress p left join ovh_word_aliases a on a.legacy_id=p.word_id join ovh_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='grade1'),
    'grade2',(select count(distinct v.id) from ovh_word_progress p left join ovh_word_aliases a on a.legacy_id=p.word_id join ovh_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='grade2'),
    'grade3',(select count(distinct v.id) from ovh_word_progress p left join ovh_word_aliases a on a.legacy_id=p.word_id join ovh_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='grade3')
   ) as learned_by_stage,
   (select coalesce(sum(acorns),0) from ovh_activity where student_id=s.id and created_at>=now()-interval '7 days') as week_acorns,
   (select count(*) from ovh_activity where student_id=s.id and created_at>=now()-interval '7 days') as week_sessions from ovh_students s
  ) x),'[]'::json),
  'hard_words',coalesce((select json_agg(y) from (
   select p.word_id,s.class_id,sum(p.wrong) as wrong,sum(p.correct) as correct from ovh_word_progress p join ovh_students s on s.id=p.student_id
   group by p.word_id,s.class_id having sum(p.wrong)>0 order by sum(p.wrong) desc limit 60
  ) y),'[]'::json)
 );
end $$;
revoke all on function public.ovh__student_ok(uuid,text),public.ovh__student_state(uuid),public.ovh__teacher_ok(text) from public,anon,authenticated;
revoke all on function public.ovh_save_checkpoint(uuid,text,text,int,int,boolean),public.ovh_teacher_voice_consent(text,uuid,boolean) from public;
grant execute on function public.ovh_save_checkpoint(uuid,text,text,int,int,boolean) to anon,authenticated;
grant execute on function public.ovh_teacher_voice_consent(text,uuid,boolean) to authenticated;

-- 결과 재전송으로 보상과 진도가 중복 증가하지 않도록 요청 식별자를 보관합니다.
create table if not exists public.ovh_result_receipts (
 student_id uuid not null references public.ovh_students(id) on delete cascade,
 request_id uuid not null, created_at timestamptz not null default now(),
 primary key(student_id,request_id)
);
alter table public.ovh_result_receipts enable row level security;
revoke all on public.ovh_result_receipts from public,anon,authenticated;
create or replace function public.ovh_save_result_v2(p_sid uuid,p_token text,p_request_id uuid,p_kind text,p_topic text,
 p_score int,p_total int,p_acorns int,p_words jsonb,p_badge text)
returns json language plpgsql security definer set search_path=public as $$
declare result json;
begin
 if not ovh__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 if p_request_id is null then raise exception '요청 식별자가 필요해요';end if;
 perform 1 from ovh_students where id=p_sid for update;
 if exists(select 1 from ovh_result_receipts where student_id=p_sid and request_id=p_request_id) then return ovh__student_state(p_sid);end if;
 result:=ovh_save_result(p_sid,p_token,p_kind,p_topic,p_score,p_total,p_acorns,p_words,p_badge);
 insert into ovh_result_receipts(student_id,request_id) values(p_sid,p_request_id);
 return result;
end $$;
revoke all on function public.ovh_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text) from public;
grant execute on function public.ovh_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text) to anon,authenticated;
