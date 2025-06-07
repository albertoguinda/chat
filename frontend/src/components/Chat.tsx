// frontend/src/components/Chat.tsx
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { motion, AnimatePresence } from "framer-motion";
import UserList from "./UserList";
import { useDebounce } from "@/hooks/useDebounce";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useAuth } from "@/provider";
import type { Message, UserMessage } from "@/types";

export default function Chat() {
  const { token, user, avatar, channel } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [users, setUsers] = useState<{ user: string; avatar: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const { send } = useChatSocket({
    token,
    user,
    avatar,
    channel,
    onMessage: (msg) => {
      if (msg.type === "connectedUsers" && Array.isArray(msg.users)) {
        setUsers(msg.users);
      } else if (msg.type === "typing" && msg.user !== user) {
        setTyping(msg.user);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(null), 2000);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    send({ type: "message", user, text: input.trim() });
    setInput("");
  };

  const debouncedTyping = useDebounce(() => {
    send({ type: "typing", user });
  }, 400);

  const handleTyping = () => {
    debouncedTyping();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-white">
      <aside className="p-4 border-r bg-white">
        <h3 className="font-semibold mb-2">Usuarios conectados:</h3>
        {users.map(({ user, avatar }, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-1">
            <div className="text-xl">{avatar}</div>
            <span>{user}</span>
          </div>
        ))}
      </aside>

      <div className="flex flex-col flex-1">
        <header className="bg-indigo-600 text-white p-4 flex items-center gap-2 shadow-md">
          <div className="text-3xl">{avatar}</div>
          <h2 className="text-lg font-semibold">Canal: {channel}</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className={`p-3 ${msg.type === "system" ? "bg-gray-200 text-center italic" : ""}`}>
                  <CardBody className="flex items-start gap-2">
                    {msg.type !== "system" && <div className="text-xl">{avatar}</div>}
                    <div>
                      <span className="font-semibold">{(msg as UserMessage).user}:</span>{" "}
                      <span>{(msg as UserMessage).text}</span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </main>

        {typing && <div className="text-sm italic text-gray-500 px-4 pb-2">{typing} está escribiendo...</div>}

        <footer className="p-4 bg-white flex gap-2 shadow-inner border-t">
          <Input
            value={input}
            placeholder="Escribe un mensaje..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
              else handleTyping();
            }}
          />
          <Button disabled={!input.trim()} onClick={handleSend}>
            Enviar
          </Button>
        </footer>
      </div>
    </div>
  );
}
