#!/bin/bash
# Configuration
PROJECT_DIR="~/todoapp"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "Waiting for Docker to be ready..."

max_attempts=90
attempt=1

until docker info > /dev/null 2>&1; do
  if [ $attempt -gt $max_attempts ]; then
    echo "Timeout waiting for Docker. Trying with sudo..."
    # Fallback: try with sudo (in case group not applied yet)
    if sudo docker info > /dev/null 2>&1; then
      echo "Docker works with sudo. Using sudo for this deployment."
      USE_SUDO=true
      break
    else
      echo "Docker is still not available even with sudo. Giving up."
      exit 1
    fi
  fi

  echo "Attempt $attempt/$max_attempts: Docker not ready, waiting 8s..."
  sleep 8
  attempt=$((attempt+1))
done

echo "Docker is ready!"

# 1. Update project files
mkdir -p $PROJECT_DIR
cp .env $PROJECT_DIR/.env
cp $DOCKER_COMPOSE_FILE $PROJECT_DIR/$DOCKER_COMPOSE_FILE
cd $PROJECT_DIR

# 2. Login to GHCR
# Check if sudo is needed for docker login
if [ "${USE_SUDO:-false}" = true ]; then
  echo "$GITHUB_TOKEN" | sudo docker login ghcr.io -u $GITHUB_ACTOR --password-stdin
else
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin
fi

# 3. Pull and start (use sudo only if needed)
if [ "${USE_SUDO:-false}" = true ]; then
  echo "Running docker compose with sudo..."
  sudo docker compose -f $DOCKER_COMPOSE_FILE pull
  sudo docker compose -f $DOCKER_COMPOSE_FILE up -d --remove-orphans --force-recreate
  sudo docker image prune -f
else
  docker compose -f $DOCKER_COMPOSE_FILE pull
  docker compose -f $DOCKER_COMPOSE_FILE up -d --remove-orphans --force-recreate
  docker image prune -f
fi

echo "Deployment completed successfully!"
