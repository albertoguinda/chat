import { WebSocket } from "ws";
import { connectDB } from "../db";
import type { ClientInfo, Message, UserMessage, TypingMessage } from "../types";

export class ChatService {
  private clients: Map<string, { ws: WebSocket; info: ClientInfo }> = new Map();

  async addClient(info: ClientInfo, ws: WebSocket) {
    this.clients.set(info.user, { ws, info });
    await this.broadcastSystem(`${info.user} se ha unido`);
    await this.broadcastConnectedUsers();
  }

  async removeClient(user: string) {
    this.clients.delete(user);
    await this.broadcastConnectedUsers();
  }

  async broadcastSystem(text: string) {
    const message: Message = { type: "system", text };
    this.broadcast(message);
  }

  async broadcastConnectedUsers() {
    const users = [...this.clients.values()].map((c) => ({
      user: c.info.user,
      avatar: c.info.avatar,
    }));

    const message = {
      type: "connectedUsers",
      users
    };

    for (const { ws } of this.clients.values()) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: Message) {
    for (const { ws } of this.clients.values()) {
      ws.send(JSON.stringify(message));
    }
  }

  async handleMessage(info: ClientInfo, msg: Message) {
    if (msg.type === "message") {
      const userMsg: UserMessage = {
        type: "message",
        user: info.user,
        text: msg.text
      };

      this.broadcast(userMsg);
      await this.saveMessage(info.channel, userMsg);
    }

    if (msg.type === "typing") {
      const typingMsg: TypingMessage = {
        type: "typing",
        user: info.user
      };
      this.broadcast(typingMsg);
    }
  }

  async sendHistory(ws: WebSocket, channel: string) {
    const db = await connectDB();
    const messages = await db.collection("messages")
      .find({ channel })
      .sort({ _id: 1 })
      .toArray();

    for (const msg of messages) {
      ws.send(JSON.stringify(msg));
    }
  }

  async saveMessage(channel: string, msg: UserMessage) {
    const db = await connectDB();
    await db.collection("messages").insertOne({ ...msg, channel });
  }
}
