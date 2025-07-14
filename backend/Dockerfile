FROM python:3.11-slim-bullseye


WORKDIR /app

COPY ./ ./

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Instala curl
RUN apt-get update && apt-get install -y curl

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Al final del Dockerfile
RUN mkdir -p /app/logs