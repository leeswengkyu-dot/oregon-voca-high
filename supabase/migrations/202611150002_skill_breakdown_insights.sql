-- 기존 ovh.activity 기록을 읽기 전용으로 집계해 교사용 유형별 분석에 추가한다.
-- 학생, 진도, 활동 원본 행은 변경하지 않는다.

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
  'skill_breakdown',coalesce((select json_agg(x order by x.kind) from (
    select kind,sum(score)::int score,sum(total)::int total,count(*)::int sessions
    from ovh.activity where student_id=p_sid and
      (kind='sentence_context' or left(kind,4)='lab_' or left(kind,5)='csat_')
    group by kind
  ) x),'[]'::json),
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

revoke all on function public.ovh_teacher_student_detail(text,uuid) from public,anon,authenticated;
grant execute on function public.ovh_teacher_student_detail(text,uuid) to authenticated;
