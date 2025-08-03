#!/bin/bash
set -e

: '"""
run_dashboard.sh

This script automates the deployment of the dashboard using Docker Compose.
- Stops and removes previous containers if they exist.
- Builds and starts the containers defined in docker-compose.yml.
- Shows the access URL and how to view backend logs.

Usage:
  bash run_dashboard.sh

---

Este script automatiza el despliegue del dashboard usando Docker Compose.
- Detiene y elimina contenedores previos si existen.
- Construye e inicia los contenedores definidos en docker-compose.yml.
- Muestra la URL de acceso y cómo ver los logs del backend.

Uso:
  bash run_dashboard.sh
"""'

# Stop and remove previous containers if they exist
# Detener y eliminar contenedores anteriores (si existen)
echo "🧹 Stopping and removing previous containers (if any)..."
docker compose down

# Build and start the dashboard containers in detached mode
# Construir e iniciar los contenedores del dashboard en modo desatendido
echo "🚀 Building and starting the dashboard containers..."
docker compose up --build -d

# Final message with access instructions
# Mensaje final con instrucciones de acceso
echo "✅ Containers started. You can access the dashboard at:"
echo "   http://localhost"
echo "To view backend logs:"
echo "   docker compose logs backend"
echo "To access a shell inside the backend container:"
echo "   docker exec -it raingauge-backend bash"
echo "Other useful commands:"
echo "   docker compose ps                # Show container status"
echo "   docker compose restart backend   # Restart the backend container"
echo "   docker compose down              # Stop and remove all containers"
echo "   docker compose logs -f backend   # Follow backend logs in real time"
