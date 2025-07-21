# Arquitectura del Raingauge Dashboard

## Diagrama General

```
┌────────────┐      ┌──────────────┐      ┌──────────────┐
│ Raspberry  │<--->│  Backend     │<---> │  Frontend    │
│ Pi(s) API  │      │  FastAPI     │      │  React/Vite  │
└────────────┘      │  WebSocket   │      │  i18n        │
                    │  SQLModel    │      │  WebSocket   │
                    │  LDAP/AD     │      │  i18next     │
                    │  Telegram    │      │              │
                    └──────────────┘      └──────────────┘
```

- **Raspberry Pi(s):** Exponen su API de status y logs en la red local.
- **Backend:** Orquesta la autenticación, consulta a las Raspberry Pi, almacena métricas y alertas, expone WebSocket y API REST, integra con AD y Telegram.
- **Frontend:** Dashboard moderno, internacionalizado, con administración avanzada y actualización en tiempo real.

## Componentes Clave

- **FastAPI:** API REST, WebSocket, autenticación JWT, integración LDAP/AD.
- **SQLModel/SQLite:** Persistencia de dispositivos, métricas, alertas, usuarios.
- **React + Vite:** Interfaz moderna, modular, responsive.
- **react-i18next:** Internacionalización frontend.
- **ldap3:** Autenticación contra Active Directory.
- **Telegram Bot:** Notificaciones de alertas críticas.

## Flujo de datos

1. El usuario inicia sesión (AD/LDAP) y recibe un JWT.
2. El frontend consume la API y se conecta al WebSocket para datos en tiempo real.
3. El backend consulta periódicamente a las Raspberry Pi y almacena métricas/alertas.
4. Si ocurre una alerta crítica, se notifica por Telegram y se muestra en el dashboard.
5. Los administradores pueden gestionar dispositivos, usuarios y alertas desde el panel.

## Seguridad

- JWT para autenticación y autorización.
- Roles: admin, user.
- Endpoints protegidos para administración y acciones críticas.

## Escalabilidad

- Puedes migrar a PostgreSQL fácilmente si necesitas más capacidad.
- El backend soporta decenas de dispositivos en red local.
- WebSocket permite monitoreo en tiempo real sin recargar.

---

Para detalles de endpoints y ejemplos de uso, consulta `docs/api.md`.
