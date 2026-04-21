# my-app

Cloudflare Pages Functions 기반 접근성 모니터링 보고서 생성 앱입니다.

## 구조

- `index.html`: 브라우저 UI
- `functions/api/health.js`: API/환경변수 상태 확인
- `functions/api/report-stream.js`: OpenAI 서버사이드 프록시
- `wrangler.jsonc`: Cloudflare Pages/Workers 로컬 실행 설정

## 필요한 환경변수

Cloudflare Pages 프로젝트의 Production 환경변수에 아래 값을 설정하세요.

- `OPENAI_API_KEY`: OpenAI API 키
- `OPENAI_MODEL`: 선택값. 기본값은 `gpt-4.1-mini`

API 키는 절대 HTML, README, GitHub 코드에 직접 넣지 마세요.

## Cloudflare Pages 확인 순서

1. Cloudflare Dashboard에서 `Workers & Pages`로 이동합니다.
2. 이 프로젝트를 선택합니다.
3. `Settings` -> `Environment variables`에서 `OPENAI_API_KEY`가 Production에 설정되어 있는지 확인합니다.
4. `Deployments`에서 최신 GitHub 커밋이 배포되었는지 확인합니다.
5. 최신 커밋이 아니면 `Retry deployment` 또는 `Redeploy`를 실행합니다.

## 배포 후 테스트

```powershell
Invoke-WebRequest -Uri 'https://my-app-9tk.pages.dev/api/health' -UseBasicParsing
Invoke-WebRequest -Uri 'https://my-app-9tk.pages.dev/api/report-stream' -Method POST -ContentType 'application/json' -Body '{"prompt":"한국어로 한 문장만 응답해 주세요."}' -UseBasicParsing
```

정상이라면 `/api/report-stream`는 JSON으로 `output_text`를 반환합니다.

## 로컬 실행 참고

Wrangler가 설치되어 있으면 다음처럼 실행할 수 있습니다.

```powershell
npx wrangler pages dev .
```

로컬에서는 `.dev.vars` 파일에 환경변수를 넣을 수 있습니다.

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

`.dev.vars`는 `.gitignore`에 포함되어 GitHub에 올라가지 않습니다.

## 배포 문제 진단

현재 운영 URL에서 정적 페이지는 열리지만 `/api/health`가 `404` 또는 `/api/report-stream`가 `405`를 반환하면 Cloudflare Pages Functions가 배포본에 포함되지 않은 상태일 가능성이 큽니다.

이 경우 먼저 `DEPLOYMENT_DIAGNOSIS.md`의 체크리스트에 따라 Cloudflare Pages 연결 브랜치, 최신 배포 커밋, 빌드 출력 디렉터리, `functions` 디렉터리 포함 여부를 확인하세요.
