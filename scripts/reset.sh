#!/usr/bin/env bash
# NexaBiz — Full reset (WARNING: destroys all data)
read -rp "This will DELETE ALL DATA. Type YES to confirm: " confirm
[ "$confirm" = "YES" ] || { echo "Cancelled."; exit 1; }
docker-compose down -v --remove-orphans
echo "All data and volumes removed. Run ./scripts/bootstrap.sh to start fresh."
