begin;

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

alter table ovh.word_progress disable trigger ovh_refresh_mastery;
update ovh.word_progress p set updated_at=l.updated_at
from public.ovh_word_progress_legacy l
where l.student_id=p.student_id and l.word_id=p.word_id;
alter table ovh.word_progress enable trigger ovh_refresh_mastery;

commit;
