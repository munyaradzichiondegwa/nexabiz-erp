#!/usr/bin/env bash
# NexaBiz — Tail logs from all or specific services
SERVICE=${1:-""}
if [ -z "$SERVICE" ]; then
  docker-compose logs -f --tail=50
else
  docker-compose logs -f --tail=100 "$SERVICE"
fi
