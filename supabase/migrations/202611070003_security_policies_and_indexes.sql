begin;

-- RPC 전용 설계임을 명시한다. 직접 Data API 테이블 접근은 모든 역할에서 거부된다.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname='ovh' loop
    execute format('drop policy if exists ovh_rpc_only on ovh.%I',r.tablename);
    execute format('create policy ovh_rpc_only on ovh.%I as restrictive for all to public using (false) with check (false)',r.tablename);
  end loop;
  for r in select tablename from pg_tables where schemaname='public' and tablename like 'ovh\_%\_legacy' escape '\' loop
    execute format('drop policy if exists ovh_legacy_read_only on public.%I',r.tablename);
    execute format('create policy ovh_legacy_read_only on public.%I as restrictive for all to public using (false) with check (false)',r.tablename);
  end loop;
end $$;

create index if not exists ovh_assignments_assigned_by on ovh.assignments(assigned_by);
create index if not exists ovh_assignments_unit on ovh.assignments(unit_id);
create index if not exists ovh_audit_actor on ovh.audit_logs(actor_id);
create index if not exists ovh_versions_creator on ovh.content_versions(created_by);
create index if not exists ovh_exercises_unit on ovh.exercises(unit_id);
create index if not exists ovh_import_creator on ovh.import_jobs(created_by);
create index if not exists ovh_parent_student on ovh.parent_links(student_id);
create index if not exists ovh_parent_inviter on ovh.parent_links(invited_by);
create index if not exists ovh_sentences_unit on ovh.sentences(unit_id);
create index if not exists ovh_students_consent_by on ovh.students(consent_by);
create index if not exists ovh_vocabulary_stage on ovh.vocabulary(stage);
create index if not exists ovh_vocabulary_topic on ovh.vocabulary(topic);
create index if not exists ovh_alias_word on ovh.word_aliases(word_id);

-- 학생 개인 공개 순위 대신 반 전체 도토리 합계만 반환한다.
create or replace function public.ovh_class_weekly_top(p_sid uuid,p_token text)
returns table(name text,acorns bigint) language plpgsql security definer set search_path=public,ovh as $$
begin
  if not public.ovh__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
  return query select null::text,coalesce(sum(a.acorns),0)::bigint
  from ovh.activity a join ovh.students s on s.id=a.student_id
  where s.class_id=(select class_id from ovh.students where id=p_sid)
    and a.created_at>=date_trunc('week',now());
end $$;
revoke all on function public.ovh_class_weekly_top(uuid,text) from public,anon,authenticated;
grant execute on function public.ovh_class_weekly_top(uuid,text) to anon,authenticated;

commit;
