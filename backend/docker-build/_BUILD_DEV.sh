#!/bin/sh
set -e

# Go to script directory
cd "$(dirname "$0")"

# Load environment variables from .install/.env
if [ -f ../../.install/.env ]; then
    echo "Loading environment variables from .install/.env"
    set -a             # automatically export all variables
    . ../../.install/.env
    set +a
else
    echo "Error: .install/.env not found!"
    exit 1
fi

# ===== CONFIG =====
DOCKER_USER="${BACKEND_DEV_DOCKERHUB}"
IMAGE_NAME="${BACKEND_PROJECT_DOCKERHUB}"

# ===== LOGIN =====
echo "Logging in to Docker Hub..."
docker login || exit 1

# ===== BUILD DEV IMAGE =====
echo "Building DEV image..."
docker build \
  -f Dockerfile.dev \
  -t ${DOCKER_USER}/${IMAGE_NAME} \
  . || exit 1

# ===== PUSH IMAGE =====
echo "Pushing DEV image..."
docker push ${DOCKER_USER}/${IMAGE_NAME} || exit 1

echo "Images pushed to Docker Hub as DEV."
