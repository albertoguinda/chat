// frontend/src/components/Login.tsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/provider";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("🙂"); // valor por defecto
  const [mode, setMode] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState("");
  const { setToken, setUser, setAvatar: setGlobalAvatar } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setErrorMsg("");
    try {
      if (mode === "register") {
        // Registro
        await axios.post("http://localhost:3000/api/register", {
          user: username,
          password,
          avatar,
        });
      }
      // Login (en ambos casos login después de registro)
      const response = await axios.post("http://localhost:3000/api/login", {
        user: username,
        password,
      });
      const { token: newToken } = response.data;
      // Guardamos en contexto global
      setToken(newToken);
      setUser(username);
      setGlobalAvatar(avatar);
      // Redirigimos al chat
      navigate("/chat");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Error de conexión");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" ? "Entrar al Chat" : "Registro"}
        </h1>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMsg}
          </div>
        )}

        <label className="block mb-2">
          <span className="text-gray-700">Usuario</span>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tu nombre"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Contraseña</span>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {mode === "register" && (
          <label className="block mb-4">
            <span className="text-gray-700">Avatar (Emoji)</span>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: 🐶"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </label>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
        >
          {mode === "login" ? "Entrar" : "Registrar"}
        </button>

        <p className="text-center text-sm text-gray-600">
          {mode === "login"
            ? "¿No tienes cuenta?"
            : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setErrorMsg("");
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {mode === "login" ? "Regístrate" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
