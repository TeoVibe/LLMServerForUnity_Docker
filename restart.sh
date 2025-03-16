#!/bin/bash

cd "$(dirname "$0")/shared"

mkdir -p models

docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.local.yml up --build -d