import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app first opens, check whether the saved token still works.
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await loginUser({ username, password });
    localStorage.setItem("token", res.data.token);
    const me = await getCurrentUser();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A shortcut so any component can write:  const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
