# Documentación de la API

## Autenticación

- **POST /auth/login**
  - Body: `{ "username": "usuario", "password": "clave" }`
  - Respuesta: `{ "access_token": "...", "token_type": "bearer" }`

## Dispositivos

- **GET /devices/**
- **POST /devices/** (admin)
- **GET /devices/{id}**
- **PUT /devices/{id}** (admin)
- **DELETE /devices/{id}** (admin)
- **GET /devices/{id}/metrics**

## Usuarios (solo admin)

- **GET /users/**
- **POST /users/**
- **GET /users/{id}**
- **PUT /users/{id}**
- **DELETE /users/{id}**

## Alertas

- **GET /devices/alerts**
  - Query param: `unresolved_only=true` para solo activas
- **POST /devices/alerts/{alert_id}/resolve** (admin)

## WebSocket

- **ws://localhost:8000/ws/status**
  - Envía periódicamente `{ devices, metrics, alerts }` en JSON

## Ejemplo de autenticación JWT

Incluye el token en el header:
```
Authorization: Bearer <token>
```

---

Para detalles de arquitectura, consulta `docs/architecture.md`.
