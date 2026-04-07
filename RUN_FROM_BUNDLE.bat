@echo off
cd /d "%~dp0"

set BUNDLE_FILE=WellnessHealth4all-docker-images.tar

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is not installed. Install Docker Desktop first: https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)

if not exist "%BUNDLE_FILE%" (
  echo Missing %BUNDLE_FILE% in this folder.
  echo Place the bundle file next to this launcher and run again.
  pause
  exit /b 1
)

echo Loading Docker images from bundle...
docker load -i "%BUNDLE_FILE%"
if errorlevel 1 (
  echo Failed to load image bundle.
  pause
  exit /b 1
)

echo Starting app + database from bundled images...
docker compose -f docker-compose.bundle.yml up -d
if errorlevel 1 (
  echo Failed to start services.
  pause
  exit /b 1
)

start http://localhost:5001
echo Wellness^&Health4all is running at http://localhost:5001
echo Press Ctrl+C to stop viewing logs (services stay up).
docker compose -f docker-compose.bundle.yml logs -f app
