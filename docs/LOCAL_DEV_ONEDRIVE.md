# OneDrive(바탕 화면)에서 로컬 개발이 안 될 때

## 증상

- `scandir ...\.next\...` → `UNKNOWN` / `-4094`
- `react/jsx-runtime` / `next-server` 모듈을 못 찾음 (예전에 빌드 출력을 프로젝트 밖에 둔 경우)

## 이 프로젝트 설정

- 빌드 출력 폴더: **`next-cache/`** (프로젝트 안, `.next` 대신 OneDrive와의 충돌을 줄이기 위함)
- 가능하면 OneDrive 설정에서 **`next-cache` 폴더만 동기화 제외** (또는 “이 기기에만 유지”)

## 한 번에 정리 후 실행

```powershell
cd "프로젝트 폴더"
npm run dev:clean
```

또는:

```powershell
npm run clean:next
npm run dev
```

## 그래도 안 되면

1. **모든 터미널에서 `next dev` 종료** (백그라운드 node 없게)
2. Windows **사용자 환경 변수**에 `NEXT_DIST_DIR` 이 있으면 **삭제**
3. 프로젝트를 **`C:\dev\job-simulator`** 처럼 **OneDrive 밖**으로 복사해서 그 경로에서 `npm install` 후 `npm run dev`

## Vercel 배포

`next.config.mjs`에서 **`VERCEL` 환경변수가 있을 때는 `distDir: '.next'`** 로 자동 전환됩니다. Vercel이 `routes-manifest.json` 등을 `.next`에서 찾기 때문입니다. 로컬만 `next-cache`를 씁니다.
