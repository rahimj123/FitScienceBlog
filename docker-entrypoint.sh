#!/bin/sh
set -e

echo "⏳  Waiting for PostgreSQL to be ready..."

# Wait for the database to accept connections (up to 60 seconds)
MAX_RETRIES=30
RETRY=0
until pg_isready -h "${PGHOST:-db}" -p "${PGPORT:-5432}" -U "${PGUSER:-fitscience}" > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "❌  PostgreSQL did not become ready in time. Exiting."
    exit 1
  fi
  echo "   ...still waiting (attempt $RETRY/$MAX_RETRIES)"
  sleep 2
done

echo "✅  PostgreSQL is ready."

echo "🔄  Running prisma db push (apply schema)..."
npx prisma db push --accept-data-loss

echo "🔧  Rebuilding native dependencies for Linux container..."
npm rebuild esbuild

echo "🚀  Starting application..."
exec "$@"
