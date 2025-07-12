# Alertas y Notificaciones

## ¿Cómo funcionan las alertas?

- El backend genera una alerta cuando:
  - Un dispositivo está offline.
  - CPU > 90% o temperatura > 70°C.
- Las alertas se guardan en la base de datos y se pueden consultar desde `/devices/alerts`.
- Las alertas activas se muestran en el dashboard y pueden marcarse como resueltas.

## Notificaciones externas

- Cuando se genera una alerta crítica, el backend envía una notificación a Telegram usando el bot configurado.
- Configura el bot y el chat ID en `docker-compose.yml`:
  ```yaml
  environment:
    - TELEGRAM_BOT_TOKEN=...
    - TELEGRAM_CHAT_ID=...
  ```

## Resolución de alertas

- Los administradores pueden marcar alertas como resueltas desde el dashboard.
- Las alertas resueltas se mantienen en el historial para auditoría.

## Personalización de umbrales

- Puedes modificar los umbrales críticos (CPU, temperatura) en el backend para adaptarlos a tus necesidades.

## Ejemplo de alerta en Telegram

```
[ALERTA] raspberrypi (192.168.190.29): Dispositivo offline
```
