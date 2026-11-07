begin;

create or replace function ojv.content_snapshot()
returns jsonb language sql security definer set search_path=ojv,public as $$
 select jsonb_build_object(
  'vocabulary',coalesce((select jsonb_agg(to_jsonb(v) order by content_key) from ojv.vocabulary v),'[]'::jsonb),
  'sentences',coalesce((select jsonb_agg(to_jsonb(s) order by content_key) from ojv.sentences s),'[]'::jsonb),
  'exercises',coalesce((select jsonb_agg(to_jsonb(e) order by content_key) from ojv.exercises e),'[]'::jsonb)
 )
$$;
revoke all on function ojv.content_snapshot() from public,anon,authenticated;

update ojv.content_versions set snapshot=ojv.content_snapshot()
where version='2026.11.07.1' and not (snapshot ? 'vocabulary');

create or replace function public.ojv_admin_import_content(p_file_name text,p_payload jsonb,p_publish boolean default false)
returns json language plpgsql security definer set search_path=public,ojv as $$
declare r jsonb; errors jsonb:='[]'::jsonb; added integer:=0; changed integer:=0; archived integer:=0;
declare job_id uuid:=gen_random_uuid(); version_text text; totals jsonb; final_status text:=case when p_publish then 'published' else 'draft' end;
begin
 if auth.uid() is null or not exists(select 1 from ojv.teachers where user_id=auth.uid() and role='admin') then raise exception '관리자 권한이 필요해요';end if;
 if jsonb_typeof(p_payload->'vocabulary')<>'array' then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','message','Vocabulary 시트가 필요해요'));end if;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'vocabulary','[]'::jsonb)) loop
  if coalesce(r->>'content_key','')='' then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','row',r->>'row','message','content_key가 필요해요'));end if;
  if upper(coalesce(r->>'action','UPSERT'))<>'ARCHIVE' and not exists(select 1 from ojv.units where id=r->>'unit_code') then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Vocabulary','row',r->>'row','message','unit_code를 찾을 수 없어요'));end if;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'sentences','[]'::jsonb)) loop
  if coalesce(r->>'content_key','')='' or (upper(coalesce(r->>'action','UPSERT'))<>'ARCHIVE' and (coalesce(r->>'sentence_en','')='' or coalesce(r->>'sentence_ko','')='')) then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Sentences','row',r->>'row','message','content_key와 영문·한글 문장이 필요해요'));end if;
  if upper(coalesce(r->>'action','UPSERT'))<>'ARCHIVE' and not exists(select 1 from ojv.units where id=r->>'unit_code') then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Sentences','row',r->>'row','message','unit_code를 찾을 수 없어요'));end if;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'exercises','[]'::jsonb)) loop
  if coalesce(r->>'content_key','')='' or (upper(coalesce(r->>'action','UPSERT'))<>'ARCHIVE' and (coalesce(r->>'prompt','')='' or coalesce(r->>'answer','')='')) then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Exercises','row',r->>'row','message','content_key와 문제·정답이 필요해요'));end if;
  if upper(coalesce(r->>'action','UPSERT'))<>'ARCHIVE' and not exists(select 1 from ojv.units where id=r->>'unit_code') then errors:=errors||jsonb_build_array(jsonb_build_object('sheet','Exercises','row',r->>'row','message','unit_code를 찾을 수 없어요'));end if;
 end loop;
 if jsonb_array_length(errors)>0 then
  insert into ojv.import_jobs(id,file_name,status,summary,errors,created_by) values(job_id,left(p_file_name,200),'failed','{}',errors,auth.uid());
  return json_build_object('ok',false,'job_id',job_id,'errors',errors);
 end if;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'vocabulary','[]'::jsonb)) loop
  if upper(coalesce(r->>'action','UPSERT'))='ARCHIVE' then update ojv.vocabulary set status='archived',updated_at=now() where content_key=r->>'content_key'; archived:=archived+1;
  else
   if exists(select 1 from ojv.vocabulary where content_key=r->>'content_key') then changed:=changed+1;else added:=added+1;end if;
   insert into ojv.vocabulary(id,content_key,stage,topic,en,ko,part_of_speech,difficulty,example,translation,image_path,audio_path,status)
   values(r->>'content_key',r->>'content_key',r->>'level',r->>'unit_code',r->>'word',r->>'meaning_ko',nullif(r->>'part_of_speech',''),coalesce(nullif(r->>'difficulty','')::smallint,1),r->>'example_en',r->>'example_ko',nullif(r->>'image_filename',''),nullif(r->>'audio_filename',''),final_status)
   on conflict(content_key) do update set stage=excluded.stage,topic=excluded.topic,en=excluded.en,ko=excluded.ko,part_of_speech=excluded.part_of_speech,difficulty=excluded.difficulty,example=excluded.example,translation=excluded.translation,image_path=excluded.image_path,audio_path=excluded.audio_path,status=excluded.status,updated_at=now();
  end if;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'sentences','[]'::jsonb)) loop
  if upper(coalesce(r->>'action','UPSERT'))='ARCHIVE' then update ojv.sentences set status='archived' where content_key=r->>'content_key'; archived:=archived+1;
  else insert into ojv.sentences(content_key,unit_id,sentence_en,sentence_ko,status) values(r->>'content_key',r->>'unit_code',r->>'sentence_en',r->>'sentence_ko',final_status)
   on conflict(content_key) do update set unit_id=excluded.unit_id,sentence_en=excluded.sentence_en,sentence_ko=excluded.sentence_ko,status=excluded.status;
  end if;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'exercises','[]'::jsonb)) loop
  if upper(coalesce(r->>'action','UPSERT'))='ARCHIVE' then update ojv.exercises set status='archived' where content_key=r->>'content_key'; archived:=archived+1;
  else insert into ojv.exercises(content_key,unit_id,exercise_type,prompt,choices,answer,explanation,status)
   values(r->>'content_key',r->>'unit_code',case r->>'type' when 'multiple_choice' then 'choice' else r->>'type' end,r->>'prompt',to_jsonb(string_to_array(coalesce(r->>'choices',''),'|')),r->>'answer',r->>'explanation_ko',final_status)
   on conflict(content_key) do update set unit_id=excluded.unit_id,exercise_type=excluded.exercise_type,prompt=excluded.prompt,choices=excluded.choices,answer=excluded.answer,explanation=excluded.explanation,status=excluded.status;
  end if;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(p_payload->'assets','[]'::jsonb)) loop
  if upper(coalesce(r->>'action','UPSERT'))='UPSERT' and (coalesce(r->>'filename','')='' or not exists(select 1 from ojv.vocabulary where content_key=r->>'linked_content_key')) then raise exception 'Assets 시트의 파일명 또는 연결 content_key를 확인해 주세요';end if;
 end loop;
 select jsonb_object_agg(stage,n) into totals from (select stage,count(*) n from ojv.vocabulary where status='published' group by stage) x;
 if p_publish and (coalesce((totals->>'sprout')::int,0)<>300 or coalesce((totals->>'stem')::int,0)<>400 or coalesce((totals->>'tree')::int,0)<>500) then raise exception '게시 콘텐츠는 Level별 300/400/500개여야 해요';end if;
 version_text:=to_char(clock_timestamp(),'YYYY.MM.DD.HH24MISS');
 insert into ojv.content_versions(version,status,snapshot,created_by,published_at) values(version_text,case when p_publish then 'published' else 'draft' end,ojv.content_snapshot(),auth.uid(),case when p_publish then now() end);
 insert into ojv.import_jobs(id,file_name,status,summary,created_by) values(job_id,left(p_file_name,200),case when p_publish then 'published' else 'validated' end,jsonb_build_object('version',version_text,'added',added,'changed',changed,'archived',archived,'totals',totals),auth.uid());
 insert into ojv.audit_logs(actor_id,action,entity_type,entity_id,details) values(auth.uid(),case when p_publish then 'publish' else 'validate' end,'content_import',job_id::text,jsonb_build_object('file_name',left(p_file_name,200),'version',version_text));
 return json_build_object('ok',true,'job_id',job_id,'version',version_text,'added',added,'changed',changed,'archived',archived,'totals',totals);
