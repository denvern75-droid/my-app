# Deployment diagnosis

Date: 2026-04-21 KST

## Current repository state

- Repository: `https://github.com/denvern75-droid/my-app`
- Local branch: `main`
- Latest local commit: `75e1f25 Trigger Cloudflare deployment`
- Cloudflare URL: `https://my-app-9tk.pages.dev/`

The previous syntax error in `functions/api/report-stream.js` has already been fixed on `main`.
The current repository contains:

- `index.html`
- `functions/api/health.js`
- `functions/api/report-stream.js`
- `wrangler.jsonc`
- `.gitignore`
- `README.md`
- `DEPLOY_TRIGGER.txt`

## Live deployment check

Commands were run against the production URL on 2026-04-21 KST.

| URL | Method | Observed result |
| --- | --- | --- |
| `/` | GET | `200` |
| `/api/health` | GET | `404` |
| `/api/report-stream` | POST | `405 Method Not Allowed` |

This differs from the earlier 2026-04-20 guide, which recorded `/api/health` as working and `/api/report-stream` as a `500 Worker threw exception`.

## Interpretation

The current live deployment appears to serve the static frontend but not the Pages Functions routes.
If Pages Functions were active, `/api/health` should return JSON from `functions/api/health.js`.

Most likely causes:

1. Cloudflare Pages is not deploying the latest `main` commit.
2. The Pages project is connected to a different branch.
3. The project build/output configuration is excluding the `functions` directory.
4. The deployment is using a direct upload or cached deployment that does not include Functions.
5. A different Cloudflare project or URL is being checked.

## Cloudflare dashboard checklist

Check these items in Cloudflare Pages:

1. `Workers & Pages` -> `my-app` -> `Deployments`
2. Confirm the latest deployment commit is `75e1f25` or newer.
3. Confirm the connected branch is `main`.
4. Confirm the build output directory is the repository root (`.`) if no build step is used.
5. Confirm the uploaded/deployed files include `functions/api/health.js` and `functions/api/report-stream.js`.
6. Confirm Production environment variables include `OPENAI_API_KEY`.
7. Trigger `Retry deployment` or `Redeploy` after confirming the settings.

## Post-redeploy verification

Run:

```powershell
Invoke-WebRequest -Uri 'https://my-app-9tk.pages.dev/api/health' -UseBasicParsing
Invoke-WebRequest -Uri 'https://my-app-9tk.pages.dev/api/report-stream' -Method POST -ContentType 'application/json' -Body '{"prompt":"한국어로 한 문장만 응답해 주세요."}' -UseBasicParsing
```

Expected:

- `/api/health` returns JSON with `ok: true`.
- `/api/report-stream` returns JSON with `output_text`, or a JSON error response.
- It should not return `404`, `405`, or a Cloudflare HTML error page.
