// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/components/Login";
import Chat from "@/components/Chat";
import { useAuth } from "@/provider";

export default function App() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/chat" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
