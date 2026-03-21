# Vercel 배포에서 Supabase(DB) 저장 체크리스트

## 1. 환경 변수 (프로젝트 단위)

**Team Settings → Environment Variables** 가 아니라,  
**해당 프로젝트 → Settings → Environment Variables** 에 아래 2개를 넣습니다.

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 같은 화면의 **anon public** 키 |

- **Production** (그리고 Preview도 쓰면 Preview) 에 모두 적용되게 선택합니다.
- 저장 후 반드시 **Redeploy** 해야 빌드에 반영됩니다. (`NEXT_PUBLIC_*` 는 빌드 시 번들에 박힙니다.)

## 2. Supabase Auth

- Email provider 활성화
- 테스트 단계에서는 **Confirm sign up OFF** 권장 (가입 직후 세션이 없으면 `profiles` upsert가 RLS로 막힐 수 있음)
- **Site URL**: 배포 도메인 (예: `https://xxx.vercel.app`)
- **Redirect URLs**: 로컬 + 배포 둘 다 허용  
  - `http://localhost:3000`  
  - `https://xxx.vercel.app`

## 3. DB 스키마

Supabase **SQL Editor** 에서 저장소의 `supabase-schema.sql` 전체 실행 (테이블 + RLS).

## 4. 동작 확인

1. 배포 URL에서 `/signup` → 가입 후 Supabase **Table Editor → `profiles`** 에 row 확인  
2. `/simulation` 제출 후 **`simulation_step_results`** / **`simulation_final_results`** 확인  

가입/저장이 실패하면 화면에 **구체적인 오류 문구**가 표시되도록 되어 있습니다. 그 메시지를 그대로 복사하면 원인(환경변수·RLS·정책)을 빠르게 좁힐 수 있습니다.
