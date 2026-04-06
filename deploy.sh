#!/bin/bash

# Configuration
PROJECT_DIR="~/todoapp"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# 1. Update project files
mkdir -p $PROJECT_DIR
cp .env $PROJECT_DIR/.env
cp $DOCKER_COMPOSE_FILE $PROJECT_DIR/$DOCKER_COMPOSE_FILE

cd $PROJECT_DIR

# 2. Login to GHCR (Assumes GITHUB_TOKEN is configured in env or via GH CLI)
# For simplicity, we assume the server is already logged in or images are public.
# echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# 3. Pull latest images and restart services
docker compose -f $DOCKER_COMPOSE_FILE pull
docker compose -f $DOCKER_COMPOSE_FILE up -d --remove-orphans

# 4. Clean up old images to save space on t2.micro
docker image prune -f
