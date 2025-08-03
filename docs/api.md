# Documentación de la API de Raspberry Pi Dashboard / Raspberry Pi Dashboard API Documentation

## Autenticación / Authentication

- **POST /auth/local-login**
  - Body: `{ "username": "usuario", "password": "clave" }`  
    Body: `{ "username": "user", "password": "password" }`
  - Respuesta: `{ "access_token": "...", "token_type": "bearer", "role": "user|admin" }`  
    Response: `{ "access_token": "...", "token_type": "bearer", "role": "user|admin" }`

## Dispositivos / Devices

- **GET /devices/**
- **POST /devices/** (admin)
- **GET /devices/{id}**
- **PUT /devices/{id}** (admin)
- **DELETE /devices/{id}** (admin)
- **GET /devices/{id}/metrics**

## Usuarios (solo admin) / Users (admin only)

- **GET /users/**
- **POST /users/**
- **GET /users/{id}**
- **PUT /users/{id}**
- **DELETE /users/{id}**

## Alertas / Alerts

- **GET /devices/alerts**  
  Parámetro de consulta: `unresolved_only=true` para solo activas  
  Query param: `unresolved_only=true` for only active
- **POST /devices/alerts/{alert_id}/resolve** (admin)

## WebSocket

- **ws://localhost:8000/ws/status**
  - Envía periódicamente `{ devices, metrics, alerts }` en JSON  
    Periodically sends `{ devices, metrics, alerts }` in JSON

## Ejemplo de autenticación JWT / JWT Authentication Example

Incluye el token en el header:  
Include the token in the header:
```
Authorization: Bearer <token>
```

---

Para detalles de arquitectura, consulta `docs/architecture.md`.  
For architecture details, see `docs/architecture.md`.
