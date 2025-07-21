# Raingauge Dashboard

Centralized dashboard for real-time monitoring and management of multiple Raspberry Pi devices. Includes user and device administration, historical metrics, real-time updates via WebSockets, internationalization (ES/EN), and advanced alerting.

---

## Project Structure

```
backend/
  ├── main.py
  ├── crud.py
  ├── models.py
  ├── endpoints/
  ├── services/
  ├── utils.py
  ├── auth_utils.py
  ├── ...
frontend/
  ├── src/
  │   ├── Dashboard.tsx
  │   ├── components/
  │   ├── locales/
  │   └── ...
  ├── package.json
  └── ...
docker-compose.yml
README.md
```

---

## Requirements

- Docker and Docker Compose
- Node.js and npm (for local frontend development)

---

## Installation & Deployment

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

## Usage

- Log in with your local user credentials (created by an admin).
- Monitor the status of all Raspberry Pi devices in real time.
- Administer devices and users from the admin panel.
- Switch interface language (ES/EN) from the language selector.
- Receive critical alerts via Telegram (if configured).

---

## Features

- **Device Monitoring:** Real-time status, metrics, and logs for each device.
- **User & Device Admin:** Add, edit, and remove users and devices. Enforced uniqueness for usernames and device IPs.
- **Internationalization:** Fully translated interface (Spanish/English). Easily extendable.
- **WebSockets:** Live updates for device status and alerts.
- **Alerting:** Telegram integration for critical notifications.
- **Role-based Access:** Only admins can manage users/devices.

---

## Advanced Configuration

- **Telegram Alerts:** Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `backend/.env`.
- **Internationalization:** Add/modify translation files in `frontend/src/locales/`.
- **WebSockets:** Real-time updates require open WebSocket ports.

---

## Security & Roles

- Only authenticated users can access the dashboard.
- Only admins can manage users and devices.
- Roles are assigned via the admin panel.

---

## Logging & Error Handling

- The backend uses Python's `logging` module for all endpoints and utilities.
- All critical actions (create, update, delete, alert) are logged with `info`, `warning`, or `error` levels.
- Errors are always logged and returned as clear JSON responses, never as raw 500 errors.
- CORS is enabled globally; if you see CORS errors, check for backend exceptions in the logs.

---

## Telegram Alerts: Best Practices & Customization

- **Safe Message Formatting:**
  - Always check that fields are not `None` before including them in alert messages.
  - If using Markdown, escape special characters to avoid Telegram parse errors.
  - Example for user creation:
    ```python
    def escape_markdown(text):
        if not text:
            return "-"
        return str(text).replace("_", "\\_").replace("*", "\\*").replace("[", "\\[").replace("]", "\\]").replace("`", "\\`")

    msg = (
        "👤🆕 *Nuevo usuario creado*\n"
        f"• Nombre: {escape_markdown(getattr(user_obj, 'name', '-'))}\n"
        f"• Usuario: {escape_markdown(user_obj.username)}\n"
        f"• Rol: {escape_markdown(getattr(user_obj, 'role', '-'))}\n"
        f"• Creado por: {escape_markdown(admin.username)}"
    )
    await send_telegram_alert(msg, parse_mode="MarkdownV2")
    ```
- **Keep It Simple:** If you want maximum reliability, use plain text messages with only essential fields.
- **Do Not Access Data After Deletion:** Always gather all info for the alert before deleting a user or device.
- **Test Alerts:** Use a test chat or group to verify alert formatting before deploying to production.

---

## Troubleshooting

- If the frontend is blank, check browser console and Docker logs.
- If login fails, ensure you are using a valid local username and password.
- If Telegram alerts do not arrive, verify your bot token and chat ID.
- If you see CORS errors, check backend logs for exceptions or 500 errors.

---

## License

MIT License. Developed by rotoapanta.

---

## Contributing

Pull requests and suggestions are welcome!
See the `docs/` folder for advanced documentation and contribution guidelines.
