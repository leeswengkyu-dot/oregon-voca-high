-- VOCA 전용 스키마. 기존 public.ojv_* 데이터는 *_legacy 테이블로 보존하고
-- 같은 이름의 보안 호환 뷰를 통해 기존 RPC가 새 ojv 스키마를 사용하게 한다.
create schema if not exists ojv;
revoke all on schema ojv from public, anon, authenticated;

create table if not exists ojv.app_settings (
  key text primary key,
  value text not null
);

create table if not exists ojv.classes (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists ojv.students (
  id uuid primary key default gen_random_uuid(),
  class_id bigint not null references ojv.classes(id) on delete restrict,
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
  grade smallint check (grade between 1 and 6),
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists ojv.teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'teacher' check (role in ('admin','teacher')),
  created_at timestamptz not null default now()
);

create table if not exists ojv.parent_links (
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references ojv.students(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, student_id)
);

create table if not exists ojv.levels (
  id text primary key check (id in ('sprout','stem','tree')),
  name_ko text not null,
  grade_min smallint not null,
  grade_max smallint not null,
  expected_words integer not null,
  sort_order smallint not null unique,
  status text not null default 'published' check (status in ('draft','reviewed','published','archived'))
);

create table if not exists ojv.units (
  id text primary key,
  level_id text not null references ojv.levels(id) on delete restrict,
  unit_no smallint not null check (unit_no > 0),
  title_en text not null,
  title_ko text not null,
  icon text,
  status text not null default 'published' check (status in ('draft','reviewed','published','archived')),
  unique (level_id, unit_no)
);

create table if not exists ojv.vocabulary (
  id text primary key,
  content_key text not null unique,
  stage text not null references ojv.levels(id) on delete restrict,
  topic text not null references ojv.units(id) on delete restrict,
  en text not null,
  ko text not null,
  part_of_speech text,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  example text not null,
  translation text not null,
  image_path text,
  audio_path text,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived')),
  updated_at timestamptz not null default now()
);

create table if not exists ojv.word_aliases (
  legacy_id text primary key,
  word_id text not null references ojv.vocabulary(id) on delete cascade
);

create table if not exists ojv.sentences (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  unit_id text not null references ojv.units(id) on delete cascade,
  pattern_no smallint not null default 1,
  sentence_en text not null,
  sentence_ko text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived'))
);

create table if not exists ojv.exercises (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  unit_id text not null references ojv.units(id) on delete cascade,
  exercise_type text not null check (exercise_type in ('choice','listening','matching','spelling','sentence')),
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  answer text not null,
  explanation text,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived'))
);

create table if not exists ojv.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id bigint not null references ojv.classes(id) on delete cascade,
  unit_id text not null references ojv.units(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, unit_id)
);

create table if not exists ojv.word_progress (
  student_id uuid not null references ojv.students(id) on delete cascade,
  word_id text not null,
  correct integer not null default 0 check (correct >= 0),
  wrong integer not null default 0 check (wrong >= 0),
  mastery_state text not null default 'new' check (mastery_state in ('new','learning','solid','mastered')),
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, word_id)
);

