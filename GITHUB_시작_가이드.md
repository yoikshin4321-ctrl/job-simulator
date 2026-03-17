# GitHub 처음 사용 가이드 — Job Simulator 프로젝트 업로드

단계별로 따라하면 됩니다. ✅ 표시된 항목을 순서대로 진행하세요.

---

## Step 1. Git 설치 (필수)

1. **다운로드**: https://git-scm.com/download/win
2. 설치 파일 실행 후 **기본 옵션 그대로** "Next"로 진행
3. 설치 완료 후 **PC 재시작** 또는 **Cursor/VS Code 완전히 종료 후 재실행**

---

## Step 2. GitHub 계정 만들기

1. https://github.com 접속
2. **Sign up** → 이메일, 비밀번호, 사용자명 입력
3. 이메일 인증 완료

---

## Step 3. GitHub에 새 저장소(Repository) 만들기

1. 로그인 후 오른쪽 상단 **+** → **New repository**
2. 아래처럼 설정:

   | 항목 | 값 |
   |------|-----|
   | Repository name | `job-simulator` (또는 원하는 이름) |
   | Description | (선택) 직군 시뮬레이터 웹 앱 |
   | Public | 선택 |
   | **"Add a README file"** | ❌ 체크하지 말 것 |
   | **"Add .gitignore"** | ❌ 선택하지 말 것 (이미 프로젝트에 있음) |
   | **"Choose a license"** | None |

3. **Create repository** 클릭

4. **저장소 URL 확인**  
   예: `https://github.com/내사용자명/job-simulator`  
   → 이 주소를 복사해 두세요.

---

## Step 4. 프로젝트에 Git 설정 (이미 했으면 건너뛰기)

**프로젝트 폴더**에서 **터미널(PowerShell)**을 엽니다.

```powershell
cd "c:\Users\yoish\OneDrive\바탕 화면\job simulator"
```

아래 명령을 순서대로 실행:

```powershell
# 1. Git 저장소 초기화 (처음 한 번만)
git init

# 2. 모든 파일 스테이징
git add .

# 3. 첫 커밋
git commit -m "Initial commit: job simulator 프로젝트"
```

---

## Step 5. GitHub에 푸시(Push)하기

### 5-1. GitHub와 연결 (원격 저장소 추가)

```powershell
git remote add origin https://github.com/내사용자명/job-simulator.git
```

> ⚠️ `내사용자명`을 본인 GitHub 사용자명으로 바꾸세요.  
> 예: `git remote add origin https://github.com/yoish/job-simulator.git`

### 5-2. 기본 브랜치 이름 설정 (main으로 통일)

```powershell
git branch -M main
```

### 5-3. GitHub에 업로드

```powershell
git push -u origin main
```

- 최초 1회 **로그인 창**이 뜰 수 있음  
- 브라우저에서 GitHub 로그인 → **Authorize** (승인)
- 또는 **사용자명 + 비밀번호** 대신 **Personal Access Token** 사용 가능  
  → GitHub > Settings > Developer settings > Personal access tokens 에서 생성

---

## Step 6. 이후 일상적인 업로드

코드 수정 후 GitHub에 반영하려면:

```powershell
git add .
git commit -m "변경 내용 요약 (예: 피드백 기능 추가)"
git push
```

---

## 자주 쓰는 명령어 정리

| 명령어 | 의미 |
|--------|------|
| `git status` | 변경된 파일 확인 |
| `git add .` | 모든 변경사항 스테이징 |
| `git commit -m "메시지"` | 로컬에 커밋 저장 |
| `git push` | GitHub에 업로드 |
| `git pull` | GitHub에서 최신 코드 가져오기 |
| `git log --oneline` | 커밋 내역 보기 |

---

## 안전하게 올리기 — .gitignore 확인

`.gitignore`로 **업로드하지 않을 파일**을 지정합니다.

- `node_modules` ← npm 패키지 (업로드 X, `npm install`로 재설치)
- `.env` ← API 키 등 비밀 정보
- `dist` ← 빌드 결과물

프로젝트에 이미 `.gitignore`가 있으면 위 항목들이 제외됩니다.

---

## 문제 해결

### "git을 찾을 수 없습니다"
→ Git 설치 후 **터미널/Cursor를 다시 실행**했는지 확인하세요.

### "Authentication failed"
→ GitHub 비밀번호 대신 **Personal Access Token** 사용:  
1. GitHub > Settings > Developer settings > Personal access tokens > Generate new token  
2. `repo` 권한 체크 후 토큰 생성  
3. 비밀번호 대신 토큰 붙여넣기

### "remote origin already exists"
→ 연결을 다시 하려면: `git remote remove origin` 실행 후 Step 5-1부터 다시

---

## 요약 체크리스트

- [ ] Git 설치
- [ ] GitHub 계정 생성
- [ ] 새 저장소 생성 (README, .gitignore 추가 안 함)
- [ ] `git init` → `git add .` → `git commit`
- [ ] `git remote add origin [저장소 URL]`
- [ ] `git branch -M main`
- [ ] `git push -u origin main`