end $$;

create or replace function public.ojv_admin_content_versions()
returns json language sql security definer set search_path=public,ojv as $$
 select case when exists(select 1 from ojv.teachers where user_id=auth.uid() and role='admin') then
  coalesce((select json_agg(json_build_object('version',version,'status',status,'created_at',created_at,'published_at',published_at) order by created_at desc) from ojv.content_versions),'[]'::json)
 else '[]'::json end
$$;

create or replace function public.ojv_admin_rollback_content(p_version text)
returns json language plpgsql security definer set search_path=public,ojv as $$
declare snap jsonb; r jsonb; new_version text;
begin
 if not exists(select 1 from ojv.teachers where user_id=auth.uid() and role='admin') then raise exception '관리자 권한이 필요해요';end if;
 select snapshot into snap from ojv.content_versions where version=p_version;
 if snap is null or not (snap ? 'vocabulary') then raise exception '복원 가능한 버전을 찾을 수 없어요';end if;
 update ojv.vocabulary set status='archived',updated_at=now(); update ojv.sentences set status='archived'; update ojv.exercises set status='archived';
 for r in select value from jsonb_array_elements(snap->'vocabulary') loop
  insert into ojv.vocabulary(id,content_key,stage,topic,en,ko,part_of_speech,difficulty,example,translation,image_path,audio_path,status)
  values(r->>'id',r->>'content_key',r->>'stage',r->>'topic',r->>'en',r->>'ko',r->>'part_of_speech',coalesce((r->>'difficulty')::smallint,1),r->>'example',r->>'translation',r->>'image_path',r->>'audio_path',r->>'status')
  on conflict(content_key) do update set stage=excluded.stage,topic=excluded.topic,en=excluded.en,ko=excluded.ko,part_of_speech=excluded.part_of_speech,difficulty=excluded.difficulty,example=excluded.example,translation=excluded.translation,image_path=excluded.image_path,audio_path=excluded.audio_path,status=excluded.status,updated_at=now();
 end loop;
 for r in select value from jsonb_array_elements(snap->'sentences') loop
  insert into ojv.sentences(id,content_key,unit_id,pattern_no,sentence_en,sentence_ko,status) values((r->>'id')::uuid,r->>'content_key',r->>'unit_id',(r->>'pattern_no')::smallint,r->>'sentence_en',r->>'sentence_ko',r->>'status') on conflict(content_key) do update set unit_id=excluded.unit_id,pattern_no=excluded.pattern_no,sentence_en=excluded.sentence_en,sentence_ko=excluded.sentence_ko,status=excluded.status;
 end loop;
 for r in select value from jsonb_array_elements(snap->'exercises') loop
  insert into ojv.exercises(id,content_key,unit_id,exercise_type,prompt,choices,answer,explanation,status) values((r->>'id')::uuid,r->>'content_key',r->>'unit_id',r->>'exercise_type',r->>'prompt',r->'choices',r->>'answer',r->>'explanation',r->>'status') on conflict(content_key) do update set unit_id=excluded.unit_id,exercise_type=excluded.exercise_type,prompt=excluded.prompt,choices=excluded.choices,answer=excluded.answer,explanation=excluded.explanation,status=excluded.status;
 end loop;
 update ojv.content_versions set status='rolled_back' where status='published';
 new_version:=to_char(clock_timestamp(),'YYYY.MM.DD.HH24MISS')||'-rollback';
 insert into ojv.content_versions(version,status,snapshot,created_by,published_at) values(new_version,'published',ojv.content_snapshot(),auth.uid(),now());
 insert into ojv.audit_logs(actor_id,action,entity_type,entity_id,details) values(auth.uid(),'rollback','content_version',p_version,jsonb_build_object('new_version',new_version));
 return json_build_object('ok',true,'version',new_version,'restored_from',p_version);
end $$;

revoke all on function public.ojv_admin_import_content(text,jsonb,boolean),public.ojv_admin_content_versions(),public.ojv_admin_rollback_content(text) from public,anon,authenticated;
grant execute on function public.ojv_admin_import_content(text,jsonb,boolean),public.ojv_admin_content_versions(),public.ojv_admin_rollback_content(text) to authenticated;

commit;