create table if not exists ojv.activity (
  id bigint generated always as identity primary key,
  student_id uuid not null references ojv.students(id) on delete cascade,
  kind text not null,
  topic text,
  score integer not null default 0,
  total integer not null default 0,
  acorns integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists ojv.rewards (
  id bigint generated always as identity primary key,
  student_id uuid not null references ojv.students(id) on delete cascade,
  reward_key text not null,
  awarded_at timestamptz not null default now(),
  unique (student_id, reward_key)
);

create table if not exists ojv.login_limits (
  key text primary key,
  attempts integer not null default 0,
  started_at timestamptz not null default now()
);

create table if not exists ojv.result_receipts (
  student_id uuid not null references ojv.students(id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (student_id, request_id)
);

create table if not exists ojv.content_versions (
  id bigint generated always as identity primary key,
  version text not null unique,
  status text not null default 'draft' check (status in ('draft','published','rolled_back')),
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists ojv.import_jobs (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  status text not null default 'validated' check (status in ('validated','published','failed')),
  summary jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists ojv.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ojv_activity_student_time on ojv.activity(student_id, created_at desc);
create index if not exists ojv_progress_review on ojv.word_progress(student_id, next_review_at);
create index if not exists ojv_assignments_class_due on ojv.assignments(class_id, due_at);

create or replace function ojv.refresh_mastery()
returns trigger language plpgsql set search_path=ojv,public as $$
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
drop trigger if exists ojv_refresh_mastery on ojv.word_progress;
create trigger ojv_refresh_mastery before insert or update of correct,wrong on ojv.word_progress
for each row execute function ojv.refresh_mastery();

insert into ojv.levels(id,name_ko,grade_min,grade_max,expected_words,sort_order) values
 ('sprout','새싹 숲',1,2,300,1),('stem','줄기 숲',3,4,400,2),('tree','나무 숲',5,6,500,3)
on conflict (id) do update set name_ko=excluded.name_ko,grade_min=excluded.grade_min,
 grade_max=excluded.grade_max,expected_words=excluded.expected_words,sort_order=excluded.sort_order;

-- 기존 데이터를 보존한 채 전용 스키마로 복사한다.
insert into ojv.app_settings(key,value) select key,value from public.ojv_app_settings on conflict (key) do nothing;
insert into ojv.classes(id,name,created_at) overriding system value
 select id,name,created_at from public.ojv_classes on conflict (id) do nothing;
insert into ojv.students(id,class_id,name,pin_hash,token,token_expires_at,acorns,badges,checkpoints,
 voice_consent,consent_at,consent_by,created_at,last_active)
 select id,class_id,name,pin_hash,token,token_expires_at,acorns,badges,checkpoints,
 voice_consent,consent_at,consent_by,created_at,last_active from public.ojv_students on conflict (id) do nothing;
insert into ojv.teachers(user_id,created_at) select user_id,created_at from public.ojv_teachers on conflict (user_id) do nothing;
insert into ojv.word_progress(student_id,word_id,correct,wrong,updated_at)
 select student_id,word_id,correct,wrong,updated_at from public.ojv_word_progress on conflict (student_id,word_id) do nothing;
insert into ojv.activity(id,student_id,kind,topic,score,total,acorns,created_at) overriding system value
 select id,student_id,kind,topic,score,total,acorns,created_at from public.ojv_activity on conflict (id) do nothing;
insert into ojv.word_aliases(legacy_id,word_id) select legacy_id,word_id from public.ojv_word_aliases on conflict (legacy_id) do nothing;
insert into ojv.login_limits(key,attempts,started_at) select key,attempts,started_at from public.ojv_login_limits on conflict (key) do nothing;
insert into ojv.result_receipts(student_id,request_id,created_at) select student_id,request_id,created_at from public.ojv_result_receipts on conflict do nothing;

select setval(pg_get_serial_sequence('ojv.classes','id'),coalesce((select max(id) from ojv.classes),1),true);
select setval(pg_get_serial_sequence('ojv.activity','id'),coalesce((select max(id) from ojv.activity),1),true);

-- 레거시 테이블은 삭제하지 않고 이름을 바꿔 보관한다.
alter table public.ojv_app_settings rename to ojv_app_settings_legacy;
alter table public.ojv_classes rename to ojv_classes_legacy;
alter table public.ojv_students rename to ojv_students_legacy;
alter table public.ojv_teachers rename to ojv_teachers_legacy;
alter table public.ojv_word_progress rename to ojv_word_progress_legacy;
alter table public.ojv_activity rename to ojv_activity_legacy;
alter table public.ojv_vocabulary rename to ojv_vocabulary_legacy;
alter table public.ojv_word_aliases rename to ojv_word_aliases_legacy;
alter table public.ojv_login_limits rename to ojv_login_limits_legacy;
alter table public.ojv_result_receipts rename to ojv_result_receipts_legacy;

create view public.ojv_app_settings with (security_invoker=true) as select * from ojv.app_settings;
create view public.ojv_classes with (security_invoker=true) as select * from ojv.classes;
create view public.ojv_students with (security_invoker=true) as
 select id,class_id,name,pin_hash,token,acorns,badges,created_at,last_active,checkpoints,
 voice_consent,consent_at,consent_by,token_expires_at from ojv.students;
create view public.ojv_teachers with (security_invoker=true) as select user_id,created_at from ojv.teachers;
create view public.ojv_word_progress with (security_invoker=true) as
 select student_id,word_id,correct,wrong,updated_at from ojv.word_progress;
create view public.ojv_activity with (security_invoker=true) as select * from ojv.activity;
create view public.ojv_vocabulary with (security_invoker=true) as
 select id,stage,topic,en,ko,example,translation from ojv.vocabulary;
create view public.ojv_word_aliases with (security_invoker=true) as select * from ojv.word_aliases;
create view public.ojv_login_limits with (security_invoker=true) as select * from ojv.login_limits;
create view public.ojv_result_receipts with (security_invoker=true) as select * from ojv.result_receipts;

-- 직접 테이블 접근은 차단하고 모든 앱 접근은 검증된 RPC를 통과한다.
alter table ojv.app_settings enable row level security;
alter table ojv.classes enable row level security;
alter table ojv.students enable row level security;
alter table ojv.teachers enable row level security;
alter table ojv.parent_links enable row level security;
alter table ojv.levels enable row level security;
alter table ojv.units enable row level security;
alter table ojv.vocabulary enable row level security;
alter table ojv.word_aliases enable row level security;
alter table ojv.sentences enable row level security;
alter table ojv.exercises enable row level security;
alter table ojv.assignments enable row level security;
alter table ojv.word_progress enable row level security;
alter table ojv.activity enable row level security;
alter table ojv.rewards enable row level security;
alter table ojv.login_limits enable row level security;
alter table ojv.result_receipts enable row level security;
alter table ojv.content_versions enable row level security;
alter table ojv.import_jobs enable row level security;
alter table ojv.audit_logs enable row level security;

revoke all on all tables in schema ojv from public, anon, authenticated;
revoke all on all sequences in schema ojv from public, anon, authenticated;
revoke all on public.ojv_app_settings,public.ojv_classes,public.ojv_students,public.ojv_teachers,
 public.ojv_word_progress,public.ojv_activity,public.ojv_vocabulary,public.ojv_word_aliases,
 public.ojv_login_limits,public.ojv_result_receipts from public,anon,authenticated;

-- 기존 RPC가 호환 뷰를 통해 새 스키마를 사용한다. OJV 함수만 명시적으로 잠근다.
revoke all on function public.ojv__student_ok(uuid,text),public.ojv__student_state(uuid),
 public.ojv__teacher_ok(text),public.ojv_list_classes(),public.ojv_student_enter(bigint,text,text),
 public.ojv_student_state(uuid,text),public.ojv_save_result(uuid,text,text,text,int,int,int,jsonb,text),
 public.ojv_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text),
 public.ojv_save_checkpoint(uuid,text,text,int,int,boolean),public.ojv_class_weekly_top(uuid,text),
 public.ojv_teacher_overview(text),public.ojv_teacher_add_class(text,text),
 public.ojv_teacher_rename_class(text,bigint,text),public.ojv_teacher_delete_class(text,bigint),
 public.ojv_teacher_add_student(text,bigint,text,text),public.ojv_teacher_reset_pin(text,uuid,text),
 public.ojv_teacher_move_student(text,uuid,bigint),public.ojv_teacher_delete_student(text,uuid),
 public.ojv_teacher_voice_consent(text,uuid,boolean),public.ojv_teacher_set_password(text,text)
 from public,anon,authenticated;
grant execute on function public.ojv_list_classes(),public.ojv_student_enter(bigint,text,text),
 public.ojv_student_state(uuid,text),public.ojv_save_result_v2(uuid,text,uuid,text,text,int,int,int,jsonb,text),
 public.ojv_save_checkpoint(uuid,text,text,int,int,boolean),public.ojv_class_weekly_top(uuid,text) to anon,authenticated;
grant execute on function public.ojv_teacher_overview(text),public.ojv_teacher_add_class(text,text),
 public.ojv_teacher_rename_class(text,bigint,text),public.ojv_teacher_delete_class(text,bigint),
 public.ojv_teacher_add_student(text,bigint,text,text),public.ojv_teacher_reset_pin(text,uuid,text),
 public.ojv_teacher_move_student(text,uuid,bigint),public.ojv_teacher_delete_student(text,uuid),
 public.ojv_teacher_voice_consent(text,uuid,boolean) to authenticated;

create or replace function public.ojv_teacher_set_assignment(p_pw text,p_class_id bigint,p_unit_id text,p_due_at timestamptz)
returns json language plpgsql security definer set search_path=public,ojv as $$
declare result json;
begin
 if not public.ojv__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 if not exists(select 1 from ojv.classes where id=p_class_id) then raise exception '반을 찾을 수 없어요';end if;
 if not exists(select 1 from ojv.units where id=p_unit_id and status='published') then raise exception '게시된 Unit을 찾을 수 없어요';end if;
 insert into ojv.assignments(class_id,unit_id,assigned_by,due_at) values(p_class_id,p_unit_id,auth.uid(),p_due_at)
 on conflict(class_id,unit_id) do update set assigned_by=excluded.assigned_by,due_at=excluded.due_at;
 insert into ojv.audit_logs(actor_id,action,entity_type,entity_id,details)
 values(auth.uid(),'upsert','assignment',p_class_id::text||':'||p_unit_id,jsonb_build_object('due_at',p_due_at));
 select json_build_object('class_id',class_id,'unit_id',unit_id,'due_at',due_at) into result
 from ojv.assignments where class_id=p_class_id and unit_id=p_unit_id;
 return result;
end $$;

create or replace function public.ojv_student_assignments(p_sid uuid,p_token text)
returns json language plpgsql security definer set search_path=public,ojv as $$
declare result json;
begin
 if not public.ojv__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 select coalesce(json_agg(json_build_object('unit_id',a.unit_id,'due_at',a.due_at,'title_en',u.title_en,'title_ko',u.title_ko)
 order by a.due_at nulls last,u.unit_no),'[]'::json) into result
 from ojv.assignments a join ojv.units u on u.id=a.unit_id
 where a.class_id=(select class_id from ojv.students where id=p_sid);
 return result;
end $$;

create or replace function public.ojv_parent_overview()
returns json language plpgsql security definer set search_path=public,ojv as $$
declare result json;
begin
 if auth.uid() is null then raise exception '보호자 계정으로 로그인해 주세요';end if;
 select coalesce(json_agg(x order by x.name),'[]'::json) into result from (
  select s.id,s.name,c.name as class_name,s.acorns,s.last_active,
   (select count(*) from ojv.word_progress p where p.student_id=s.id and p.correct>0) learned,
   (select count(*) from ojv.word_progress p where p.student_id=s.id and p.wrong>p.correct) weak_words,
   (select count(*) from ojv.activity a where a.student_id=s.id and a.created_at>=now()-interval '7 days') week_sessions
  from ojv.parent_links l join ojv.students s on s.id=l.student_id join ojv.classes c on c.id=s.class_id
  where l.user_id=auth.uid()
 ) x;
 return result;
end $$;

create or replace function public.ojv_admin_import_content(p_file_name text,p_payload jsonb,p_publish boolean default false)
returns json language plpgsql security definer set search_path=public,ojv as $$
declare row_data jsonb; errors jsonb:='[]'::jsonb; added integer:=0; changed integer:=0; archived integer:=0;
declare job_id uuid:=gen_random_uuid(); version_text text; totals jsonb;
begin
 if not public.ojv__teacher_ok('authenticated') then raise exception '관리자 계정으로 로그인해 주세요';end if;
 if not exists(select 1 from ojv.teachers where user_id=auth.uid() and role='admin') then raise exception '관리자 권한이 필요해요';end if;
 if jsonb_typeof(p_payload->'vocabulary')<>'array' then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','message','Vocabulary 시트가 필요해요'));end if;
 for row_data in select value from jsonb_array_elements(coalesce(p_payload->'vocabulary','[]'::jsonb)) loop
  if coalesce(row_data->>'content_key','')='' then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','row',row_data->>'row','message','content_key가 필요해요'));end if;
  if upper(coalesce(row_data->>'action','UPSERT'))<>'ARCHIVE' and not exists(select 1 from ojv.units where id=row_data->>'unit_code') then
   errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','row',row_data->>'row','message','unit_code를 찾을 수 없어요'));end if;
 end loop;
 if jsonb_array_length(errors)>0 then
  insert into ojv.import_jobs(id,file_name,status,summary,errors,created_by) values(job_id,left(p_file_name,200),'failed','{}',errors,auth.uid());
  return json_build_object('ok',false,'job_id',job_id,'errors',errors);
 end if;
 for row_data in select value from jsonb_array_elements(coalesce(p_payload->'vocabulary','[]'::jsonb)) loop
  if upper(coalesce(row_data->>'action','UPSERT'))='ARCHIVE' then
   update ojv.vocabulary set status='archived',updated_at=now() where content_key=row_data->>'content_key'; archived:=archived+1;
  else
   if exists(select 1 from ojv.vocabulary where content_key=row_data->>'content_key') then changed:=changed+1;else added:=added+1;end if;
   insert into ojv.vocabulary(id,content_key,stage,topic,en,ko,part_of_speech,difficulty,example,translation,image_path,audio_path,status)
   values(row_data->>'content_key',row_data->>'content_key',row_data->>'level',row_data->>'unit_code',row_data->>'word',row_data->>'meaning_ko',
    nullif(row_data->>'part_of_speech',''),coalesce(nullif(row_data->>'difficulty','')::smallint,1),row_data->>'example_en',row_data->>'example_ko',
    nullif(row_data->>'image_filename',''),nullif(row_data->>'audio_filename',''),case when p_publish then 'published' else coalesce(nullif(row_data->>'status',''),'draft') end)
   on conflict(content_key) do update set stage=excluded.stage,topic=excluded.topic,en=excluded.en,ko=excluded.ko,
    part_of_speech=excluded.part_of_speech,difficulty=excluded.difficulty,example=excluded.example,translation=excluded.translation,
    image_path=excluded.image_path,audio_path=excluded.audio_path,status=excluded.status,updated_at=now();
  end if;
 end loop;
 select jsonb_object_agg(stage,n) into totals from (select stage,count(*) n from ojv.vocabulary where status='published' group by stage) x;
 if p_publish and (coalesce((totals->>'sprout')::int,0)<>300 or coalesce((totals->>'stem')::int,0)<>400 or coalesce((totals->>'tree')::int,0)<>500) then
  raise exception '게시 콘텐츠는 Level별 300/400/500개여야 해요';
 end if;
 version_text:=to_char(clock_timestamp(),'YYYY.MM.DD.HH24MISS');
 insert into ojv.content_versions(version,status,snapshot,created_by,published_at)
 values(version_text,case when p_publish then 'published' else 'draft' end,
  jsonb_build_object('totals',totals,'added',added,'changed',changed,'archived',archived),auth.uid(),case when p_publish then now() end);
 insert into ojv.import_jobs(id,file_name,status,summary,created_by)
 values(job_id,left(p_file_name,200),case when p_publish then 'published' else 'validated' end,
  jsonb_build_object('version',version_text,'added',added,'changed',changed,'archived',archived,'totals',totals),auth.uid());
 insert into ojv.audit_logs(actor_id,action,entity_type,entity_id,details)
 values(auth.uid(),case when p_publish then 'publish' else 'validate' end,'content_import',job_id::text,
  jsonb_build_object('file_name',left(p_file_name,200),'version',version_text));
 return json_build_object('ok',true,'job_id',job_id,'version',version_text,'added',added,'changed',changed,'archived',archived,'totals',totals);
end $$;

revoke all on function public.ojv_teacher_set_assignment(text,bigint,text,timestamptz),
 public.ojv_student_assignments(uuid,text),public.ojv_parent_overview(),
 public.ojv_admin_import_content(text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.ojv_student_assignments(uuid,text) to anon,authenticated;
grant execute on function public.ojv_teacher_set_assignment(text,bigint,text,timestamptz),
 public.ojv_parent_overview(),public.ojv_admin_import_content(text,jsonb,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('ojv-images','ojv-images',false,5242880,array['image/png','image/jpeg','image/webp']),
 ('ojv-audio','ojv-audio',false,10485760,array['audio/mpeg','audio/wav','audio/ogg']),
 ('ojv-imports','ojv-imports',false,10485760,array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists ojv_admin_storage_select on storage.objects;
drop policy if exists ojv_admin_storage_insert on storage.objects;
drop policy if exists ojv_admin_storage_update on storage.objects;
drop policy if exists ojv_admin_storage_delete on storage.objects;
create policy ojv_admin_storage_select on storage.objects for select to authenticated
 using (bucket_id in ('ojv-images','ojv-audio','ojv-imports') and exists(select 1 from ojv.teachers t where t.user_id=auth.uid() and t.role='admin'));
create policy ojv_admin_storage_insert on storage.objects for insert to authenticated
 with check (bucket_id in ('ojv-images','ojv-audio','ojv-imports') and exists(select 1 from ojv.teachers t where t.user_id=auth.uid() and t.role='admin'));
create policy ojv_admin_storage_update on storage.objects for update to authenticated
 using (bucket_id in ('ojv-images','ojv-audio','ojv-imports') and exists(select 1 from ojv.teachers t where t.user_id=auth.uid() and t.role='admin'))
 with check (bucket_id in ('ojv-images','ojv-audio','ojv-imports') and exists(select 1 from ojv.teachers t where t.user_id=auth.uid() and t.role='admin'));
create policy ojv_admin_storage_delete on storage.objects for delete to authenticated
 using (bucket_id in ('ojv-images','ojv-audio','ojv-imports') and exists(select 1 from ojv.teachers t where t.user_id=auth.uid() and t.role='admin'));

insert into ojv.content_versions(version,status,snapshot,published_at)
values('2026.11.07.1','published',jsonb_build_object('source','schema-isolation'),now())
on conflict (version) do nothing;
