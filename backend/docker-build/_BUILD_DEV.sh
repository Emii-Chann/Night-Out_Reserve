#!/bin/sh
set -e

# -------------------------------
# Backend Docker build & push
# -------------------------------

# Go to script directory (docker-build/)
cd "$(dirname "$0")"

# Load environment variables from install/.env
ENV_FILE="../../install/.env"
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE"
    set -a
    . "$ENV_FILE"
    set +a
else
    echo "Error: $ENV_FILE not found!"
    exit 1
fi

# ===== CONFIG =====
DOCKER_USER="${BACKEND_DEV_DOCKERHUB}"
IMAGE_NAME="${BACKEND_PROJECT_DOCKERHUB}"

# ===== LOGIN =====
echo "Logging in to Docker Hub..."
docker login || { echo "Docker login failed!"; exit 1; }

# ===== BUILD IMAGE =====
echo "Building Docker image: ${DOCKER_USER}/${IMAGE_NAME}"

# Absolute backend path as build context
BACKEND_DIR="$(cd ../ && pwd)"

docker build \
  -f Dockerfile.dev \
  -t ${DOCKER_USER}/${IMAGE_NAME} \
  "$BACKEND_DIR" || { echo "Docker build failed!"; exit 1; }

# ===== PUSH IMAGE =====
echo "Pushing Docker image: ${DOCKER_USER}/${IMAGE_NAME}"
docker push ${DOCKER_USER}/${IMAGE_NAME} || { echo "Docker push failed!"; exit 1; }

echo "Docker image pushed successfully: ${DOCKER_USER}/${IMAGE_NAME}"
