# AI-news Project Audit

## 1. Repository Snapshot

- Repository: `https://github.com/3160598707-cloud/AI-news.git`
- Branch: `main`
- Latest commit: `1244e1a` (`Create nextjs.yml`)
- Current tree is extremely small and does not contain a working web application.

## 2. Current Status

### Existing files

- `generate.py`
  - Simple Python script that writes a fixed daily_news.txt file with timestamp and success message.
  - No data ingestion, no AI analysis, no map, no frontend.
- `.github/workflows/nextjs.yml`
  - Sample workflow for building and deploying a Next.js site to GitHub Pages.
  - Presumes a Next.js project, but the repository has no `package.json`, no `next.config.js`, and no frontend source.
- `.github/workflows/main.yml`
  - Minimal workflow dispatch test stub that prints a message and Python version.

### Missing core project structure

- No `README.md`, no `package.json`, no `tsconfig.json`, no `next.config.js`, no `public/`, no `pages/` or `src/` directory.
- No data pipeline, no API integration, no AI service integration.
- No map module, no PWA configuration, no notification or audio pipeline.
- No documentation or architecture file.

## 3. What Can Be Retained

- GitHub Actions workflow approach can be reused if the repo is expanded into a real Next.js or static site project.
- The `generate.py` idea of generating daily output can be kept as a simple automation example, but it needs to be rebuilt into a real pipeline with data sources and AI processing.
- The repository can retain the existing GitHub workflow folder as a starting point for automation.

## 4. Immediate Issues / Optimization Needs

- The current repository is not a working product; it is closer to a placeholder/demo repository.
- There is no application code or manifest for a website or PWA.
- There is no evidence of any actual AI or intelligence-monitoring functionality.
- The GitHub Pages workflow is misaligned with repository contents.
- The repository lacks structure, documentation, and any deployable artifact.

## 5. Missing Functionality for AI World Intelligence Monitor

To reach the stated product vision, the repository must add or integrate:

- Frontend app: Next.js / React / PWA shell.
- Global 3D map module: e.g. Globe.gl, Three.js, Cesium, or MapLibre.
- Data ingestion/collection: RSS, official sources, open data feeds.
- AI analysis layer: DeepSeek API or similar for summarization, classification, trend/risk analysis.
- Data model: raw data, AI analysis metadata, presentation layer.
- Daily report generation pipeline.
- Notification layer: Web Push or Telegram.
- Audio generation / TTS for daily reports.
- Mobile-accessible PWA configuration and support.
- Security practices: API keys in secrets, not code.

## 6. Recommended Upgrade Route

### Phase 0: Audit and research

- Confirm that this repository is the correct project base.
- Identify required open-source components and their compatibility.
- Determine a minimal viable architecture for a personal intelligence monitor.

### Phase 1: Establish core project scaffold

- Add missing project scaffold: `README.md`, `package.json`, `next.config.js`, `tsconfig.json`, and a basic `src/` or `pages/` structure.
- Choose a preferred stack: Next.js + React + TypeScript is consistent with the existing workflow.

### Phase 2: Integrate open-source map/dashboard

- Select a mature map library: likely `Globe.gl` or `MapLibre` for easiest integration.
- Build a basic map page showing country boundaries and event markers.
- Add mock event data for military/war/energy/tech/business categories.

### Phase 3: Add data ingestion and AI pipeline

- Add data ingestion connectors, starting with RSS and public news sources.
- Build a simple pipeline to ingest headlines and metadata into a normalized store.
- Add AI processing using a single `DeepSeek API` integration layer for summarization and categorization.

### Phase 4: Automate with GitHub Actions

- Convert `generate.py` idea into a CI job or scheduled action that runs ingestion, analysis, and report generation.
- Add a real deployment workflow for the frontend site.

### Phase 5: Add PWA, audio, and notification features

- Implement PWA support for mobile access.
- Add TTS generation for the daily intelligence report.
- Add optional notification hooks (Telegram / Web Push) using secrets.

## 7. Conclusion

This repository currently has no real AI-news product implementation. It is a near-empty starting point with only a placeholder script and sample workflows. The highest-value next step is not coding immediately, but establishing the missing application scaffold and selecting mature open-source libraries for the frontend, map visualization, data ingestion, and AI analysis.

> Do not modify code yet. Continue with repository audit and open-source solution identification before further development.
