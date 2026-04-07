#!/bin/bash
set -e

git pull

if [ "$1" = "--beta" ]; then
    # Start both prod and beta
    docker compose -f docker-compose.prod.yml pull
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up -d

    docker compose -f docker-compose.beta.yml pull
    docker compose -f docker-compose.beta.yml down
    docker compose -f docker-compose.beta.yml up -d
elif [ "$1" = "--beta-only" ]; then
    # Start only beta
    docker compose -f docker-compose.beta.yml pull
    docker compose -f docker-compose.beta.yml down
    docker compose -f docker-compose.beta.yml up -d
else
    # Start only prod (default)
    docker compose -f docker-compose.prod.yml pull
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up -d
fi
