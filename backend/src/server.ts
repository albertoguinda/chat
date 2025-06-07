// backend/src/server.ts

import express, { Request, Response } from "express";
import cors from "cors";
import { MongoClient, Collection } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// ------- 1) INTERFACES -------
interface User {
  user: string;
  passwordHash: string;
  avatar: string;
}

// Objeto que almacenaremos para cada cliente WS
type ClientInfo = {
  user: string;
  avatar: string;
  channel: string;
  ws: WebSocket;
};

interface WSMessage {
  type: string;
  user?: string;
  avatar?: string;
  channel?: string;
  text?: string;
  token?: string;
}

// ------- 2) CONSTANTES DE CONFIGURACIÓN -------

// URL de MongoDB (puedes sobreescribir con la variable de entorno MONGO_URL)
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";

// Nombre de la base de datos
const DATABASE_NAME = "chatdb";

// Clave secreta para firmar JWT (en producción: almacénala en un secreto seguro)
const JWT_SECRET =
  process.env.JWT_SECRET || "CAMBIA_ESTA_CLAVE_POR_ALGO_MUY_SEGURO";

// Puerto para el servidor HTTP (Express + REST API)
const HTTP_PORT = 3000;

// Puerto para WebSocket (aunque lo levantamos sobre el mismo HTTP server, 
// internamente escuchará en ws://localhost:8080 para las conexiones WS)
const WS_PORT = 8080;

// ------- 3) FUNCIÓN PRINCIPAL -------

async function main() {
  // 3.1) Conectar a MongoDB
  let mongoClient: MongoClient;
  try {
    mongoClient = new MongoClient(MONGO_URL);
    await mongoClient.connect();
    console.log("✅ Conectado a MongoDB en", MONGO_URL);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  }
  const db = mongoClient.db(DATABASE_NAME);
  const usersCollection = db.collection<User>("users");

  // 3.2) Crear aplicación Express
  const app = express();
  app.use(cors());         // Permitir solicitudes CORS desde el frontend (puerto distinto)
  app.use(express.json()); // Parsear JSON en el body (reemplaza a body-parser)

  // —— RUTA: Registro de usuario ——
  // Recibe { user, password, avatar } en el body y crea un nuevo documento en Mongo
  app.post(
    "/api/register",
    async (req: Request<{}, {}, { user: string; password: string; avatar: string }>, res: Response) => {
      const { user, password, avatar } = req.body;
      if (!user || !password || !avatar) {
        return res
          .status(400)
          .json({ error: "Faltan datos (user, password, avatar)" });
      }

      try {
        // 1) Verificar si ya existe
        const existing = await usersCollection.findOne({ user });
        if (existing) {
          return res.status(400).json({ error: "El usuario ya existe" });
        }

        // 2) Hashear la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3) Insertar en la colección
        await usersCollection.insertOne({ user, passwordHash, avatar });
        console.log(`📝 Usuario registrado: ${user}`);
        return res
          .status(201)
          .json({ message: "Usuario registrado correctamente" });
      } catch (err) {
        console.error("❌ Error en /api/register:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  );

  // —— RUTA: Login de usuario ——
  // Recibe { user, password } y devuelve { token } si las credenciales son correctas
  app.post(
    "/api/login",
    async (req: Request<{}, {}, { user: string; password: string }>, res: Response) => {
      const { user, password } = req.body;
      if (!user || !password) {
        return res.status(400).json({ error: "Faltan datos (user, password)" });
      }

      try {
        // 1) Buscar usuario en la colección
        const existing = await usersCollection.findOne({ user });
        if (!existing) {
          return res.status(400).json({ error: "Usuario no encontrado" });
        }

        // 2) Comparar hash
        const passwordMatch = await bcrypt.compare(
          password,
          existing.passwordHash
        );
        if (!passwordMatch) {
          return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 3) Generar JWT con payload { user, avatar }
        const token = jwt.sign(
          { user: existing.user, avatar: existing.avatar },
          JWT_SECRET,
          { expiresIn: "8h" }
        );
        console.log(`🔑 Usuario logueado: ${user}`);
        return res.json({ token });
      } catch (err) {
        console.error("❌ Error en /api/login:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  );

  // —— RUTA de Salud (opcional) ——
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // 3.3) Arrancar servidor HTTP (Express) en el puerto 3000
  const httpServer = createServer(app);
  httpServer.listen(HTTP_PORT, () => {
    console.log(`🚀 HTTP API listening on port ${HTTP_PORT}`);
  });

  // 3.4) Crear WebSocketServer usando el mismo httpServer
  const wss = new WebSocketServer({ server: httpServer });
  setupWebSocket(wss);

  console.log(`🚀 WebSocket server listening on ws://localhost:${WS_PORT}`);
}

//
// Función para gestionar conexiones WebSocket
//
function setupWebSocket(wss: WebSocketServer) {
  const clients: ClientInfo[] = [];

  wss.on("connection", (ws: WebSocket) => {
    let thisClient: ClientInfo | null = null;

    ws.on("message", async (data) => {
      let msg: WSMessage;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }

      // — 1) Mensaje de autenticación (JWT) —
      if (msg.type === "auth" && msg.token) {
        try {
          const payload = jwt.verify(msg.token, JWT_SECRET) as any;
          // payload = { user: string, avatar: string, iat, exp }
          thisClient = {
            user: payload.user,
            avatar: payload.avatar,
            channel: payload.channel || "general",
            ws,
          };
          clients.push(thisClient);
          broadcastConnectedUsers();
        } catch {
          ws.close();
        }
        return;
      }

      // Si aún no se autenticó, cortamos conexión
      if (!thisClient) {
        ws.close();
        return;
      }

      // — 2) Mensaje de “join” —
      if (msg.type === "join") {
        broadcastSystem(`${thisClient.user} se ha unido`);
        return;
      }

      // — 3) Mensaje de chat “message” —
      if (msg.type === "message" && msg.text) {
        const outgoing = JSON.stringify({
          type: "message",
          user: thisClient.user,
          avatar: thisClient.avatar,
          text: msg.text,
        });
        clients.forEach((c) => c.ws.send(outgoing));
        return;
      }

      // — 4) Mensaje “typing” —
      if (msg.type === "typing") {
        const outgoing = JSON.stringify({ type: "typing", user: thisClient.user });
        clients.forEach((c) => {
          if (c !== thisClient) c.ws.send(outgoing);
        });
        return;
      }
    });

    ws.on("close", () => {
      if (thisClient) {
        const idx = clients.findIndex(
          (c) => c.user === thisClient!.user && c.ws === thisClient!.ws
        );
        if (idx !== -1) clients.splice(idx, 1);
        broadcastSystem(`${thisClient.user} ha salido`);
        broadcastConnectedUsers();
      }
    });
  });

  // Enviar mensajes “system” a todos
  function broadcastSystem(text: string) {
    const outgoing = JSON.stringify({ type: "system", text });
    clients.forEach((c) => c.ws.send(outgoing));
  }

  // Enviar lista actualizada de usuarios conectados
  function broadcastConnectedUsers() {
    const userList = clients.map((c) => ({ user: c.user, avatar: c.avatar }));
    const outgoing = JSON.stringify({ type: "connectedUsers", users: userList });
    clients.forEach((c) => c.ws.send(outgoing));
  }
}

// Arrancar la aplicación
main().catch((err) => {
  console.error("❌ Error en main():", err);
  process.exit(1);
});
