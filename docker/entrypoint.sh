#!/bin/sh
set -e

echo "Waiting for database..."
attempt=0
max_attempts=30

until npx prisma db push --schema=backend/prisma/schema.prisma --skip-generate >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database not reachable after ${max_attempts} attempts."
    exit 1
  fi
  echo "Database not ready yet (${attempt}/${max_attempts})..."
  sleep 3
done

echo "Database schema is up to date."
mkdir -p /app/uploads
echo "Starting valutatore-istore on port ${PORT:-8081}..."
exec "$@"
