# Raingauge Dashboard

Dashboard centralizado para monitoreo en tiempo real de múltiples Raspberry Pi, con autenticación Active Directory, alertas, métricas históricas, WebSockets, internacionalización y panel de administración avanzado.

---

## Estructura del Proyecto

```
backend/
  ├── models.py
  ├── crud.py
  ├── main.py
  ├── requirements.txt
  ├── endpoints/
  ├── auth_utils.py
  └── ...
frontend/
  ├── src/
  │   ├── Dashboard.tsx
  │   ├── i18n.ts
  │   ├── locales/
  │   └── components/
  ├── package.json
  └── ...
docker-compose.yml
README.md
```

---

## Requisitos

- Docker y Docker Compose
- Acceso a Active Directory/LDAP
- Node.js y npm (solo para desarrollo local del frontend)

---

## Instalación y Despliegue

1. Clona el repositorio y entra al directorio.
2. Instala las dependencias de frontend si desarrollas localmente:
   ```bash
   cd frontend
   npm install
   ```
3. Configura las variables de entorno necesarias en `docker-compose.yml`:
   - TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
   - LDAP_SERVER, LDAP_BASE_DN, LDAP_SEARCH_ATTR, JWT_SECRET
4. Construye y levanta los servicios:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
5. Accede al dashboard en [http://localhost](http://localhost).

---

## Uso

- Inicia sesión con tu usuario y contraseña de Active Directory.
- Monitorea el estado de tus Raspberry Pi en tiempo real.
- Administra dispositivos, usuarios y alertas desde el panel de administración.
- Cambia el idioma de la interfaz desde el selector (ES/EN).
- Recibe alertas críticas en Telegram automáticamente.

---

## Configuración avanzada

- **Active Directory:** Edita las variables LDAP en `docker-compose.yml`.
- **Notificaciones Telegram:** Configura el bot y el chat ID en `docker-compose.yml`.
- **Internacionalización:** Agrega archivos en `frontend/src/locales/`.
- **WebSockets:** El dashboard se actualiza en tiempo real sin recargar.

---

## Seguridad y roles

- Solo usuarios autenticados pueden acceder al dashboard.
- Solo administradores pueden gestionar usuarios y dispositivos.
- Los roles se asignan desde el panel de administración.

---

## Troubleshooting

- Si el frontend muestra pantalla en blanco, revisa la consola del navegador y los logs de Docker.
- Si el login falla, asegúrate de usar solo el nombre de usuario de AD (no el correo).
- Si no recibes alertas en Telegram, revisa el token y el chat ID.

---

## Créditos y licencia

Desarrollado por rotoapanta.  
Licencia MIT.

---

## Contribuir

Pull requests y sugerencias son bienvenidas.  
Consulta la documentación en la carpeta `docs/` para detalles avanzados.
