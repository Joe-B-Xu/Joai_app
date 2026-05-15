# Render Web Deployment

This project can be deployed as a public Web app on Render using the repository-level [render.yaml](/C:/codex/Joai_app/render.yaml).

## What This Deploys

- FastAPI backend
- Built Web UI served from the same app
- Health check at `/api/health`
- Default watchlist: `GOOGL,META,NVDA,AAPL`
- Default email receiver: `xuboyan0823@gmail.com`

## Render Setup

1. Push the latest code to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect the GitHub repo `Joe-B-Xu/Joai_app`.
4. Render will detect `render.yaml` and create the `daily-stock-analysis-web` service.
5. Fill in required secret env vars before the first deploy:
   - `GEMINI_API_KEY` or another supported AI provider key
   - `EMAIL_SENDER`
   - `EMAIL_PASSWORD`
6. Start the deploy.

## Important Notes

- The service runs from the `daily_stock_analysis` subdirectory of the monorepo.
- The app starts in Web mode only:
  - `python main.py --serve-only --host 0.0.0.0 --port 10000`
- A persistent disk is mounted at `/app/data`.
- Logs and reports are stored inside the container filesystem unless you add more persistent mounts or external storage.

## After Deploy

- Open the Render service URL.
- Check API health at `/api/health`.
- Open `/docs` for interactive API docs.
- Use the Web UI settings page to adjust stocks, notification channels, and model configuration.
