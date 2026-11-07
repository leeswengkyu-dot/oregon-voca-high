-- ============================================================
-- 보카 트레일 주니어 (뉴오리건영어학원 초등부) - Supabase 스키마
-- 다른 앱과 같은 프로젝트를 써도 겹치지 않도록 모든 테이블·함수 이름 앞에 ojv_ 를 붙였습니다.
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여 넣고 Run 하세요.
-- 학생·선생님은 테이블에 직접 접근하지 못하고, 아래 함수(RPC)로만 읽고 씁니다.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- 테이블 ----------
create table if not exists ojv_app_settings (
  key text primary key,
  value text not null
);

create table if not exists ojv_classes (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists ojv_students (
  id uuid primary key default gen_random_uuid(),
  class_id bigint not null references ojv_classes(id) on delete cascade,
  name text not null,
  pin_hash text not null,
  token text,
  acorns int not null default 0,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists ojv_word_progress (
  student_id uuid not null references ojv_students(id) on delete cascade,
  word_id text not null,
  correct int not null default 0,
  wrong int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, word_id)
);

create table if not exists ojv_activity (
  id bigint generated always as identity primary key,
  student_id uuid not null references ojv_students(id) on delete cascade,
  kind text not null,
  topic text,
  score int not null default 0,
  total int not null default 0,
  acorns int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ojv_activity_student_time on ojv_activity (student_id, created_at);

alter table ojv_app_settings enable row level security;
alter table ojv_classes enable row level security;
alter table ojv_students enable row level security;
alter table ojv_word_progress enable row level security;
alter table ojv_activity enable row level security;
-- 정책(policy)을 만들지 않으므로 anon 키로는 테이블 직접 접근 불가

-- 온라인 선생님은 Supabase Auth 계정 + ojv_teachers 등록으로 인증합니다.
insert into ojv_classes (name) values ('새싹반'), ('줄기반'), ('나무반')
on conflict (name) do nothing;

-- ---------- 내부 도우미 ----------
create or replace function ojv__student_ok(p_sid uuid, p_token text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from ojv_students where id = p_sid and token is not null and token = p_token);
$$;

create or replace function ojv__teacher_ok(p_pw text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from ojv_app_settings where key = 'teacher_pw' and value = crypt(p_pw, value));
$$;

create or replace function ojv__student_state(p_sid uuid)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', s.id, 'name', s.name, 'class_id', s.class_id, 'class_name', c.name,
    'acorns', s.acorns, 'badges', s.badges, 'token', s.token,
    'progress', coalesce((select json_object_agg(word_id, json_build_array(correct, wrong))
                          from ojv_word_progress where student_id = s.id), '{}'::json)
  )
  from ojv_students s join ojv_classes c on c.id = s.class_id where s.id = p_sid;
$$;

-- ---------- 학생용 ----------
create or replace function ojv_list_classes()
returns table (id bigint, name text) language sql stable security definer set search_path = public as $$
  select id, name from ojv_classes order by id;
$$;

create or replace function ojv_student_enter(p_class_id bigint, p_name text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare s ojv_students;
begin
  p_name := btrim(p_name);
  if p_name = '' or length(p_name) > 20 then raise exception '이름을 1~20자로 입력해 주세요'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요'; end if;
  if not exists (select 1 from ojv_classes where id = p_class_id) then raise exception '반을 다시 골라 주세요'; end if;

  select * into s from ojv_students where class_id = p_class_id and name = p_name;
  if not found then
    insert into ojv_students (class_id, name, pin_hash, token)
    values (p_class_id, p_name, crypt(p_pin, gen_salt('bf')), encode(gen_random_bytes(18), 'hex'))
    returning * into s;
  else
    if s.pin_hash <> crypt(p_pin, s.pin_hash) then raise exception '비밀번호가 맞지 않아요'; end if;
    update ojv_students set token = encode(gen_random_bytes(18), 'hex'), last_active = now()
    where id = s.id returning * into s;
  end if;
  return ojv__student_state(s.id);
end $$;

create or replace function ojv_student_state(p_sid uuid, p_token text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not ojv__student_ok(p_sid, p_token) then raise exception '다시 로그인해 주세요'; end if;
  update ojv_students set last_active = now() where id = p_sid;
  return ojv__student_state(p_sid);
end $$;

-- p_words: [{"id":"animals:dog","ok":true}, ...]
create or replace function ojv_save_result(p_sid uuid, p_token text, p_kind text, p_topic text,
  p_score int, p_total int, p_acorns int, p_words jsonb, p_badge text)
returns json language plpgsql security definer set search_path = public as $$
declare w jsonb;
begin
  if not ojv__student_ok(p_sid, p_token) then raise exception '다시 로그인해 주세요'; end if;
  p_acorns := greatest(0, least(p_acorns, 50));
  insert into ojv_activity (student_id, kind, topic, score, total, acorns)
  values (p_sid, left(p_kind, 30), left(p_topic, 40), p_score, p_total, p_acorns);
  for w in select * from jsonb_array_elements(coalesce(p_words, '[]'::jsonb)) loop
    insert into ojv_word_progress (student_id, word_id, correct, wrong)
    values (p_sid, left(w->>'id', 60), case when (w->>'ok')::boolean then 1 else 0 end,
                                       case when (w->>'ok')::boolean then 0 else 1 end)
    on conflict (student_id, word_id) do update
      set correct = ojv_word_progress.correct + excluded.correct,
          wrong = ojv_word_progress.wrong + excluded.wrong,
          updated_at = now();
  end loop;
  update ojv_students set acorns = acorns + p_acorns, last_active = now(),
    badges = case when p_badge is null or badges ? p_badge then badges
                  else badges || to_jsonb(left(p_badge, 40)) end
  where id = p_sid;
  return ojv__student_state(p_sid);
end $$;

-- 이번 주(월요일부터) 우리 반 열심상 상위 5명
create or replace function ojv_class_weekly_top(p_sid uuid, p_token text)
returns table (name text, acorns bigint) language plpgsql security definer set search_path = public as $$
begin
  if not ojv__student_ok(p_sid, p_token) then raise exception '다시 로그인해 주세요'; end if;
  return query
    select s.name, coalesce(sum(a.acorns), 0)::bigint as acorns
    from ojv_students s
    join ojv_activity a on a.student_id = s.id
      and a.created_at >= date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    where s.class_id = (select class_id from ojv_students where id = p_sid)
    group by s.id, s.name
    order by 2 desc, s.name
    limit 5;
end $$;

-- ---------- 선생님용 ----------
create or replace function ojv_teacher_overview(p_pw text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  return json_build_object(
    'classes', coalesce((select json_agg(json_build_object('id', id, 'name', name) order by id) from ojv_classes), '[]'::json),
    'students', coalesce((select json_agg(x order by x.class_id, x.name) from (
        select s.id, s.class_id, s.name, s.acorns, s.badges, s.last_active,
          (select count(*) from ojv_word_progress p where p.student_id = s.id and p.correct > 0) as learned,
          (select coalesce(sum(a.acorns), 0) from ojv_activity a where a.student_id = s.id
             and a.created_at >= now() - interval '7 days') as week_acorns,
          (select count(*) from ojv_activity a where a.student_id = s.id
             and a.created_at >= now() - interval '7 days') as week_sessions
        from ojv_students s) x), '[]'::json),
    'hard_words', coalesce((select json_agg(y) from (
        select p.word_id, s.class_id, sum(p.wrong) as wrong, sum(p.correct) as correct
        from ojv_word_progress p join ojv_students s on s.id = p.student_id
        group by p.word_id, s.class_id having sum(p.wrong) > 0
        order by sum(p.wrong) desc limit 60) y), '[]'::json)
  );
end $$;

create or replace function ojv_teacher_add_class(p_pw text, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if btrim(p_name) = '' then raise exception '반 이름을 입력해 주세요'; end if;
  insert into ojv_classes (name) values (btrim(p_name));
end $$;

create or replace function ojv_teacher_rename_class(p_pw text, p_class_id bigint, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  update ojv_classes set name = btrim(p_name) where id = p_class_id;
end $$;

create or replace function ojv_teacher_delete_class(p_pw text, p_class_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  delete from ojv_classes where id = p_class_id;
end $$;

create or replace function ojv_teacher_add_student(p_pw text, p_class_id bigint, p_name text, p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요'; end if;
  insert into ojv_students (class_id, name, pin_hash) values (p_class_id, btrim(p_name), crypt(p_pin, gen_salt('bf')));
end $$;

create or replace function ojv_teacher_reset_pin(p_pw text, p_sid uuid, p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요'; end if;
  update ojv_students set pin_hash = crypt(p_pin, gen_salt('bf')), token = null where id = p_sid;
end $$;

create or replace function ojv_teacher_move_student(p_pw text, p_sid uuid, p_class_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  update ojv_students set class_id = p_class_id where id = p_sid;
end $$;

create or replace function ojv_teacher_delete_student(p_pw text, p_sid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  delete from ojv_students where id = p_sid;
end $$;

create or replace function ojv_teacher_set_password(p_pw text, p_new text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not ojv__teacher_ok(p_pw) then raise exception '선생님 비밀번호가 맞지 않아요'; end if;
  if length(p_new) < 6 then raise exception '새 비밀번호는 6자 이상이어야 해요'; end if;
  update ojv_app_settings set value = crypt(p_new, gen_salt('bf')) where key = 'teacher_pw';
end $$;

-- ---------- 권한 ----------
revoke all on function ojv__student_ok(uuid, text), ojv__teacher_ok(text), ojv__student_state(uuid) from public, anon, authenticated;
grant execute on function
  ojv_list_classes(), ojv_student_enter(bigint, text, text), ojv_student_state(uuid, text),
  ojv_save_result(uuid, text, text, text, int, int, int, jsonb, text), ojv_class_weekly_top(uuid, text),
  ojv_teacher_overview(text), ojv_teacher_add_class(text, text), ojv_teacher_rename_class(text, bigint, text),
  ojv_teacher_delete_class(text, bigint), ojv_teacher_add_student(text, bigint, text, text),
  ojv_teacher_reset_pin(text, uuid, text), ojv_teacher_move_student(text, uuid, bigint),
  ojv_teacher_delete_student(text, uuid), ojv_teacher_set_password(text, text)
to anon, authenticated;

-- ===== 3레벨 확장 및 Auth 기반 교사 권한 =====
-- 기존 학생·단어 진도·배지를 삭제하지 않는 3레벨 확장.
create table if not exists public.ojv_teachers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.ojv_teachers enable row level security;
revoke all on public.ojv_teachers from public, anon, authenticated;

alter table public.ojv_students add column if not exists checkpoints jsonb not null default '{}'::jsonb;
alter table public.ojv_students add column if not exists voice_consent boolean not null default false;
alter table public.ojv_students add column if not exists consent_at timestamptz;
alter table public.ojv_students add column if not exists consent_by uuid;
alter table public.ojv_students add column if not exists token_expires_at timestamptz;

create table if not exists public.ojv_vocabulary (
 id text primary key, stage text not null check(stage in ('sprout','stem','tree')),
 topic text not null, en text not null, ko text not null, example text not null, translation text not null
);
create table if not exists public.ojv_word_aliases (
 legacy_id text primary key, word_id text not null references public.ojv_vocabulary(id)
);
alter table public.ojv_vocabulary enable row level security;
alter table public.ojv_word_aliases enable row level security;
revoke all on public.ojv_vocabulary, public.ojv_word_aliases from public, anon, authenticated;

create table if not exists public.ojv_login_limits (
 key text primary key, attempts integer not null default 0, started_at timestamptz not null default now()
);
alter table public.ojv_login_limits enable row level security;
revoke all on public.ojv_login_limits from public, anon, authenticated;

create or replace function public.ojv__teacher_ok(p_pw text)
returns boolean language sql stable security definer set search_path = public as $$
 select auth.uid() is not null and exists(select 1 from ojv_teachers where user_id=auth.uid());
$$;
-- 공개 기본 비밀번호는 온라인 관리자 인증에 사용하지 않습니다.
delete from public.ojv_app_settings where key='teacher_pw';
revoke all on function public.ojv_teacher_set_password(text,text) from public,anon,authenticated;

create or replace function public.ojv__student_ok(p_sid uuid,p_token text)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from ojv_students where id=p_sid and token is not null and token=p_token and token_expires_at>now());
$$;
create or replace function public.ojv__student_state(p_sid uuid)
returns json language sql stable security definer set search_path=public as $$
 select json_build_object('id',s.id,'name',s.name,'class_id',s.class_id,'class_name',c.name,
 'acorns',s.acorns,'badges',s.badges,'token',s.token,'checkpoints',s.checkpoints,'voice_consent',s.voice_consent,
 'progress',coalesce((select json_object_agg(word_id,json_build_array(correct,wrong)) from ojv_word_progress where student_id=s.id),'{}'::json))
 from ojv_students s join ojv_classes c on c.id=s.class_id where s.id=p_sid;
$$;

create or replace function public.ojv_student_enter(p_class_id bigint,p_name text,p_pin text)
returns json language plpgsql security definer set search_path=public,extensions as $$
declare s ojv_students; attempt_count int; limit_key text;
begin
 p_name:=btrim(p_name);
 if p_name is null or p_name='' or length(p_name)>20 then raise exception '이름을 1~20자로 입력해 주세요';end if;
 if p_pin is null or p_pin!~'^[0-9]{4}$' then raise exception '비밀번호는 숫자 4자리예요';end if;
 if not exists(select 1 from ojv_classes where id=p_class_id) then raise exception '반을 다시 골라 주세요';end if;
 limit_key:=p_class_id::text||':'||p_name;
 insert into ojv_login_limits(key,attempts,started_at) values(limit_key,1,now())
 on conflict(key) do update set attempts=case when ojv_login_limits.started_at<now()-interval '15 minutes' then 1 else ojv_login_limits.attempts+1 end,
 started_at=case when ojv_login_limits.started_at<now()-interval '15 minutes' then now() else ojv_login_limits.started_at end
 returning attempts into attempt_count;
 -- JSON 오류를 반환해 실패 횟수가 예외의 롤백으로 사라지지 않게 합니다.
 if attempt_count>20 then return json_build_object('error','잠시 후 다시 로그인해 주세요');end if;
 select * into s from ojv_students where class_id=p_class_id and name=p_name;
 if not found then
  insert into ojv_students(class_id,name,pin_hash,token,token_expires_at)
  values(p_class_id,p_name,crypt(p_pin,gen_salt('bf')),encode(gen_random_bytes(24),'hex'),now()+interval '7 days') returning * into s;
 else
  if s.pin_hash<>crypt(p_pin,s.pin_hash) then return json_build_object('error','비밀번호가 맞지 않아요');end if;
  update ojv_students set token=encode(gen_random_bytes(24),'hex'),token_expires_at=now()+interval '7 days',last_active=now()
  where id=s.id returning * into s;
 end if;
 delete from ojv_login_limits where key=limit_key;
 return ojv__student_state(s.id);
end $$;

create or replace function public.ojv_save_checkpoint(p_sid uuid,p_token text,p_topic text,p_part int,p_index int,p_complete boolean)
returns json language plpgsql security definer set search_path=public as $$
begin
 if not ojv__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 if p_topic is null or p_topic!~'^[a-z-]{1,40}$' or p_part is null or p_part<0 or p_part>3 or p_index is null or p_index<0 or p_index>4 or p_complete is null
 then raise exception '학습 위치를 다시 확인해 주세요';end if;
 if p_complete and p_index<>4 then raise exception '마지막 카드까지 확인해 주세요';end if;
 update ojv_students set checkpoints=jsonb_set(checkpoints,array[p_topic||':'||p_part::text],jsonb_build_object('index',p_index,'complete',p_complete)),last_active=now() where id=p_sid;
 return ojv__student_state(p_sid);
end $$;
create or replace function public.ojv_teacher_voice_consent(p_pw text,p_sid uuid,p_value boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not ojv__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 update ojv_students set voice_consent=coalesce(p_value,false),consent_at=now(),consent_by=auth.uid() where id=p_sid;
end $$;

create or replace function public.ojv_teacher_overview(p_pw text)
returns json language plpgsql security definer set search_path=public as $$
begin
 if not ojv__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 return json_build_object(
  'classes',coalesce((select json_agg(json_build_object('id',id,'name',name) order by id) from ojv_classes),'[]'::json),
  'students',coalesce((select json_agg(x order by x.class_id,x.name) from (
   select s.id,s.class_id,s.name,s.acorns,s.badges,s.last_active,s.voice_consent,
   (select count(distinct coalesce(a.word_id,p.word_id)) from ojv_word_progress p left join ojv_word_aliases a on a.legacy_id=p.word_id where p.student_id=s.id and p.correct>0) as learned,
   json_build_object(
    'sprout',(select count(distinct v.id) from ojv_word_progress p left join ojv_word_aliases a on a.legacy_id=p.word_id join ojv_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='sprout'),
    'stem',(select count(distinct v.id) from ojv_word_progress p left join ojv_word_aliases a on a.legacy_id=p.word_id join ojv_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='stem'),
    'tree',(select count(distinct v.id) from ojv_word_progress p left join ojv_word_aliases a on a.legacy_id=p.word_id join ojv_vocabulary v on v.id=coalesce(a.word_id,p.word_id) where p.student_id=s.id and p.correct>0 and v.stage='tree')
   ) as learned_by_stage,
   (select coalesce(sum(acorns),0) from ojv_activity where student_id=s.id and created_at>=now()-interval '7 days') as week_acorns,
   (select count(*) from ojv_activity where student_id=s.id and created_at>=now()-interval '7 days') as week_sessions from ojv_students s
  ) x),'[]'::json),
  'hard_words',coalesce((select json_agg(y) from (
   select p.word_id,s.class_id,sum(p.wrong) as wrong,sum(p.correct) as correct from ojv_word_progress p join ojv_students s on s.id=p.student_id
   group by p.word_id,s.class_id having sum(p.wrong)>0 order by sum(p.wrong) desc limit 60
  ) y),'[]'::json)
 );
end $$;
revoke all on function public.ojv__student_ok(uuid,text),public.ojv__student_state(uuid),public.ojv__teacher_ok(text) from public,anon,authenticated;
revoke all on function public.ojv_save_checkpoint(uuid,text,text,int,int,boolean),public.ojv_teacher_voice_consent(text,uuid,boolean) from public;
grant execute on function public.ojv_save_checkpoint(uuid,text,text,int,int,boolean) to anon,authenticated;
grant execute on function public.ojv_teacher_voice_consent(text,uuid,boolean) to authenticated;

-- 결과 재전송으로 보상과 진도가 중복 증가하지 않도록 요청 식별자를 보관합니다.
create table if not exists public.ojv_result_receipts (
 student_id uuid not null references public.ojv_students(id) on delete cascade,
 request_id uuid not null, created_at timestamptz not null default now(),
 primary key(student_id,request_id)
);
alter table public.ojv_result_receipts enable row level security;
revoke all on public.ojv_result_receipts from public,anon,authenticated;
create or replace function public.ojv_save_result_v2(p_sid uuid,p_token text,p_request_id uuid,p_kind text,p_topic text,
 p_score int,p_total int,p_acorns int,p_words jsonb,p_badge text)
returns json language plpgsql security definer set search_path=public as $$
declare result json;
begin
 if not ojv__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 if p_request_id is null then raise exception '요청 식별자가 필요해요';end if;
 perform 1 from ojv_students where id=p_sid for update;
 if exists(select 1 from ojv_result_receipts where student_id=p_sid and request_id=p_request_id) then return ojv__student_state(p_sid);end if;
 result:=ojv_save_result(p_sid,p_token,p_kind,p_topic,p_score,p_total,p_acorns,p_words,p_badge);
 insert into ojv_result_receipts(student_id,request_id) values(p_sid,p_request_id);
 return result;
end $$;
revoke all on function public.ojv_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text) from public;
grant execute on function public.ojv_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text) to anon,authenticated;
