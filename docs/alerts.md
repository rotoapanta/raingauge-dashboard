# Alertas y Notificaciones / Alerts and Notifications

## ¿Cómo funcionan las alertas? / How do alerts work?

- El backend genera una alerta cuando:  
  The backend generates an alert when:
  - Un dispositivo está offline.  
    A device is offline.
  - CPU > 90% o temperatura > 70°C.  
    CPU > 90% or temperature > 70°C.
- Las alertas se guardan en la base de datos y se pueden consultar desde `/devices/alerts`.  
  Alerts are stored in the database and can be queried from `/devices/alerts`.
- Las alertas activas se muestran en el dashboard y pueden marcarse como resueltas.  
  Active alerts are shown in the dashboard and can be marked as resolved.

## Notificaciones externas / External notifications

- Cuando se genera una alerta crítica, el backend envía una notificación a Telegram usando el bot configurado.  
  When a critical alert is generated, the backend sends a notification to Telegram using the configured bot.
- Configura el bot y el chat ID en `docker-compose.yml`:  
  Configure the bot and chat ID in `docker-compose.yml`:
  ```yaml
  environment:
    - TELEGRAM_BOT_TOKEN=...
    - TELEGRAM_CHAT_ID=...
  ```

## Resolución de alertas / Alert resolution

- Los administradores pueden marcar alertas como resueltas desde el dashboard.  
  Administrators can mark alerts as resolved from the dashboard.
- Las alertas resueltas se mantienen en el historial para auditoría.  
  Resolved alerts are kept in the history for auditing.

## Personalización de umbrales / Threshold customization

- Puedes modificar los umbrales críticos (CPU, temperatura) en el backend para adaptarlos a tus necesidades.  
  You can modify the critical thresholds (CPU, temperature) in the backend to suit your needs.

## Ejemplo de alerta en Telegram / Example of a Telegram alert

```
🔴❌ Raspberry Pi 192.168.190.29 (raspberrypi) está OFFLINE.
🔴❌ Raspberry Pi 192.168.190.29 (raspberrypi) is OFFLINE.
```
