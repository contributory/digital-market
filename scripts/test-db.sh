#!/bin/bash
set -e

echo "Setting up test database..."

# Start test database container
docker-compose -f docker-compose.test.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
max_attempts=30
attempt=0

until docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U postgres > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -gt $max_attempts ]; then
    echo "Database failed to start"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: Waiting for database..."
  sleep 1
done

echo "Test database is ready!"
