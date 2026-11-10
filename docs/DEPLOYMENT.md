# GitHub · Supabase · Vercel 배포

## 배포 순서

1. `npm test`와 `npm run build`를 통과시킵니다.
2. 새 GitHub 저장소 `leeswengkyu-dot/oregon-voca-high`에 푸시합니다.
3. 기존 Supabase 프로젝트 `kaaa-experience` (`htcsoamctexvwpmgfeqg`)에 `ovh` 스키마를 추가합니다.
4. 새 Vercel 프로젝트 `oregon-voca-high`를 GitHub 저장소에 연결합니다.
5. 실제 URL에서 학생·선생님 주요 흐름을 확인합니다.

비밀 키를 채팅, GitHub 또는 브라우저 환경변수에 넣지 않습니다.

## Supabase

기존 프로젝트의 다른 앱 테이블을 수정하지 않고 `ovh` 스키마와 `public.ovh_*` 호환 RPC만 추가합니다. 적용 순서는 다음과 같습니다.

1. `supabase/schema.sql` (새 설치에서만)
2. `supabase/migrations/202611070001_ovh_schema_isolation.sql`
3. `supabase/migrations/202611070002_preserve_progress_timestamps.sql`
4. `supabase/migrations/202611070003_security_policies_and_indexes.sql`
5. `supabase/migrations/202611070004_content_rollback.sql`
6. `supabase/seed-curriculum.sql`

기존 프로젝트에 이미 `public.ovh_*`가 있다면 전체 `schema.sql`을 재실행하지 말고 현재 상태를 먼저 백업·검증한 뒤 마이그레이션만 적용합니다.

적용 후 콘텐츠 수를 확인합니다.

```sql
select stage, count(*) from ovh.vocabulary group by stage order by stage;
-- prep 200 / grade1 300 / grade2 300 / grade3 300
```

Supabase Auth에서 선생님 사용자를 만든 뒤 역할을 연결합니다.

```sql
insert into ovh.teachers(user_id, role)
select id, 'admin' from auth.users where email = 'teacher@example.com'
on conflict (user_id) do update set role = excluded.role;
```

## Vercel

- GitHub 저장소: `leeswengkyu-dot/oregon-voca-high`
- Framework: Vite
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Node.js: 22 이상

Production과 Preview에 다음 공개 값만 설정합니다.

| 변수 | 값 |
|---|---|
| `VITE_SUPABASE_URL` | 대상 Supabase 프로젝트 HTTPS URL |
| `VITE_SUPABASE_ANON_KEY` | publishable key 또는 anon key |

`service_role`과 secret 키는 절대 사용하지 않습니다. 접근 제어는 RLS와 보안 RPC가 담당합니다.

## 출시 전 확인

- 예비고1 10개 단원·200단어, 고1/2/3 각 15개 단원·300단어 표시
- 5단어 카드 중간 저장과 다른 기기 이어하기
- 문맥 퀴즈, 철자, 짝 맞추기, 문장 블록
- 동일 철자의 학년별 진도 분리
- 학생 PIN 초기화, 반 이동, 과제, 음성 동의
- 모바일 360px와 데스크톱 화면
- 예문·번역의 교사 검수 완료 여부
