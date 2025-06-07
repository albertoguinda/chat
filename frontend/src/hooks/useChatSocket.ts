import { useRef, useEffect, useState } from "react";
import type { Message } from "@/types";

interface ChatSocketProps {
  token: string;
  user: string;
  channel: string;
  avatar: string;
  onMessage: (msg: Message) => void;
}

export function useChatSocket({ token, user, channel, avatar, onMessage }: ChatSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", token }));
      ws.send(JSON.stringify({ type: "join", user, channel, avatar }));
    };

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      onMessage(msg);
    };

    ws.onclose = () => setTimeout(connect, 2000);
  };

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [user, channel]);

  const send = (msg: Message) => {
    wsRef.current?.send(JSON.stringify(msg));
  };

  return { send };
}
