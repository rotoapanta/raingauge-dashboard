FROM python:3.11-slim-bullseye


WORKDIR /app

COPY ./ ./

RUN pip install --no-cache-dir fastapi uvicorn psutil

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Al final del Dockerfile
RUN mkdir -p /app/logs