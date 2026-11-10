-- VOCA 전용 스키마. 기존 public.ovh_* 데이터는 *_legacy 테이블로 보존하고
-- 같은 이름의 보안 호환 뷰를 통해 기존 RPC가 새 ovh 스키마를 사용하게 한다.
create schema if not exists ovh;
revoke all on schema ovh from public, anon, authenticated;

create table if not exists ovh.app_settings (
  key text primary key,
  value text not null
);

create table if not exists ovh.classes (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists ovh.students (
  id uuid primary key default gen_random_uuid(),
  class_id bigint not null references ovh.classes(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 20),
  pin_hash text not null,
  token text,
  token_expires_at timestamptz,
  acorns integer not null default 0 check (acorns >= 0),
  badges jsonb not null default '[]'::jsonb,
  checkpoints jsonb not null default '{}'::jsonb,
  voice_consent boolean not null default false,
  consent_at timestamptz,
  consent_by uuid references auth.users(id) on delete set null,
  grade smallint check (grade between 9 and 12),
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists ovh.teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'teacher' check (role in ('admin','teacher')),
  created_at timestamptz not null default now()
);

create table if not exists ovh.parent_links (
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references ovh.students(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, student_id)
);

create table if not exists ovh.levels (
  id text primary key check (id in ('prep','grade1','grade2','grade3')),
  name_ko text not null,
  grade_min smallint not null,
  grade_max smallint not null,
  expected_words integer not null,
  sort_order smallint not null unique,
  status text not null default 'published' check (status in ('draft','reviewed','published','archived'))
);

create table if not exists ovh.units (
  id text primary key,
  level_id text not null references ovh.levels(id) on delete restrict,
  unit_no smallint not null check (unit_no > 0),
  title_en text not null,
  title_ko text not null,
  icon text,
  status text not null default 'published' check (status in ('draft','reviewed','published','archived')),
  unique (level_id, unit_no)
);

create table if not exists ovh.vocabulary (
  id text primary key,
  content_key text not null unique,
  stage text not null references ovh.levels(id) on delete restrict,
  topic text not null references ovh.units(id) on delete restrict,
  en text not null,
  ko text not null,
  part_of_speech text,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  example text not null,
  translation text not null,
  example_2 text not null,
  translation_2 text not null,
  image_path text,
  audio_path text,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived')),
  updated_at timestamptz not null default now()
);

create table if not exists ovh.word_aliases (
  legacy_id text primary key,
  word_id text not null references ovh.vocabulary(id) on delete cascade
);

create table if not exists ovh.sentences (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  unit_id text not null references ovh.units(id) on delete cascade,
  pattern_no smallint not null default 1,
  sentence_en text not null,
  sentence_ko text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived'))
);

create table if not exists ovh.exercises (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  unit_id text not null references ovh.units(id) on delete cascade,
  exercise_type text not null check (exercise_type in ('choice','listening','matching','spelling','sentence')),
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  answer text not null,
  explanation text,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived'))
);

create table if not exists ovh.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id bigint not null references ovh.classes(id) on delete cascade,
  unit_id text not null references ovh.units(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, unit_id)
);

create table if not exists ovh.word_progress (
  student_id uuid not null references ovh.students(id) on delete cascade,
  word_id text not null,
  correct integer not null default 0 check (correct >= 0),
  wrong integer not null default 0 check (wrong >= 0),
  mastery_state text not null default 'new' check (mastery_state in ('new','learning','solid','mastered')),
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, word_id)
);

