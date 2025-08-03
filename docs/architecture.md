# Arquitectura del Raspberry Pi Dashboard / Raspberry Pi Dashboard Architecture

## Diagrama General / General Diagram

```
┌────────────┐      ┌──────────────┐      ┌──────────────┐
│ Raspberry  │<---> │  Backend     │<---> │  Frontend    │
│ Pi(s) API  │      │  FastAPI     │      │  React/Vite  │
└────────────┘      │  WebSocket   │      │  i18n        │
                    │  SQLModel    │      │  WebSocket   │
                    │  Telegram    │      │  i18next     │                
                    └──────────────┘      └──────────────┘
```

- **Raspberry Pi(s):** Exponen su API de status y logs en la red local.  
  Expose their status and log API on the local network.
- **Backend:** Orquesta la autenticación, consulta a las Raspberry Pi, almacena métricas y alertas, expone WebSocket y API REST, integra con Telegram.  
  Orchestrates authentication, queries Raspberry Pis, stores metrics and alerts, exposes WebSocket and REST API, integrates with Telegram.
- **Frontend:** Dashboard moderno, internacionalizado, con administración avanzada y actualización en tiempo real.  
  Modern, internationalized dashboard with advanced management and real-time updates.

## Componentes Clave / Key Components

- **FastAPI:** API REST, WebSocket, autenticación JWT.  
  REST API, WebSocket, JWT authentication.
- **SQLModel/SQLite:** Persistencia de dispositivos, métricas, alertas, usuarios.  
  Persistence for devices, metrics, alerts, users.
- **React + Vite:** Interfaz moderna, modular, responsive.  
  Modern, modular, responsive interface.
- **react-i18next:** Internacionalización frontend.  
  Frontend internationalization.
- **Telegram Bot:** Notificaciones de alertas críticas.  
  Critical alert notifications.

## Flujo de datos / Data Flow

1. El usuario inicia sesión y recibe un JWT.  
   User logs in and receives a JWT.
2. El frontend consume la API y se conecta al WebSocket para datos en tiempo real.  
   Frontend consumes the API and connects to the WebSocket for real-time data.
3. El backend consulta periódicamente a las Raspberry Pi y almacena métricas/alertas.  
   Backend periodically queries Raspberry Pis and stores metrics/alerts.
4. Si ocurre una alerta crítica, se notifica por Telegram y se muestra en el dashboard.  
   If a critical alert occurs, it is notified via Telegram and shown on the dashboard.
5. Los administradores pueden gestionar dispositivos, usuarios y alertas desde el panel.  
   Administrators can manage devices, users, and alerts from the panel.

## Seguridad / Security

- JWT para autenticación y autorización.  
  JWT for authentication and authorization.
- Roles: admin, user.  
  Roles: admin, user.
- Endpoints protegidos para administración y acciones críticas.  
  Protected endpoints for administration and critical actions.

## Escalabilidad / Scalability

- Puedes migrar a PostgreSQL fácilmente si necesitas más capacidad.  
  You can easily migrate to PostgreSQL if you need more capacity.
- El backend soporta decenas de dispositivos en red local.  
  The backend supports dozens of devices on a local network.
- WebSocket permite monitoreo en tiempo real sin recargar.  
  WebSocket enables real-time monitoring without reloading.

---

Para detalles de endpoints y ejemplos de uso, consulta `docs/api.md`.  
For endpoint details and usage examples, see `docs/api.md`.
