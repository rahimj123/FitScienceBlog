@echo off
cd /d "%~dp0"

echo Starting Wellness^&Health4all...
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is not installed. Install Docker Desktop first: https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)

docker compose up -d --build
if errorlevel 1 (
  echo Failed to start Docker services.
  pause
  exit /b 1
)

start http://localhost:5001

echo Wellness^&Health4all is running at http://localhost:5001
echo Press Ctrl+C to stop viewing logs (services keep running in background).
docker compose logs -f app
