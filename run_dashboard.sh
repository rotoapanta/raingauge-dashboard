#!/bin/bash
set -e

echo "🧹 Deteniendo y eliminando contenedores anteriores (si existen)..."
docker compose down

echo "🚀 Construyendo e iniciando los contenedores del dashboard..."
docker compose up --build -d

echo "✅ Contenedores iniciados. Puedes acceder al dashboard en:"
echo "   http://localhost"
echo "Para ver logs del backend:"
echo "   docker compose logs backend"
