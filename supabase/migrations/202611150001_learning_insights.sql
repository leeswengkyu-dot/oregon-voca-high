-- 맞춤 복습, 보호자 30일 현황, 교사용 학생 상세 분석
-- 기존 학생/진도 행은 변경하지 않고 검증된 RPC 응답만 확장한다.

create or replace function public.ovh_student_insights(p_sid uuid,p_token text)
returns json language plpgsql security definer set search_path=public,ovh as $$
declare result json;
begin
 if not public.ovh__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
 select json_build_object(
  'sessions_7d',(select count(*) from ovh.activity where student_id=p_sid and created_at>=now()-interval '7 days'),
  'sessions_30d',(select count(*) from ovh.activity where student_id=p_sid and created_at>=now()-interval '30 days'),
  'mastery',json_build_object(
   'new',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='new'),
   'learning',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='learning'),
   'solid',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='solid'),
   'mastered',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='mastered')
  ),
  'review_words',coalesce((select json_agg(x) from (
    select word_id,correct,wrong,mastery_state,next_review_at
    from ovh.word_progress where student_id=p_sid and (wrong>0 or mastery_state='learning')
    order by (wrong*5-correct) desc,next_review_at nulls first limit 30
  ) x),'[]'::json),
  'recent_activity',coalesce((select json_agg(x) from (
    select kind,topic,score,total,acorns,created_at from ovh.activity
    where student_id=p_sid order by created_at desc limit 12
  ) x),'[]'::json)
 ) into result;
 return result;
end $$;

create or replace function public.ovh_teacher_student_detail(p_pw text,p_sid uuid)
returns json language plpgsql security definer set search_path=public,ovh as $$
declare result json;
begin
 if not public.ovh__teacher_ok(p_pw) then raise exception '선생님 계정으로 로그인해 주세요';end if;
 if not exists(select 1 from ovh.students where id=p_sid) then raise exception '학생을 찾을 수 없어요';end if;
 select json_build_object(
  'student_id',p_sid,
  'sessions_7d',(select count(*) from ovh.activity where student_id=p_sid and created_at>=now()-interval '7 days'),
  'sessions_30d',(select count(*) from ovh.activity where student_id=p_sid and created_at>=now()-interval '30 days'),
  'mastery',json_build_object(
   'new',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='new'),
   'learning',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='learning'),
   'solid',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='solid'),
   'mastered',(select count(*) from ovh.word_progress where student_id=p_sid and mastery_state='mastered')
  ),
  'weak_words',coalesce((select json_agg(x) from (
    select word_id,correct,wrong,mastery_state,next_review_at
    from ovh.word_progress where student_id=p_sid and wrong>0
    order by wrong desc,correct asc limit 20
  ) x),'[]'::json),
  'recent_activity',coalesce((select json_agg(x) from (
    select kind,topic,score,total,acorns,created_at from ovh.activity
    where student_id=p_sid order by created_at desc limit 15
  ) x),'[]'::json)
 ) into result;
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
   (select count(*) from ovh.activity a where a.student_id=s.id and a.created_at>=now()-interval '7 days') week_sessions,
   (select count(*) from ovh.activity a where a.student_id=s.id and a.created_at>=now()-interval '30 days') month_sessions,
   (select json_build_object(
     'learning',count(*) filter(where p.mastery_state='learning'),
     'solid',count(*) filter(where p.mastery_state='solid'),
     'mastered',count(*) filter(where p.mastery_state='mastered'))
    from ovh.word_progress p where p.student_id=s.id) mastery,
   coalesce((select json_agg(w) from (
     select p.word_id,p.correct,p.wrong,p.mastery_state from ovh.word_progress p
     where p.student_id=s.id and p.wrong>0 order by p.wrong desc,p.correct asc limit 12
   ) w),'[]'::json) weak_word_details
  from ovh.parent_links l join ovh.students s on s.id=l.student_id join ovh.classes c on c.id=s.class_id
  where l.user_id=auth.uid()
 ) x;
 return result;
end $$;

revoke all on function public.ovh_student_insights(uuid,text),
 public.ovh_teacher_student_detail(text,uuid),public.ovh_parent_overview()
 from public,anon,authenticated;
grant execute on function public.ovh_student_insights(uuid,text) to anon,authenticated;
grant execute on function public.ovh_teacher_student_detail(text,uuid),public.ovh_parent_overview() to authenticated;
