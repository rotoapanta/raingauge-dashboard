# Raingauge Dashboard

---

## Resumen / Overview

**ES:**
Dashboard centralizado para el monitoreo y gestión en tiempo real de múltiples dispositivos Raspberry Pi. Incluye administración de usuarios y dispositivos, métricas históricas, actualizaciones en tiempo real vía WebSockets, internacionalización (ES/EN) y alertas avanzadas.

**EN:**
Centralized dashboard for real-time monitoring and management of multiple Raspberry Pi devices. Includes user and device administration, historical metrics, real-time updates via WebSockets, internationalization (ES/EN), and advanced alerting.

---

## Estructura del Proyecto / Project Structure

```
backend/
frontend/
docker-compose.yml
README.md
```

---

## Requisitos / Requirements

**ES:**
- Docker y Docker Compose
- Node.js y npm (para desarrollo local del frontend)

**EN:**
- Docker and Docker Compose
- Node.js and npm (for local frontend development)

---

## Instalación y Despliegue / Installation & Deployment

**ES:**
1. Clona el repositorio y entra en el directorio.
2. (Opcional) Para desarrollo local del frontend:
   ```bash
   cd frontend
   npm install
   ```
3. Configura las variables de entorno en `backend/.env` y `frontend/.env` (ver archivos de ejemplo).
4. Construye e inicia los servicios:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
5. Accede al dashboard en [http://localhost](http://localhost).

**EN:**
1. Clone the repository and enter the directory.
2. (Optional) For local frontend development:
   ```bash
   cd frontend
   npm install
   ```
3. Configure environment variables in `backend/.env` and `frontend/.env` as needed (see sample files).
4. Build and start the services:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
5. Access the dashboard at [http://localhost](http://localhost).

---

## Uso / Usage

**ES:**
- Inicia sesión con tus credenciales locales (creadas por un admin).
- Monitorea el estado de todos los dispositivos Raspberry Pi en tiempo real.
- Administra dispositivos y usuarios desde el panel de administración.
- Cambia el idioma de la interfaz (ES/EN) desde el selector de idioma.
- Recibe alertas críticas por Telegram (si está configurado).

**EN:**
- Log in with your local user credentials (created by an admin).
- Monitor the status of all Raspberry Pi devices in real time.
- Administer devices and users from the admin panel.
- Switch interface language (ES/EN) from the language selector.
- Receive critical alerts via Telegram (if configured).

---

## Características / Features

- **ES:**
  - **Monitoreo de Dispositivos:** Estado, métricas y logs en tiempo real para cada dispositivo.
  - **Admin. de Usuarios y Dispositivos:** Agrega, edita y elimina usuarios y dispositivos. Unicidad de usuario/IP garantizada.
  - **Internacionalización:** Interfaz completamente traducida (Español/Inglés).
  - **WebSockets:** Actualizaciones en vivo de estado y alertas.
  - **Alertas:** Integración con Telegram para notificaciones críticas.
  - **Acceso por Roles:** Solo los administradores pueden gestionar usuarios/dispositivos.

- **EN:**
  - **Device Monitoring:** Real-time status, metrics, and logs for each device.
  - **User & Device Admin:** Add, edit, and remove users and devices. Enforced uniqueness for usernames and device IPs.
  - **Internationalization:** Fully translated interface (Spanish/English).
  - **WebSockets:** Live updates for device status and alerts.
  - **Alerting:** Telegram integration for critical notifications.
  - **Role-based Access:** Only admins can manage users/devices.

---

## Configuración Avanzada / Advanced Configuration

- **ES:**
  - **Alertas Telegram:** Configura `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en `backend/.env`.
  - **Internacionalización:** Agrega/modifica archivos de traducción en `frontend/src/locales/`.
  - **WebSockets:** Las actualizaciones en tiempo real requieren puertos WebSocket abiertos.

- **EN:**
  - **Telegram Alerts:** Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `backend/.env`.
  - **Internationalization:** Add/modify translation files in `frontend/src/locales/`.
  - **WebSockets:** Real-time updates require open WebSocket ports.

---

## Seguridad y Roles / Security & Roles

- **ES:**
  - Solo usuarios autenticados pueden acceder al dashboard.
  - Solo los administradores pueden gestionar usuarios y dispositivos.
  - Los roles se asignan desde el panel de administración.

- **EN:**
  - Only authenticated users can access the dashboard.
  - Only admins can manage users and devices.
  - Roles are assigned via the admin panel.

---

## Logs y Manejo de Errores / Logging & Error Handling

- **ES:**
  - El backend usa el módulo `logging` de Python para todos los endpoints y utilidades.
  - Todas las acciones críticas (crear, actualizar, eliminar, alertar) se registran con niveles `info`, `warning` o `error`.
  - Los errores siempre se registran y se devuelven como respuestas JSON claras, nunca como errores 500 sin formato.
  - CORS está habilitado globalmente; si ves errores CORS, revisa los logs del backend.

- **EN:**
  - The backend uses Python's `logging` module for all endpoints and utilities.
  - All critical actions (create, update, delete, alert) are logged with `info`, `warning`, or `error` levels.
  - Errors are always logged and returned as clear JSON responses, never as raw 500 errors.
  - CORS is enabled globally; if you see CORS errors, check for backend exceptions in the logs.

---

## Troubleshooting

- **ES:**
  - Si el frontend está en blanco, revisa la consola del navegador y los logs de Docker.
  - Si el login falla, asegúrate de usar un usuario y contraseña válidos.
  - Si las alertas de Telegram no llegan, verifica el token y chat ID.
  - Si ves errores CORS, revisa los logs del backend.

- **EN:**
  - If the frontend is blank, check browser console and Docker logs.
  - If login fails, ensure you are using a valid local username and password.
  - If Telegram alerts do not arrive, verify your bot token and chat ID.
  - If you see CORS errors, check backend logs for exceptions or 500 errors.

---

## Licencia / License

MIT License. Developed by rotoapanta.

---

## Contribución / Contributing

**ES:**
¡Pull requests y sugerencias son bienvenidos! Consulta la carpeta `docs/` para documentación avanzada y guías de contribución.

**EN:**
Pull requests and suggestions are welcome! See the `docs/` folder for advanced documentation and contribution guidelines.
