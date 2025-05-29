# 🌧️ RainGauge Dashboard

RainGauge Dashboard es una aplicación de monitoreo para estaciones meteorológicas con Raspberry Pi. Proporciona una interfaz web que permite visualizar el estado del sistema, controlar remotamente el equipo y consultar el historial de conexión.

## 📦 Estructura del Proyecto

raingauge-dashboard/
├── backend/
│ ├── services/
│ ├── background/
│ └── main.py
├── frontend/
│ ├── src/
│ ├── Dashboard.tsx
│ └── ...
├── docker-compose.yml
└── README.md


## 🚀 Funcionalidades

- Monitoreo en tiempo real:
  - CPU, RAM y Disco
  - Temperatura del CPU
  - Estado de la batería (voltaje y nivel)
  - IP y nombre del host
- Estado de conectividad (Online / Offline)
- Registro de eventos de conexión / desconexión
- Botones para reinicio y terminal remota (próximamente)

## 🐳 Cómo levantar el sistema con Docker

```bash
docker compose up --build -d
```

## 🌐 Acceso

- **Frontend:** [http://localhost](http://localhost)
- **Backend API:** [http://localhost:8000/status](http://localhost:8000/status)

---

## ⚙️ Endpoints REST disponibles

| Método | Endpoint | Descripción                           |
|--------|----------|---------------------------------------|
| GET    | /status  | Estado del sistema (CPU, RAM, etc.)   |
| POST   | /reboot  | Reinicia el dispositivo               |
| GET    | /log     | Muestra historial de conexión         |

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** FastAPI (Python 3.11), psutil, uvicorn  
- **Frontend:** React + TypeScript + TailwindCSS  
- **Contenedores:** Docker, Docker Compose  

---

## 👨‍💻 Autor

Desarrollado por **Roberto Toapanta**

---

## 📄 Licencia

MIT License