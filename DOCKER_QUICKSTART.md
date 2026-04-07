# Docker Quickstart — Wellness&Health4all

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

---

## Easiest way after sharing as ZIP

After someone unzips the folder:

1. On macOS: double-click `OPEN_WEBSITE.command`
2. On Windows: double-click `OPEN_WEBSITE.bat`

This will start Docker services (app + database) and open the website automatically.

---

## Share as Docker image bundle (works without rebuilding)

### On your machine (before sharing)

```bash
./scripts/create-portable-image-bundle.sh
```

This creates:
- `WellnessHealth4all-docker-images.tar` (portable Docker image file)

Share these files together:
- `WellnessHealth4all-docker-images.tar`
- `docker-compose.bundle.yml`
- `.env.docker`
- `RUN_FROM_BUNDLE.command` (macOS launcher)
- `RUN_FROM_BUNDLE.bat` (Windows launcher)

### On recipient machine (after unzipping)

1. Make sure Docker Desktop is installed and running.
2. On macOS: double-click `RUN_FROM_BUNDLE.command`
3. On Windows: double-click `RUN_FROM_BUNDLE.bat`

This loads the bundled images, starts app + database, and opens:
- `http://localhost:5001`

---

## Run in development mode (hot-reload)

```bash
# 1 — Open Terminal and cd into the project folder
cd ~/AI-Dev-Enviornment/databases/FitScienceBlog

# 2 — Build and start all services (PostgreSQL + Node app)
docker compose up --build

# 3 — Open the app in your browser
open http://localhost:5001
```

That's it. Docker will:
- Start a PostgreSQL 16 database on port 5432
- Install all npm dependencies inside the container
- Auto-apply the Prisma schema (creates all tables including the new wellness ones)
- Start the Express + Vite dev server with hot-reload on port 5001

---

## Useful commands

```bash
# Stop everything
docker compose down

# Stop and wipe the database (fresh start)
docker compose down -v

# View live logs
docker compose logs -f app

# Open a Postgres shell
docker compose exec db psql -U fitscience -d fitscience

# Rebuild after adding npm packages
docker compose up --build
```

---

## Run in production mode

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

---

## New routes added

Once the app is running, visit these URLs:

| URL | Page |
|-----|------|
| http://localhost:5001 | Landing page |
| http://localhost:5001/dashboard | Health Dashboard |
| http://localhost:5001/biomarkers | Biomarker System |
| http://localhost:5001/protocols | Protocol Engine |
| http://localhost:5001/providers | Provider Directory |
| http://localhost:5001/progress | Progress Tracking |
| http://localhost:5001/lab-tests | Lab Tests |

---

## Database connection (external tools like TablePlus / DBeaver)

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `fitscience` |
| Username | `fitscience` |
| Password | `fitscience_secret` |
