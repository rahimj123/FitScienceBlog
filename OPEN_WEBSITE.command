#!/bin/zsh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting Wellness&Health4all..."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop first: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

docker compose up -d --build

echo "App is starting. Opening browser..."
sleep 2
open http://localhost:5001

echo ""
echo "Wellness&Health4all is running at: http://localhost:5001"
echo "Press Ctrl+C to stop viewing logs (services keep running in background)."

docker compose logs -f app