create table if not exists ovh.activity (
  id bigint generated always as identity primary key,
  student_id uuid not null references ovh.students(id) on delete cascade,
  kind text not null,
  topic text,
  score integer not null default 0,
  total integer not null default 0,
  acorns integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists ovh.rewards (
  id bigint generated always as identity primary key,
  student_id uuid not null references ovh.students(id) on delete cascade,
  reward_key text not null,
  awarded_at timestamptz not null default now(),
  unique (student_id, reward_key)
);

create table if not exists ovh.login_limits (
  key text primary key,
  attempts integer not null default 0,
  started_at timestamptz not null default now()
);

create table if not exists ovh.result_receipts (
  student_id uuid not null references ovh.students(id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (student_id, request_id)
);

create table if not exists ovh.content_versions (
  id bigint generated always as identity primary key,
  version text not null unique,
  status text not null default 'draft' check (status in ('draft','published','rolled_back')),
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists ovh.import_jobs (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  status text not null default 'validated' check (status in ('validated','published','failed')),
  summary jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists ovh.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ovh_activity_student_time on ovh.activity(student_id, created_at desc);
create index if not exists ovh_progress_review on ovh.word_progress(student_id, next_review_at);
create index if not exists ovh_assignments_class_due on ovh.assignments(class_id, due_at);

create or replace function ovh.refresh_mastery()
returns trigger language plpgsql set search_path=ovh,public as $$
declare attempts integer; rate numeric;
begin
  attempts:=new.correct+new.wrong;
  rate:=case when attempts=0 then 0 else new.correct::numeric/attempts end;
  new.mastery_state:=case
    when attempts>=8 and rate>=0.9 then 'mastered'
    when attempts>=5 and rate>=0.75 then 'solid'
    when attempts>0 then 'learning'
    else 'new' end;
  new.next_review_at:=case new.mastery_state
    when 'mastered' then now()+interval '30 days'
    when 'solid' then now()+interval '14 days'
    when 'learning' then now()+interval '3 days'
    else now()+interval '1 day' end;
  if tg_op='UPDATE' then new.updated_at:=now(); else new.updated_at:=coalesce(new.updated_at,now()); end if;
  return new;
end $$;
drop trigger if exists ovh_refresh_mastery on ovh.word_progress;
create trigger ovh_refresh_mastery before insert or update of correct,wrong on ovh.word_progress
for each row execute function ovh.refresh_mastery();

insert into ovh.levels(id,name_ko,grade_min,grade_max,expected_words,sort_order) values
 ('prep','예비고1',9,9,200,1),('grade1','고1',10,10,300,2),('grade2','고2',11,11,300,3),('grade3','고3',12,12,300,4)
on conflict (id) do update set name_ko=excluded.name_ko,grade_min=excluded.grade_min,
 grade_max=excluded.grade_max,expected_words=excluded.expected_words,sort_order=excluded.sort_order;

-- 기존 데이터를 보존한 채 전용 스키마로 복사한다.
insert into ovh.app_settings(key,value) select key,value from public.ovh_app_settings on conflict (key) do nothing;
insert into ovh.classes(id,name,created_at) overriding system value
 select id,name,created_at from public.ovh_classes on conflict (id) do nothing;
insert into ovh.students(id,class_id,name,pin_hash,token,token_expires_at,acorns,badges,checkpoints,
 voice_consent,consent_at,consent_by,created_at,last_active)
 select id,class_id,name,pin_hash,token,token_expires_at,acorns,badges,checkpoints,
 voice_consent,consent_at,consent_by,created_at,last_active from public.ovh_students on conflict (id) do nothing;
insert into ovh.teachers(user_id,created_at) select user_id,created_at from public.ovh_teachers on conflict (user_id) do nothing;
insert into ovh.word_progress(student_id,word_id,correct,wrong,updated_at)
 select student_id,word_id,correct,wrong,updated_at from public.ovh_word_progress on conflict (student_id,word_id) do nothing;
insert into ovh.activity(id,student_id,kind,topic,score,total,acorns,created_at) overriding system value
 select id,student_id,kind,topic,score,total,acorns,created_at from public.ovh_activity on conflict (id) do nothing;
insert into ovh.word_aliases(legacy_id,word_id) select legacy_id,word_id from public.ovh_word_aliases on conflict (legacy_id) do nothing;
insert into ovh.login_limits(key,attempts,started_at) select key,attempts,started_at from public.ovh_login_limits on conflict (key) do nothing;
insert into ovh.result_receipts(student_id,request_id,created_at) select student_id,request_id,created_at from public.ovh_result_receipts on conflict do nothing;

select setval(pg_get_serial_sequence('ovh.classes','id'),coalesce((select max(id) from ovh.classes),1),true);
select setval(pg_get_serial_sequence('ovh.activity','id'),coalesce((select max(id) from ovh.activity),1),true);

-- 레거시 테이블은 삭제하지 않고 이름을 바꿔 보관한다.
alter table public.ovh_app_settings rename to ovh_app_settings_legacy;
alter table public.ovh_classes rename to ovh_classes_legacy;
alter table public.ovh_students rename to ovh_students_legacy;
alter table public.ovh_teachers rename to ovh_teachers_legacy;
alter table public.ovh_word_progress rename to ovh_word_progress_legacy;
alter table public.ovh_activity rename to ovh_activity_legacy;
alter table public.ovh_vocabulary rename to ovh_vocabulary_legacy;
alter table public.ovh_word_aliases rename to ovh_word_aliases_legacy;
alter table public.ovh_login_limits rename to ovh_login_limits_legacy;
alter table public.ovh_result_receipts rename to ovh_result_receipts_legacy;

create view public.ovh_app_settings with (security_invoker=true) as select * from ovh.app_settings;
create view public.ovh_classes with (security_invoker=true) as select * from ovh.classes;
create view public.ovh_students with (security_invoker=true) as
 select id,class_id,name,pin_hash,token,acorns,badges,created_at,last_active,checkpoints,
 voice_consent,consent_at,consent_by,token_expires_at from ovh.students;
create view public.ovh_teachers with (security_invoker=true) as select user_id,created_at from ovh.teachers;
create view public.ovh_word_progress with (security_invoker=true) as
 select student_id,word_id,correct,wrong,updated_at from ovh.word_progress;
create view public.ovh_activity with (security_invoker=true) as select * from ovh.activity;
create view public.ovh_vocabulary with (security_invoker=true) as
 select id,stage,topic,en,ko,example,translation from ovh.vocabulary;
create view public.ovh_word_aliases with (security_invoker=true) as select * from ovh.word_aliases;
create view public.ovh_login_limits with (security_invoker=true) as select * from ovh.login_limits;
create view public.ovh_result_receipts with (security_invoker=true) as select * from ovh.result_receipts;

-- 직접 테이블 접근은 차단하고 모든 앱 접근은 검증된 RPC를 통과한다.
alter table ovh.app_settings enable row level security;
alter table ovh.classes enable row level security;
alter table ovh.students enable row level security;
alter table ovh.teachers enable row level security;
alter table ovh.parent_links enable row level security;
alter table ovh.levels enable row level security;
alter table ovh.units enable row level security;
alter table ovh.vocabulary enable row level security;
alter table ovh.word_aliases enable row level security;
alter table ovh.sentences enable row level security;
alter table ovh.exercises enable row level security;
alter table ovh.assignments enable row level security;
alter table ovh.word_progress enable row level security;
alter table ovh.activity enable row level security;
alter table ovh.rewards enable row level security;
alter table ovh.login_limits enable row level security;
alter table ovh.result_receipts enable row level security;
alter table ovh.content_versions enable row level security;
alter table ovh.import_jobs enable row level security;
alter table ovh.audit_logs enable row level security;

revoke all on all tables in schema ovh from public, anon, authenticated;
revoke all on all sequences in schema ovh from public, anon, authenticated;
revoke all on public.ovh_app_settings,public.ovh_classes,public.ovh_students,public.ovh_teachers,
 public.ovh_word_progress,public.ovh_activity,public.ovh_vocabulary,public.ovh_word_aliases,
 public.ovh_login_limits,public.ovh_result_receipts from public,anon,authenticated;

-- 기존 RPC가 호환 뷰를 통해 새 스키마를 사용한다. OVH 함수만 명시적으로 잠근다.
revoke all on function public.ovh__student_ok(uuid,text),public.ovh__student_state(uuid),
 public.ovh__teacher_ok(text),public.ovh_list_classes(),public.ovh_student_enter(bigint,text,text),
 public.ovh_student_state(uuid,text),public.ovh_save_result(uuid,text,text,text,int,int,int,jsonb,text),
 public.ovh_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text),
 public.ovh_save_checkpoint(uuid,text,text,int,int,boolean),public.ovh_class_weekly_top(uuid,text),
 public.ovh_teacher_overview(text),public.ovh_teacher_add_class(text,text),
 public.ovh_teacher_rename_class(text,bigint,text),public.ovh_teacher_delete_class(text,bigint),
 public.ovh_teacher_add_student(text,bigint,text,text),public.ovh_teacher_reset_pin(text,uuid,text),
 public.ovh_teacher_move_student(text,uuid,bigint),public.ovh_teacher_delete_student(text,uuid),
 public.ovh_teacher_voice_consent(text,uuid,boolean),public.ovh_teacher_set_password(text,text)
 from public,anon,authenticated;
grant execute on function public.ovh_list_classes(),public.ovh_student_enter(bigint,text,text),
 public.ovh_student_state(uuid,text),public.ovh_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text),
 public.ovh_save_checkpoint(uuid,text,text,int,int,boolean),public.ovh_class_weekly_top(uuid,text) to anon,authenticated;
grant execute on function public.ovh_teacher_overview(text),public.ovh_teacher_add_class(text,text),
 public.ovh_teacher_rename_class(text,bigint,text),public.ovh_teacher_delete_class(text,bigint),
 public.ovh_teacher_add_student(text,bigint,text,text),public.ovh_teacher_reset_pin(text,uuid,text),
 public.ovh_teacher_move_student(text,uuid,bigint),public.ovh_teacher_delete_student(text,uuid),
 public.ovh_teacher_voice_consent(text,uuid,boolean) to authenticated;

create or replace function public.ovh_teacher_set_assignment(p_pw text,p_class_id bigint,p_unit_id text,p_due_at timestamptz)
returns json language plpgsql security definer set search_path=public,ovh as $$
declare result json;
begin
 if not public.ovh__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 if not exists(select 1 from ovh.classes where id=p_class_id) then raise exception '반을 찾을 수 없어요';end if;
 if not exists(select 1 from ovh.units where id=p_unit_id and status='published') then raise exception '게시된 Unit을 찾을 수 없어요';end if;
 insert into ovh.assignments(class_id,unit_id,assigned_by,due_at) values(p_class_id,p_unit_id,auth.uid(),p_due_at)
 on conflict(class_id,unit_id) do update set assigned_by=excluded.assigned_by,due_at=excluded.due_at;
 insert into ovh.audit_logs(actor_id,action,entity_type,entity_id,details)
 values(auth.uid(),'upsert','assignment',p_class_id::text||':'||p_unit_id,jsonb_build_object('due_at',p_due_at));
 select json_build_object('class_id',class_id,'unit_id',unit_id,'due_at',due_at) into result
 from ovh.assignments where class_id=p_class_id and unit_id=p_unit_id;
 return result;
end $$;

create or replace function public.ovh_student_assignments(p_sid uuid,p_token text)
returns json language plpgsql security definer set search_path=public,ovh as $$
declare result json;
begin
 if not public.ovh__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 select coalesce(json_agg(json_build_object('unit_id',a.unit_id,'due_at',a.due_at,'title_en',u.title_en,'title_ko',u.title_ko)
 order by a.due_at nulls last,u.unit_no),'[]'::json) into result
 from ovh.assignments a join ovh.units u on u.id=a.unit_id
 where a.class_id=(select class_id from ovh.students where id=p_sid);
 return result;
end $$;

create or replace function public.ovh_parent_overview()
returns json language plpgsql security definer set search_path=public,ovh as $$
declare result json;
begin
 if auth.uid() is null then raise exception '보호자 계정으로 로그인해 주세요';end if;
 select coalesce(json_agg(x order by x.name),'[]'::json) into result from (
  select s.id,s.name,c.name as class_name,s.acorns,s.last_active,
   (select count(*) from ovh.word_progress p where p.student_id=s.id and p.correct>0) learned,
   (select count(*) from ovh.word_progress p where p.student_id=s.id and p.wrong>p.correct) weak_words,
   (select count(*) from ovh.activity a where a.student_id=s.id and a.created_at>=now()-interval '7 days') week_sessions
  from ovh.parent_links l join ovh.students s on s.id=l.student_id join ovh.classes c on c.id=s.class_id
  where l.user_id=auth.uid()
 ) x;
 return result;
end $$;

create or replace function public.ovh_admin_import_content(p_file_name text,p_payload jsonb,p_publish boolean default false)
returns json language plpgsql security definer set search_path=public,ovh as $$
declare row_data jsonb; errors jsonb:='[]'::jsonb; added integer:=0; changed integer:=0; archived integer:=0;
declare job_id uuid:=gen_random_uuid(); version_text text; totals jsonb;
begin
 if not public.ovh__teacher_ok('authenticated') then raise exception '관리자 계정으로 로그인해 주세요';end if;
 if not exists(select 1 from ovh.teachers where user_id=auth.uid() and role='admin') then raise exception '관리자 권한이 필요해요';end if;
 if jsonb_typeof(p_payload->'vocabulary')<>'array' then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','message','Vocabulary 시트가 필요해요'));end if;
 for row_data in select value from jsonb_array_elements(coalesce(p_payload->'vocabulary','[]'::jsonb)) loop
  if coalesce(row_data->>'content_key','')='' then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','row',row_data->>'row','message','content_key가 필요해요'));end if;
  if upper(coalesce(row_data->>'action','UPSERT'))<>'ARCHIVE' and not exists(select 1 from ovh.units where id=row_data->>'unit_code') then
   errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','row',row_data->>'row','message','unit_code를 찾을 수 없어요'));end if;
 end loop;
 if jsonb_array_length(errors)>0 then
  insert into ovh.import_jobs(id,file_name,status,summary,errors,created_by) values(job_id,left(p_file_name,200),'failed','{}',errors,auth.uid());
  return json_build_object('ok',false,'job_id',job_id,'errors',errors);
 end if;
 for row_data in select value from jsonb_array_elements(coalesce(p_payload->'vocabulary','[]'::jsonb)) loop
  if upper(coalesce(row_data->>'action','UPSERT'))='ARCHIVE' then
   update ovh.vocabulary set status='archived',updated_at=now() where content_key=row_data->>'content_key'; archived:=archived+1;
  else
   if exists(select 1 from ovh.vocabulary where content_key=row_data->>'content_key') then changed:=changed+1;else added:=added+1;end if;
   insert into ovh.vocabulary(id,content_key,stage,topic,en,ko,part_of_speech,difficulty,example,translation,example_2,translation_2,image_path,audio_path,status)
   values(row_data->>'content_key',row_data->>'content_key',row_data->>'level',row_data->>'unit_code',row_data->>'word',row_data->>'meaning_ko',
    nullif(row_data->>'part_of_speech',''),coalesce(nullif(row_data->>'difficulty','')::smallint,1),row_data->>'example_en',row_data->>'example_ko',
    row_data->>'example_en_2',row_data->>'example_ko_2',nullif(row_data->>'image_filename',''),nullif(row_data->>'audio_filename',''),case when p_publish then 'published' else coalesce(nullif(row_data->>'status',''),'draft') end)
   on conflict(content_key) do update set stage=excluded.stage,topic=excluded.topic,en=excluded.en,ko=excluded.ko,
    part_of_speech=excluded.part_of_speech,difficulty=excluded.difficulty,example=excluded.example,translation=excluded.translation,example_2=excluded.example_2,translation_2=excluded.translation_2,
    image_path=excluded.image_path,audio_path=excluded.audio_path,status=excluded.status,updated_at=now();
  end if;
 end loop;
 select jsonb_object_agg(stage,n) into totals from (select stage,count(*) n from ovh.vocabulary where status='published' group by stage) x;
 if p_publish and (coalesce((totals->>'prep')::int,0)<>200 or coalesce((totals->>'grade1')::int,0)<>300 or coalesce((totals->>'grade2')::int,0)<>300 or coalesce((totals->>'grade3')::int,0)<>300) then
  raise exception '게시 콘텐츠는 예비고1 200개, 고1/고2/고3 각 300개여야 해요';
 end if;
 version_text:=to_char(clock_timestamp(),'YYYY.MM.DD.HH24MISS');
 insert into ovh.content_versions(version,status,snapshot,created_by,published_at)
 values(version_text,case when p_publish then 'published' else 'draft' end,
  jsonb_build_object('totals',totals,'added',added,'changed',changed,'archived',archived),auth.uid(),case when p_publish then now() end);
 insert into ovh.import_jobs(id,file_name,status,summary,created_by)
 values(job_id,left(p_file_name,200),case when p_publish then 'published' else 'validated' end,
  jsonb_build_object('version',version_text,'added',added,'changed',changed,'archived',archived,'totals',totals),auth.uid());
 insert into ovh.audit_logs(actor_id,action,entity_type,entity_id,details)
 values(auth.uid(),case when p_publish then 'publish' else 'validate' end,'content_import',job_id::text,
  jsonb_build_object('file_name',left(p_file_name,200),'version',version_text));
 return json_build_object('ok',true,'job_id',job_id,'version',version_text,'added',added,'changed',changed,'archived',archived,'totals',totals);
end $$;

revoke all on function public.ovh_teacher_set_assignment(text,bigint,text,timestamptz),
 public.ovh_student_assignments(uuid,text),public.ovh_parent_overview(),
 public.ovh_admin_import_content(text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.ovh_student_assignments(uuid,text) to anon,authenticated;
grant execute on function public.ovh_teacher_set_assignment(text,bigint,text,timestamptz),
 public.ovh_parent_overview(),public.ovh_admin_import_content(text,jsonb,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('ovh-images','ovh-images',false,5242880,array['image/png','image/jpeg','image/webp']),
 ('ovh-audio','ovh-audio',false,10485760,array['audio/mpeg','audio/wav','audio/ogg']),
 ('ovh-imports','ovh-imports',false,10485760,array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists ovh_admin_storage_select on storage.objects;
drop policy if exists ovh_admin_storage_insert on storage.objects;
drop policy if exists ovh_admin_storage_update on storage.objects;
drop policy if exists ovh_admin_storage_delete on storage.objects;
create policy ovh_admin_storage_select on storage.objects for select to authenticated
 using (bucket_id in ('ovh-images','ovh-audio','ovh-imports') and exists(select 1 from ovh.teachers t where t.user_id=auth.uid() and t.role='admin'));
create policy ovh_admin_storage_insert on storage.objects for insert to authenticated
 with check (bucket_id in ('ovh-images','ovh-audio','ovh-imports') and exists(select 1 from ovh.teachers t where t.user_id=auth.uid() and t.role='admin'));
create policy ovh_admin_storage_update on storage.objects for update to authenticated
 using (bucket_id in ('ovh-images','ovh-audio','ovh-imports') and exists(select 1 from ovh.teachers t where t.user_id=auth.uid() and t.role='admin'))
 with check (bucket_id in ('ovh-images','ovh-audio','ovh-imports') and exists(select 1 from ovh.teachers t where t.user_id=auth.uid() and t.role='admin'));
create policy ovh_admin_storage_delete on storage.objects for delete to authenticated
 using (bucket_id in ('ovh-images','ovh-audio','ovh-imports') and exists(select 1 from ovh.teachers t where t.user_id=auth.uid() and t.role='admin'));

insert into ovh.content_versions(version,status,snapshot,published_at)
values('2026.11.10.1','published',jsonb_build_object('source','high-school-curriculum'),now())
on conflict (version) do nothing;
