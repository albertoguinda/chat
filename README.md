# Moontech Technical Challenge

Chat Full-Stack Real-Time con WebSockets + React + Node.js + Vite

---

## Tecnologías utilizadas

- Node.js (Backend puro)
- WebSockets (sin frameworks)
- React 18 (Frontend)
- Vite (Frontend bundler)
- TailwindCSS (Estilado moderno)
- HeroUI (Component Library)
- TypeScript (Full Type-Safe)
- Framer Motion (Animaciones)
- Giphy API (GIF Search)
- Hooks personalizados (WebSocket, debounce)
- Modular architecture (backend y frontend desacoplados)
- Monorepo (Workspaces)

---

## Estructura del proyecto

/backend
└── src
├── server.ts
├── ws.ts
├── types.ts
└── services/chat.ts

/frontend
└── src
├── components
├── hooks
├── types
├── pages
└── styles

yaml
Copiar
Editar

---

## Instalación y ejecución

### 1️⃣ Clonar el proyecto

```bash
git clone <repositorio>
cd chat
2️⃣ Instalar dependencias
bash
Copiar
Editar
npm install
(usa workspaces para instalar todo de golpe)

3️⃣ Ejecutar proyecto (monorepo)
bash
Copiar
Editar
npm run dev
Esto arrancará:

Backend (WebSocket Server en ws://localhost:8080)

Frontend (Vite en http://localhost:5173)

Funcionalidades implementadas
Login básico con nombre de usuario + avatar emoji

Chat realtime multicanal via WebSockets

Gestión de usuarios conectados

Detección de "está escribiendo..."

Subida de imágenes (base64)

Selector de GIFs vía Giphy API

Sonidos al enviar y recibir mensajes

Scroll automático de conversación

Reconexión automática de sockets

Código modularizado y extensible

Consideraciones técnicas
He priorizado una arquitectura escalable y mantenible, separando claramente responsabilidades.

El backend permite extensión sencilla para añadir persistencia (MongoDB) si fuera necesario.

El frontend está totalmente modularizado en hooks, componentes y tipado seguro.

Pensado para producción, no como demo de prácticas.

Contacto
Desarrollado por: Alberto