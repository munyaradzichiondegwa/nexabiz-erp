#!/usr/bin/env bash
# NexaBiz — Stop all services (keep data volumes)
echo "Stopping NexaBiz services..."
docker-compose down
echo "Stopped. Data volumes preserved. Run ./scripts/bootstrap.sh to restart."
