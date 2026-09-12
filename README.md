# JobFit AI

취업 준비생과 이직 준비자의 경력, 희망 직무, 희망 지역, 보유 기술을 바탕으로 채용공고를 분석하고 **AI가 적합한 공고 TOP 3를 추천하는 웹 서비스**입니다.

## 배포 URL

- Vercel: `배포 후 URL 입력`
- GitHub: `저장소 생성 후 URL 입력`

> 제출 전 위 두 URL을 실제 주소로 반드시 수정합니다.

## 주요 기능

- HOME: 서비스 소개 및 주요 기능 안내
- JOBS: 채용공고 목록, 검색 및 필터
- JOB DETAIL: 채용공고 상세 정보 확인
- AI MATCH: 사용자 조건을 입력하면 AI가 적합한 채용공고 TOP 3 추천
- MY PAGE: 관심 공고 및 사용자 정보 UI
- 모바일/태블릿/데스크톱 반응형 화면
- 빈 입력, API 오류, 응답 지연에 대한 사용자 안내

## 기술 스택

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Python, FastAPI
- AI API: OpenAI Responses API
- Deployment: Vercel
- Version Control: Git, GitHub

## 프로젝트 구조

```text
jobfit-ai/
├─ index.html
├─ jobs.html
├─ job-detail.html
├─ match.html
├─ mypage.html
├─ css/
│  ├─ common.css
│  ├─ index.css
│  ├─ jobs.css
│  ├─ job-detail.css
│  ├─ match.css
│  └─ mypage.css
├─ js/
│  ├─ common.js
│  ├─ jobs-data.js
│  ├─ jobs.js
│  ├─ detail.js
│  ├─ match.js
│  └─ mypage.js
├─ api/
│  └─ index.py
├─ evidence/
│  └─ README.md
├─ SERVICE_PLAN.md
├─ requirements.txt
├─ .gitignore
└─ README.md
```

## AI 기능 동작 흐름

1. 사용자가 AI MATCH 화면에 희망 직무, 경력, 지역, 보유 기술을 입력합니다.
2. JavaScript가 입력값을 검사합니다.
3. `fetch('/api/recommend')`로 Python FastAPI 엔드포인트에 요청합니다.
4. FastAPI가 서버 환경 변수의 `OPENAI_API_KEY`를 사용해 OpenAI API를 호출합니다.
5. AI가 채용공고 TOP 3, 적합도, 추천 이유, 강점, 보완 역량을 반환합니다.
6. JavaScript가 응답 데이터를 화면에 표시합니다.

## 실패 처리

- 필수값 누락: 입력 안내 메시지를 표시합니다.
- API 오류: 서버에서 전달된 오류 내용을 사용자에게 안내합니다.
- 응답 지연: 25초 이상 응답이 없으면 요청을 중단하고 재시도를 안내합니다.

## 로컬 실행

### 1. 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

API 키는 코드에 직접 작성하지 않습니다.

프로젝트 루트에 `.env`를 만들 경우 예시는 다음과 같습니다.

```text
OPENAI_API_KEY=발급받은_API_KEY
```

`.env` 파일은 `.gitignore`에 포함되어 있으므로 GitHub에 업로드하지 않습니다.

### 3. Vercel 개발 서버 실행

Vercel CLI가 설치되어 있다면 다음 명령으로 프론트와 API를 함께 확인할 수 있습니다.

```bash
vercel dev
```

AI 기능 없이 정적 화면만 확인하려면 VS Code Live Server를 사용할 수도 있습니다.

## Vercel 배포 방법

1. 프로젝트를 GitHub 저장소에 Push합니다.
2. Vercel에서 **Add New → Project**를 선택합니다.
3. 생성한 GitHub 저장소를 Import합니다.
4. Vercel 프로젝트의 **Settings → Environment Variables**에 아래 값을 추가합니다.

```text
OPENAI_API_KEY=발급받은_API_KEY
```

5. Production 환경에 적용한 뒤 Deploy 또는 Redeploy합니다.
6. 배포 URL에서 다음을 확인합니다.
   - 페이지/메뉴 이동
   - 모바일 반응형
   - AI MATCH 입력 → 결과 출력
   - `/api/health` 응답
7. 최종 배포 URL을 이 README의 `배포 URL` 항목에 기록합니다.

## 보안 주의사항

- OpenAI API 키를 HTML, JavaScript, Python 코드에 직접 입력하지 않습니다.
- `.env`, `.vercel`, `.venv`는 GitHub에 업로드하지 않습니다.
- API 키가 실수로 공개되었다면 즉시 폐기하고 새 키를 발급합니다.

## 제출 자료

- GitHub 저장소 URL
- Vercel 배포 URL
- `SERVICE_PLAN.md`
- 데스크톱 화면 스크린샷
- 모바일 화면 스크린샷
- AI 기능 동작 스크린샷
- AI 코딩 도구 사용 과정 스크린샷 또는 대화 로그
