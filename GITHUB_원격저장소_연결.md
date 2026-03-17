# GitHub 원격 저장소 연결 가이드

로컬 커밋이 완료되었습니다. 이제 GitHub에 저장소를 만들고 연결하면 됩니다.

---

## ✅ 완료된 작업
- [x] Git 초기화 (`git init`)
- [x] 파일 스테이징 (`git add .`)
- [x] 첫 커밋 생성 (`Initial commit - job simulator MVP`)
- [x] `.gitignore`로 `node_modules`, `.env` 제외 확인됨

---

## Step 1. Git 사용자 정보 설정 (한 번만)

GitHub에 커밋이 올바른 작성자로 표시되도록 설정하세요.

```powershell
git config --global user.name "GitHub 사용자명 또는 본인 이름"
git config --global user.email "GitHub 가입 이메일"
```

예시:
```powershell
git config --global user.name "yoish"
git config --global user.email "your-email@example.com"
```

---

## Step 2. GitHub에서 새 저장소 만들기

1. **https://github.com** 로그인
2. 오른쪽 상단 **+** → **New repository** 클릭
3. 아래 설정으로 저장소 생성:

   | 항목 | 값 |
   |------|-----|
   | Repository name | `job-simulator` |
   | Description | (선택) 직군 시뮬레이터 웹 앱 |
   | Public | 선택 |
   | **Add a README file** | ❌ 체크 안 함 |
   | **Add .gitignore** | ❌ 선택 안 함 |
   | **Choose a license** | None |

4. **Create repository** 클릭

5. **저장소 URL 복사** (예: `https://github.com/내사용자명/job-simulator`)

---

## Step 3. 원격 저장소 연결 및 푸시

프로젝트 폴더에서 **터미널**을 열고, 아래 명령을 순서대로 실행하세요.

**`https://github.com/내사용자명/job-simulator` 부분을 본인 저장소 URL로 바꾸세요.**

```powershell
# 1. 원격 저장소 연결
git remote add origin https://github.com/내사용자명/job-simulator.git

# 2. 기본 브랜치를 main으로 설정
git branch -M main

# 3. GitHub에 업로드 (최초 1회)
git push -u origin main
```

### `git push` 시 로그인

- **브라우저 창**이 뜨면 GitHub 로그인 후 **Authorize** 클릭
- 또는 **사용자명 + 비밀번호** 대신 **Personal Access Token** 사용:
  1. GitHub → Settings → Developer settings → Personal access tokens
  2. **Generate new token (classic)** → `repo` 권한 체크
  3. 생성된 토큰을 비밀번호 자리에 붙여넣기

---

## 이후 업로드 방법

코드 수정 후 GitHub에 반영할 때:

```powershell
git add .
git commit -m "변경 내용 요약"
git push
```

---

## .gitignore로 제외된 항목 (업로드 안 됨)

| 항목 | 이유 |
|------|------|
| `node_modules/` | npm 패키지 (용량 큼, `npm install`로 재설치) |
| `.env` | API 키 등 비밀 정보 |
| `.env.*` | 환경 변수 파일 |
| `dist/` | 빌드 결과물 |
| `*.log` | 로그 파일 |

이미 `.gitignore`에 포함되어 있어 안전하게 제외됩니다.
