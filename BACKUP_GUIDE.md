# Job Simulator 프로젝트 백업 가이드

OneDrive 동기화로 인한 프로젝트 손실을 방지하기 위한 안내입니다.

---

## 1. OneDrive와 개발 프로젝트의 충돌

OneDrive가 **바탕 화면**을 동기화하면:
- 파일이 동시에 열려 있을 때 충돌(복사본 생성)
- `node_modules` 등 수천 개 파일 동기화로 속도 저하
- 동기화 지연 시 예상치 못한 변경/삭제

---

## 2. 당장 할 수 있는 조치

### 방법 A: 수동 ZIP 백업 (즉시 가능)

**백업할 폴더/파일** (node_modules 제외 권장):
```
job simulator/
├── src/           ← 반드시
├── public/        ← 있으면
├── index.html     ← 반드시
├── package.json   ← 반드시
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .gitignore
└── 기타 설정 파일
```

**실행 순서:**
1. `node_modules` 폴더를 제외하고 전체 프로젝트를 ZIP으로 압축
2. `C:\Users\yoish\Documents\job-simulator-backup\` 같은 OneDrive가 아닌 위치에 저장
3. 주기적으로 `job-simulator_2025-03-14.zip`처럼 날짜 포함해서 백업

### 방법 B: 프로젝트 위치 변경 (권장)

1. **새 위치 예시**: `C:\dev\job-simulator\` (OneDrive 밖)
2. 전체 프로젝트 폴더를 복사 (이동 아님, 먼저 복사)
3. 새 위치에서 `npm install` 실행
4. `npm run dev`로 정상 동작 확인
5. 이후 개발은 새 경로에서 진행

---

## 3. Git으로 시점별 복구 설정 (Git 설치 필요)

### Git 설치

1. https://git-scm.com/download/win 에서 다운로드
2. 설치 시 기본 옵션 그대로 진행
3. **새 터미널** 열기

### 한 번만 실행: 초기 설정

이 프로젝트 폴더에서 아래 명령을 실행하거나, `setup-git.bat` 파일을 **더블클릭**하세요.

```bash
git init
git add .
git commit -m "Initial commit: job simulator 프로젝트 전체 저장"
```

### 일상적인 사용

| 작업 | 명령 |
|------|------|
| 변경사항 저장 | `git add .` → `git commit -m "작업 내용 요약"` |
| 과거로 복구 | `git log` (커밋 목록) → `git checkout <커밋ID>` 또는 `git reset --hard <커밋ID>` |
| 현재 상태 확인 | `git status` |
| 차이점 보기 | `git diff` |

### 복구 예시

```bash
# 커밋 목록 (최신이 맨 위)
git log --oneline

# 예: abc1234 커밋 시점으로 되돌리기
git reset --hard abc1234
```

---

## 4. OneDrive에서 폴더 제외 (선택)

1. 작업 표시줄 → OneDrive 아이콘 → 설정
2. **계정** → **폴더 선택**
3. **바탕 화면** 동기화 해제 또는, 바탕 화면 안의 `job simulator`만 제외하려면:
   - OneDrive 설정에서 해당 폴더 동기화 해제는 불가능함
   - 대신 **프로젝트를 OneDrive 밖으로 이동**하는 것이 가장 안전함

---

## 5. 추천 요약

| 우선순위 | 조치 |
|----------|------|
| 1 | Git 설치 후 `setup-git.bat` 실행 → 커밋 1개 생성 |
| 2 | 프로젝트를 `C:\dev\job-simulator` 등 OneDrive 밖으로 이동 |
| 3 | 중요한 수정 후 주기적으로 ZIP 백업 (외장 드라이브/다른 PC) |
| 4 | GitHub/GitLab에 원격 저장소 만들어 `git push`로 클라우드 백업 |

---

## 6. Git 설치 후 바로 실행할 스크립트

`setup-git.bat` 파일이 이 프로젝트에 포함되어 있습니다.  
Git 설치 후 **프로젝트 폴더에서** 해당 파일을 더블클릭하면, 초기 커밋까지 자동으로 진행됩니다.
