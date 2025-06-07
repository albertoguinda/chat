import { useState } from "react";
import axios from "axios";

interface LoginProps {
  onAuth: (token: string, user: string, avatar: string) => void;
}

export default function Login({ onAuth }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("🙂");

  const handleSubmit = async () => {
    try {
      if (mode === "register") {
        await axios.post("http://localhost:3000/register", { user, password, avatar });
      }
      const res = await axios.post("http://localhost:3000/login", { user, password });
      const { token, avatar: savedAvatar } = res.data;
      onAuth(token, user, savedAvatar);
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-100">
      <h1 className="text-2xl font-bold">Moontech Chat Pro</h1>
      <input className="border p-2" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
      <input className="border p-2" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {mode === "register" && (
        <input className="border p-2" placeholder="Avatar Emoji" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
      )}
      <button className="bg-indigo-500 text-white p-2 rounded" onClick={handleSubmit}>
        {mode === "login" ? "Entrar" : "Registrar"}
      </button>
      <button className="text-sm underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        Cambiar a {mode === "login" ? "Registro" : "Login"}
      </button>
    </div>
  );
}
