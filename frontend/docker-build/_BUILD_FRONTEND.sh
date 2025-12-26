#!/bin/sh
set -e

# Go to script directory
cd "$(dirname "$0")"

# ===== Load environment variables =====
if [ -f ../../install/.env ]; then
    echo "Loading environment variables from install/.env"
    set -a
    . ../../install/.env
    set +a
else
    echo "Error: install/.env not found!"
    exit 1
fi

# ===== Config =====
DOCKER_USER="${FRONTEND_DEV_DOCKERHUB}"
IMAGE_NAME="${FRONTEND_PROJECT_DOCKERHUB}"

# ===== Docker login =====
echo "Logging in to Docker Hub..."
docker login || exit 1

# ===== Build frontend image =====
echo "Building frontend image..."
docker build \
  -f Dockerfile.frontend \
  -t ${DOCKER_USER}/${IMAGE_NAME} \
  .. || exit 1

# ===== Push image =====
echo "Pushing frontend image..."
docker push ${DOCKER_USER}/${IMAGE_NAME} || exit 1

echo "Frontend image pushed to Docker Hub."
