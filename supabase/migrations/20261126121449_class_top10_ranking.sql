begin;

create or replace function public.ovh_class_top10(p_sid uuid, p_token text)
returns table(rank_no bigint, name text, acorns bigint, is_me boolean)
language plpgsql
security definer
set search_path = public, ovh
as $$
begin
  if not public.ovh__student_ok(p_sid, p_token) then
    raise exception '다시 로그인해 주세요';
  end if;

  return query
  select ranked.rank_no, ranked.name, ranked.acorns, ranked.student_id = p_sid
  from (
    select
      s.id as student_id,
      s.name,
      s.acorns::bigint as acorns,
      row_number() over (order by s.acorns desc, s.name, s.id) as rank_no
    from ovh.students s
    where s.class_id = (select me.class_id from ovh.students me where me.id = p_sid)
  ) ranked
  where ranked.rank_no <= 10
  order by ranked.rank_no;
end
$$;

revoke all on function public.ovh_class_top10(uuid, text) from public, anon, authenticated;
grant execute on function public.ovh_class_top10(uuid, text) to anon, authenticated;

commit;
