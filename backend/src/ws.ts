import { WebSocketServer, WebSocket } from "ws";
import { ChatService } from "./services/chat";
import { AuthService } from "./services/users/AuthService";
import type { ClientInfo, Message } from "./types";

export function setupWebSocket(wss: WebSocketServer) {
  const chat = new ChatService();
  const authService = new AuthService();

  wss.on("connection", (ws: WebSocket) => {
    let clientInfo: ClientInfo | null = null;
    let authenticatedUser: string | null = null;

    ws.on("message", async (data) => {
      const msg = JSON.parse(data.toString()) as Message;

      if (msg.type === "auth" && !authenticatedUser) {
        const result = await authService.verify(msg.token);
        if (!result) {
          ws.close();
          return;
        }
        authenticatedUser = result.user;
        console.log(`WS autenticado: ${authenticatedUser}`);
        return;
      }

      // Si no está autenticado, no procesamos más
      if (!authenticatedUser) {
        ws.close();
        return;
      }

      if (msg.type === "join" && !clientInfo) {
        clientInfo = { user: msg.user, avatar: msg.avatar, channel: msg.channel };
        await chat.addClient(clientInfo, ws);
        await chat.sendHistory(ws, clientInfo.channel);
        return;
      }

      if (clientInfo) {
        await chat.handleMessage(clientInfo, msg);
      }
    });

    ws.on("close", async () => {
      if (clientInfo) {
        await chat.removeClient(clientInfo.user);
        await chat.broadcastSystem(`${clientInfo.user} ha salido`);
      }
    });
  });
}
