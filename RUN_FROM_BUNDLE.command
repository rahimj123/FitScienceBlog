#!/bin/zsh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

BUNDLE_FILE="WellnessHealth4all-docker-images.tar"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop first: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if [ ! -f "$BUNDLE_FILE" ]; then
  echo "Missing $BUNDLE_FILE in this folder."
  echo "Place the bundle file next to this launcher and run again."
  exit 1
fi

echo "Loading Docker images from bundle..."
docker load -i "$BUNDLE_FILE"

echo "Starting app + database from bundled images..."
docker compose -f docker-compose.bundle.yml up -d

echo "Opening website..."
open http://localhost:5001

echo "Wellness&Health4all is running at: http://localhost:5001"
echo "Press Ctrl+C to stop viewing logs (services stay up)."
docker compose -f docker-compose.bundle.yml logs -f app
