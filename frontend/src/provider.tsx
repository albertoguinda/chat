import { createContext, useContext, useState, ReactNode } from "react";

// Definimos el tipo del contexto de autenticación
interface AuthContextType {
  token: string;
  setToken: (token: string) => void;
  user: string;
  setUser: (user: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  channel: string;
}

// Creamos el contexto (puede empezar como null)
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider: el componente que envuelve la app y gestiona el estado global
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState("");
  const [avatar, setAvatar] = useState("");
  const [channel] = useState("general"); // Puedes luego añadir multicanal aquí si quieres.

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, avatar, setAvatar, channel }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso para consumir el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
