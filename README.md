[![Python](https://img.shields.io/badge/Python-3.11-brightgreen)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue)](https://www.docker.com/)
[![Linux](https://img.shields.io/badge/Linux-Supported-brightgreen)](https://www.linux.org/)
[![GitHub issues](https://img.shields.io/github/issues/rotoapanta/raspberry-pi-dashboard)](https://github.com/rotoapanta/raspberry-pi-dashboard/issues)
[![GitHub repo size](https://img.shields.io/github/repo-size/rotoapanta/raspberry-pi-dashboard)](https://github.com/rotoapanta/raspberry-pi-dashboard)
[![GitHub last commit](https://img.shields.io/github/last-commit/rotoapanta/raspberry-pi-dashboard)](https://github.com/rotoapanta/raspberry-pi-dashboard/commits/main)
[![GitHub forks](https://img.shields.io/github/forks/rotoapanta/raspberry-pi-dashboard?style=social)](https://github.com/rotoapanta/raspberry-pi-dashboard/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Author](https://img.shields.io/badge/Roberto%20Toapanta-Linkedin-blue)](https://www.linkedin.com/in/roberto-carlos-toapanta-g/)

# <p align="center">Raspberry Pi Dashboard</p>

---

# 🇬🇧 English

## Overview
Centralized dashboard for real-time monitoring and management of multiple Raspberry Pi devices. Includes user and device administration, historical metrics, real-time updates via WebSockets, internationalization (ES/EN), and advanced alerting.

## Project Structure
```
backend/
frontend/
docker-compose.yml
README.md
```

## Requirements
- 🐳 Docker and Docker Compose
- 🟢 Node.js and npm (for local frontend development)

## Installation & Deployment
1. 📥 Clone the repository and enter the directory.
2. (Optional) For local frontend development:
   ```bash
   cd frontend
   npm install
   ```
3. 🔧 Configure environment variables in `backend/.env` and `frontend/.env` as needed (see sample files).
4. 🏗️ Build and start the services:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
5. 🌐 Access the dashboard at [http://localhost](http://localhost).

## JWT_SECRET Configuration
The backend uses the `JWT_SECRET` environment variable to sign and verify authentication JWT tokens. You must define a long, random, secure value in `backend/.env`:
```
JWT_SECRET=Qw8f2k3l9s8d7f6g5h4j3k2l1m0n9b8v7c6x5z4a3s2d1f0g9h8j7k6l5m4n3b2v
```
You can generate a secure value with:
```
python3 -c 'import secrets; print(secrets.token_urlsafe(32))'
```
If you change JWT_SECRET, all users will need to log in again. Never commit your real `.env` to the repository.

## Creating the first admin user
After starting the services, create the first admin user by running the following command:
```bash
# Enter the backend container
sudo docker exec -it raingauge-backend bash
# Inside the container, run:
python3 create_local_user.py
```
Follow the prompts to enter the username, password, and role (use `admin` for the first user).

## Usage
- 🔑 Log in with your local user credentials (created by an admin).
- 📊 Monitor the status of all Raspberry Pi devices in real time.
- 🛠️ Administer devices and users from the admin panel.
- 🌐 Switch interface language (ES/EN) from the language selector.
- 🔔 Receive critical alerts via Telegram (if configured).

## Features
- 📊 **Device Monitoring:** Real-time status, metrics, and logs for each device.
- 👤 **User & Device Admin:** Add, edit, and remove users and devices. Enforced uniqueness for usernames and device IPs.
- 🌐 **Internationalization:** Fully translated interface (Spanish/English).
- ⚡ **WebSockets:** Live updates for device status and alerts.
- 🔔 **Alerting:** Telegram integration for critical notifications.
- 🛡️ **Role-based Access:** Only admins can manage users/devices.

## Advanced Configuration
- 🔔 **Telegram Alerts:** Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `backend/.env`.
- 🌐 **Internationalization:** Add/modify translation files in `frontend/src/locales/`.
- ⚡ **WebSockets:** Real-time updates require open WebSocket ports.

## Security & Roles
- 🔒 Only authenticated users can access the dashboard.
- 👑 Only admins can manage users and devices.
- 🏷️ Roles are assigned via the admin panel.

## Logging & Error Handling
- 🪵 The backend uses Python's `logging` module for all endpoints and utilities.
- ⚠️ All critical actions (create, update, delete, alert) are logged with `info`, `warning`, or `error` levels.
- ❗ Errors are always logged and returned as clear JSON responses, never as raw 500 errors.
- 🌐 CORS is enabled globally; if you see CORS errors, check for backend exceptions in the logs.

## Troubleshooting
- 🖥️ If the frontend is blank, check browser console and Docker logs.
- 🔑 If login fails, ensure you are using a valid local username and password.
- 🔔 If Telegram alerts do not arrive, verify your bot token and chat ID.
- 🌐 If you see CORS errors, check backend logs for exceptions or 500 errors.

## License
MIT License. Developed by rotoapanta.

## Contributing
Pull requests and suggestions are welcome! See the `docs/` folder for advanced documentation and contribution guidelines.

---

# 🇪🇸 Español

## Resumen
Dashboard centralizado para el monitoreo y gestión en tiempo real de múltiples dispositivos Raspberry Pi. Incluye administración de usuarios y dispositivos, métricas históricas, actualizaciones en tiempo real vía WebSockets, internacionalización (ES/EN) y alertas avanzadas.

## Estructura del Proyecto
```
backend/
frontend/
docker-compose.yml
README.md
```

## Requisitos
- 🐳 Docker y Docker Compose
- 🟢 Node.js y npm (para desarrollo local del frontend)

## Instalación y Despliegue
1. 📥 Clona el repositorio y entra en el directorio.
2. (Opcional) Para desarrollo local del frontend:
   ```bash
   cd frontend
   npm install
   ```
3. 🔧 Configura las variables de entorno en `backend/.env` y `frontend/.env` (ver archivos de ejemplo).
4. 🏗️ Construye e inicia los servicios:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
5. 🌐 Accede al dashboard en [http://localhost](http://localhost).

## Configuración de JWT_SECRET
El backend usa la variable de entorno `JWT_SECRET` para firmar y verificar los tokens JWT de autenticación. Debes definir un valor largo, aleatorio y seguro en `backend/.env`:
```
JWT_SECRET=Qw8f2k3l9s8d7f6g5h4j3k2l1m0n9b8v7c6x5z4a3s2d1f0g9h8j7k6l5m4n3b2v
```
Puedes generar un valor seguro con:
```
python3 -c 'import secrets; print(secrets.token_urlsafe(32))'
```
Si cambias el JWT_SECRET, todos los usuarios deberán volver a iniciar sesión. Nunca subas tu `.env` real al repositorio.

## Creación del primer usuario admin
Después de iniciar los servicios, crea el primer usuario administrador ejecutando el siguiente comando:
```bash
# Entra al contenedor backend
sudo docker exec -it raingauge-backend bash
# Dentro del contenedor, ejecuta:
python3 create_local_user.py
```
Sigue las instrucciones para ingresar el nombre de usuario, contraseña y rol (usa `admin` para el primer usuario).

## Uso
- 🔑 Inicia sesión con tus credenciales locales (creadas por un admin).
- 📊 Monitorea el estado de todos los dispositivos Raspberry Pi en tiempo real.
- 🛠️ Administra dispositivos y usuarios desde el panel de administración.
- 🌐 Cambia el idioma de la interfaz (ES/EN) desde el selector de idioma.
- 🔔 Recibe alertas críticas por Telegram (si está configurado).

## Características
- 📊 **Monitoreo de Dispositivos:** Estado, métricas y logs en tiempo real para cada dispositivo.
- 👤 **Admin. de Usuarios y Dispositivos:** Agrega, edita y elimina usuarios y dispositivos. Unicidad de usuario/IP garantizada.
- 🌐 **Internacionalización:** Interfaz completamente traducida (Español/Inglés).
- ⚡ **WebSockets:** Actualizaciones en vivo de estado y alertas.
- 🔔 **Alertas:** Integración con Telegram para notificaciones críticas.
- 🛡️ **Acceso por Roles:** Solo los administradores pueden gestionar usuarios/dispositivos.

## Configuración Avanzada
- 🔔 **Alertas Telegram:** Configura `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en `backend/.env`.
- 🌐 **Internacionalización:** Agrega/modifica archivos de traducción en `frontend/src/locales/`.
- ⚡ **WebSockets:** Las actualizaciones en tiempo real requieren puertos WebSocket abiertos.

## Seguridad y Roles
- 🔒 Solo usuarios autenticados pueden acceder al dashboard.
- 👑 Solo los administradores pueden gestionar usuarios y dispositivos.
- 🏷️ Los roles se asignan desde el panel de administración.

## Logs y Manejo de Errores
- 🪵 El backend usa el módulo `logging` de Python para todos los endpoints y utilidades.
- ⚠️ Todas las acciones críticas (crear, actualizar, eliminar, alertar) se registran con niveles `info`, `warning` o `error`.
- ❗ Los errores siempre se registran y se devuelven como respuestas JSON claras, nunca como errores 500 sin formato.
- 🌐 CORS está habilitado globalmente; si ves errores CORS, revisa los logs del backend.

## Troubleshooting
- 🖥️ Si el frontend está en blanco, revisa la consola del navegador y los logs de Docker.
- 🔑 Si el login falla, asegúrate de usar un usuario y contraseña válidos.
- 🔔 Si las alertas de Telegram no llegan, verifica el token y chat ID.
- 🌐 Si ves errores CORS, revisa los logs del backend.

## Licencia
MIT License. Desarrollado por rotoapanta.

## Contribución
¡Pull requests y sugerencias son bienvenidos! Consulta la carpeta `docs/` para documentación avanzada y guías de contribución.
