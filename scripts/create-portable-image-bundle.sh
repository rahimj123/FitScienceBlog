#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

BUNDLE_FILE="WellnessHealth4all-docker-images.tar"
APP_IMAGE="wellnesshealth4all:portable"
DB_IMAGE="postgres:16-alpine"

echo "Building production app image: $APP_IMAGE"
docker build --target production -t "$APP_IMAGE" .

echo "Ensuring database image exists: $DB_IMAGE"
docker pull "$DB_IMAGE"

echo "Saving images to bundle: $BUNDLE_FILE"
docker save -o "$BUNDLE_FILE" "$APP_IMAGE" "$DB_IMAGE"

echo "Bundle created: $PROJECT_ROOT/$BUNDLE_FILE"
echo "Share this .tar file together with docker-compose.bundle.yml, .env.docker, and launcher files."
