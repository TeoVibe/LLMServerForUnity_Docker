#!/bin/bash

cd "$(dirname "$0")/shared"

mkdir -p models

docker compose -f docker-compose.runpod.yml down
docker compose -f docker-compose.runpod.yml up --build -d