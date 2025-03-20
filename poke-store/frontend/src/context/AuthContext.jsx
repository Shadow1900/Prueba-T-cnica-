import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  useEffect(() => {
    if (token) {
      setUser({ email });
    }
  }, [token, email]);

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", { email, password });
      setUser(response.data.user);
      setToken(response.data.token);
      setEmail(email);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", email);
    } catch (error) {
      alert("Error en el inicio de sesión");
      return 1;
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider value={{ user, token, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
