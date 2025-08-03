# Dockerfile
#
# Build and run the Raingauge Dashboard backend in a container.
# Installs dependencies, exposes port 8000, and starts the FastAPI app with Uvicorn.
#
# Construye y ejecuta el backend de Raingauge Dashboard en un contenedor.
# Instala dependencias, expone el puerto 8000 y lanza la app FastAPI con Uvicorn.

FROM python:3.11-slim-bullseye

WORKDIR /app

COPY ./ ./

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install curl / Instala curl
RUN apt-get update && apt-get install -y curl

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Create logs directory / Crear directorio de logs
RUN mkdir -p /app/logs
