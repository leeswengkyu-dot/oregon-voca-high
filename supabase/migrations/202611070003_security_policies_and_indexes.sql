begin;

-- RPC 전용 설계임을 명시한다. 직접 Data API 테이블 접근은 모든 역할에서 거부된다.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname='ojv' loop
    execute format('drop policy if exists ojv_rpc_only on ojv.%I',r.tablename);
    execute format('create policy ojv_rpc_only on ojv.%I as restrictive for all to public using (false) with check (false)',r.tablename);
  end loop;
  for r in select tablename from pg_tables where schemaname='public' and tablename like 'ojv\_%\_legacy' escape '\' loop
    execute format('drop policy if exists ojv_legacy_read_only on public.%I',r.tablename);
    execute format('create policy ojv_legacy_read_only on public.%I as restrictive for all to public using (false) with check (false)',r.tablename);
  end loop;
end $$;

create index if not exists ojv_assignments_assigned_by on ojv.assignments(assigned_by);
create index if not exists ojv_assignments_unit on ojv.assignments(unit_id);
create index if not exists ojv_audit_actor on ojv.audit_logs(actor_id);
create index if not exists ojv_versions_creator on ojv.content_versions(created_by);
create index if not exists ojv_exercises_unit on ojv.exercises(unit_id);
create index if not exists ojv_import_creator on ojv.import_jobs(created_by);
create index if not exists ojv_parent_student on ojv.parent_links(student_id);
create index if not exists ojv_parent_inviter on ojv.parent_links(invited_by);
create index if not exists ojv_sentences_unit on ojv.sentences(unit_id);
create index if not exists ojv_students_consent_by on ojv.students(consent_by);
create index if not exists ojv_vocabulary_stage on ojv.vocabulary(stage);
create index if not exists ojv_vocabulary_topic on ojv.vocabulary(topic);
create index if not exists ojv_alias_word on ojv.word_aliases(word_id);

-- 학생 개인 공개 순위 대신 반 전체 도토리 합계만 반환한다.
create or replace function public.ojv_class_weekly_top(p_sid uuid,p_token text)
returns table(name text,acorns bigint) language plpgsql security definer set search_path=public,ojv as $$
begin
  if not public.ojv__student_ok(p_sid,p_token) then raise exception '다시 로그인해 주세요';end if;
  return query select null::text,coalesce(sum(a.acorns),0)::bigint
  from ojv.activity a join ojv.students s on s.id=a.student_id
  where s.class_id=(select class_id from ojv.students where id=p_sid)
    and a.created_at>=date_trunc('week',now());
end $$;
revoke all on function public.ojv_class_weekly_top(uuid,text) from public,anon,authenticated;
grant execute on function public.ojv_class_weekly_top(uuid,text) to anon,authenticated;

commit;
