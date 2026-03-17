@echo off
chcp 65001 > nul
echo ============================================
echo   Job Simulator - Git 초기 설정
echo ============================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Git이 설치되어 있지 않습니다.
    echo.
    echo 1. https://git-scm.com/download/win 에서 Git 설치
    echo 2. 설치 후 터미널을 다시 열고 이 스크립트를 다시 실행하세요.
    pause
    exit /b 1
)

echo [1/4] Git 저장소 초기화...
git init
if %errorlevel% neq 0 (
    echo 이미 초기화된 저장소일 수 있습니다. 계속 진행합니다.
)

echo.
echo [2/4] 파일 추가 중...
git add .

echo.
echo [3/4] 첫 번째 커밋 생성...
git commit -m "Initial commit: job simulator 프로젝트 전체 저장"

if %errorlevel% neq 0 (
    echo.
    echo 커밋할 변경사항이 없거나 오류가 발생했습니다.
    echo git status 로 상태를 확인해 보세요.
    pause
    exit /b 1
)

echo.
echo [4/4] 완료!
echo.
echo ============================================
echo   시점별 복구 방법
echo ============================================
echo   git log --oneline     : 커밋 목록 보기
echo   git status            : 현재 변경사항 확인
echo   git add .             : 변경사항 스테이징
echo   git commit -m "메시지" : 새 시점 저장
echo ============================================
echo.
pause
