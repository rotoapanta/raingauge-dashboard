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

## Troubleshooting

- If the frontend is blank, check browser console and Docker logs.
- If login fails, ensure you are using a valid local username and password.
- If Telegram alerts do not arrive, verify your bot token and chat ID.

---

## License

MIT License. Developed by rotoapanta.

---

## Contributing

Pull requests and suggestions are welcome!
See the `docs/` folder for advanced documentation and contribution guidelines.
