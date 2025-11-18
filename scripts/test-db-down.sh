#!/bin/bash
set -e

echo "Stopping test database..."
docker-compose -f docker-compose.test.yml down -v
echo "Test database stopped and cleaned up."
