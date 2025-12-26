#!/bin/sh
set -e

# ---------------------------------
# Frontend Docker build & push
# ---------------------------------

# Go to script directory (frontend/docker-build)
cd "$(dirname "$0")"

# ===== Load environment variables =====
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

# ===== Config =====
DOCKER_USER="${FRONTEND_DEV_DOCKERHUB}"
IMAGE_NAME="${FRONTEND_PROJECT_DOCKERHUB}"

# ===== Docker login =====
echo "Logging in to Docker Hub..."
docker login || { echo "Docker login failed"; exit 1; }

# ===== Build frontend image =====
echo "Building frontend image: ${DOCKER_USER}/${IMAGE_NAME}"

# Build context MUST be frontend/
FRONTEND_DIR="$(cd .. && pwd)"

docker build \
  -f docker-build/Dockerfile.frontend \
  -t ${DOCKER_USER}/${IMAGE_NAME} \
  "$FRONTEND_DIR" || { echo "Docker build failed"; exit 1; }

# ===== Push image =====
echo "Pushing frontend image..."
docker push ${DOCKER_USER}/${IMAGE_NAME} || { echo "Docker push failed"; exit 1; }

echo "Frontend image pushed successfully: ${DOCKER_USER}/${IMAGE_NAME}"