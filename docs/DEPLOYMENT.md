# GitHub · Supabase · Vercel 배포

## 배포 순서

1. 아래 SQL을 Supabase에 적용합니다.
2. Supabase Auth에 선생님을 등록하고 관리자 권한을 연결합니다.
3. GitHub 변경 브랜치에서 CI를 확인한 뒤 main에 병합합니다.
4. Vercel에 GitHub 저장소를 연결하고 공개 환경변수를 설정해 배포합니다.
5. 학생 로그인, 학습, 다른 기기에서 이어하기와 관리자 권한을 실제 URL에서 확인합니다.

프로젝트나 계정의 API 비밀 키를 채팅·GitHub·소스에 넣지 마세요. Supabase/Vercel 연결이 없으면 해당 계정의 실제 리소스 생성과 배포를 대신 완료할 수 없습니다.

## Supabase: 현재 운영 프로젝트

대상은 반드시 `kaaa-experience` 프로젝트 ID `htcsoamctexvwpmgfeqg`입니다. 다른 Supabase 프로젝트에는 적용하지 않습니다. 아래 순서를 고정합니다.

1. `supabase/migrations/202611060001_level_curriculum.sql`
2. `supabase/migrations/202611070001_ojv_schema_isolation.sql`
3. `supabase/migrations/202611070002_preserve_progress_timestamps.sql`
4. `supabase/migrations/202611070003_security_policies_and_indexes.sql`
5. `supabase/seed-curriculum.sql`

CLI를 사용할 때도 `--project-ref htcsoamctexvwpmgfeqg` 또는 해당 프로젝트 link 상태를 확인하고 정확히 고정된 migration 파일만 적용합니다. `schema.sql` 전체를 기존 프로젝트에 다시 실행하지 않습니다.

마이그레이션은 `public.visits`, `public.resolves`, `public.graduates`를 변경하지 않습니다. 기존 `public.ojv_*` 표는 `_legacy`로 보관하고 새 `ojv` 스키마로 복사합니다. 반·학생·진도·활동 행 수와 공통 열 체크섬이 일치한 뒤 배포합니다.

## 선생님 계정 등록

Supabase Dashboard → Authentication → Users에서 선생님 이메일 계정을 생성합니다. 공개 회원가입 기능은 앱에 없으며, Auth의 불필요한 공개 가입은 끄는 것을 권장합니다.

SQL Editor에서 실제 선생님 이메일로 바꿔 아래 쿼리를 실행합니다. 비밀번호는 SQL에 적지 않습니다.

```sql
insert into ojv.teachers(user_id,role)
select id,'admin' from auth.users where email = 'teacher@example.com'
on conflict(user_id) do nothing;
```

앱의 선생님 화면에서 이 이메일과 Supabase Auth 비밀번호로 로그인합니다. `ojv.teachers`에 등록되지 않은 사용자는 로그인 토큰을 가져도 VOCA 함수를 실행할 수 없습니다. 일반 교사는 `role='teacher'`, Excel 게시 관리자는 `role='admin'`을 사용합니다.

## Vercel

- GitHub 저장소: `leeswengkyu-dot/oregon-voca-junior`
- Framework: Vite
- Root Directory: 저장소 루트
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Node: 22 이상

다음 두 값을 Vercel의 Production·Preview 환경변수에 설정합니다.

| 변수 | 값 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 HTTPS URL |
| `VITE_SUPABASE_ANON_KEY` | 공개 publishable 키 또는 anon 키 |

**service_role 키와 secret 키를 사용하지 않습니다.** VITE_ 변수는 브라우저 번들에 포함되며, 접근 제어는 RLS와 RPC 권한으로 처리합니다. 배포 후 공개 URL과 로그인 화면에서 온라인 모드임을 확인하세요. `vercel.json`에 빌드 및 캐시·기본 보안 헤더를 선언했습니다.

배포 설정은 앱을 누구에게 공개할지에 대한 사용자·학원 정책에 맞게 선택하세요. 기존 배포가 있으면 임의로 접근 대상을 바꾸지 않습니다.

## 데이터 확인

SQL Editor에서 아래 결과가 일치해야 합니다.

```sql
select stage, count(*) from ojv.vocabulary group by stage;
-- sprout: 300 / stem: 400 / tree: 500
```

실제 URL에서 다음 흐름을 확인합니다.

- Level 1·2·3에서 각각 15·20·25개 마을과 300·400·500개 목표 표시.
- 다섯 단어 카드 중간에 나갔다가 같은 계정으로 다른 기기에서 이어하기.
- 각 레벨의 10·12·15문항 퀴즈, 80% 통과 기준과 배지.
- 기존 `school:teacher` 기록이 Level 1 가족 단어 진도에 반영되며 중복 집계되지 않음.
- 선생님 Auth 권한, 학생 PIN 초기화와 음성 동의 관리.
- 음성 동의가 없는 학생은 마이크 사용 불가, 듣기와 다른 게임은 가능.

## 출시 전 콘텐츠 확인

학년과 레벨은 권장 학습 구분이며, 학교별 진도나 학생 실력에 따라 조정할 수 있습니다. 새로 작성한 900개 어휘의 예문과 번역, 기존 Level 1 콘텐츠, 문맥 퀴즈 보기의 적합성을 담당 교사가 검수하세요. 사용성 검증은 실제 학생·보호자 동의를 갖춘 환경에서 진행합니다.
