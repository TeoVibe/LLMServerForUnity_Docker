#!/bin/bash

cd "$(dirname "$0")/shared"

mkdir -p models

IMAGE_NAME="teocholakov/undream_server:v1.1.0-runpod"

docker compose -f docker-compose.runpod.yml down

docker compose -f docker-compose.runpod.yml build

echo "Pushing the image to Docker Hub..."
docker push ${IMAGE_NAME}