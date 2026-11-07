# Tests and delivery

From the repository root, using Python 3.12 or newer:

```sh
python -m pip install -r SkillSwap/backend/requirements-dev.txt
python -m pytest
python -m pytest --cov=SkillSwap.backend --cov-report=term-missing
```

The HTTP regression tests cover match authentication, receiver-only acceptance
and rejection, cancellation permissions, duplicate requests in either direction,
the unique pair index configuration, malformed match IDs, browse query limits,
and invalid review payloads. Database operations are mocked; these tests do not
connect to MongoDB. They verify duplicate-key handling and index configuration,
but do not replace integration tests against a real MongoDB server.

Frontend checks:

```sh
cd SkillSwap
npm ci
npm run lint
npm run build
```

GitHub Actions runs both jobs on pull requests and pushes to `main`, and can
also be started manually. It uploads backend coverage/JUnit results and the
frontend build. Configure branch protection to require the `backend` and
`frontend` jobs before merging.

## Optional continuous deployment

No hosting provider is configured in this repository. The deployment job is
disabled until repository variable `DEPLOY_ENABLED` is set to `true`.

1. Configure your host to build this repository's `main` branch. Backend install:
   `pip install -r SkillSwap/backend/requirements.txt`; start from the repository
   root with `uvicorn SkillSwap.backend.main:app --host 0.0.0.0 --port $PORT`.
   Frontend root: `SkillSwap`; build: `npm ci && npm run build`; publish: `dist`.
2. Set backend hosting secrets `MONGO_URL` and a strong `SECRET_KEY`. Set
   `CORS_ORIGINS` to the frontend origin (comma-separated for multiple origins).
   Set frontend build variable `VITE_API_URL` to the public backend URL.
3. Create a GitHub environment named `production`. Add its secret
   `DEPLOY_HOOK_URL`, an HTTPS endpoint accepting POST that deploys both services
   (or your hosting orchestration endpoint). Disable independent host auto-deploys
   if deployment must be gated by these checks.
4. Set repository variable `VITE_API_URL` for the frontend artifact, then enable
   `DEPLOY_ENABLED`. Successful pushes to `main` trigger the hook only after both
   jobs pass. Use environment protection rules if production needs approval.

A successful hook request means the deployment was triggered; its completion and
health must be monitored by the hosting provider. No deployment has been enabled
or triggered by adding this workflow.
