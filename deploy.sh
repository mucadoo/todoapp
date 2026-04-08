#!/bin/bash

# Configuration
PROJECT_DIR="~/todoapp"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Wait for Docker to be ready (especially after first-boot reboot)
echo "Waiting for Docker to be ready..."
max_attempts=60
attempt=1
until docker info > /dev/null 2>&1; do
  if [ $attempt -gt $max_attempts ]; then
    echo "Timeout waiting for Docker"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: Docker not ready, waiting 5s..."
  sleep 5
  attempt=$((attempt+1))
done

# 1. Update project files
mkdir -p $PROJECT_DIR
cp .env $PROJECT_DIR/.env
cp $DOCKER_COMPOSE_FILE $PROJECT_DIR/$DOCKER_COMPOSE_FILE

cd $PROJECT_DIR

# 2. Login to GHCR
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# 3. Pull latest images and restart services
docker compose -f $DOCKER_COMPOSE_FILE pull
docker compose -f $DOCKER_COMPOSE_FILE up -d --remove-orphans

# 4. Clean up old images to save space on t2.micro
docker image prune -f
