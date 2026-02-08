import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, CheckoutProduct } from "../api/cartApi";
import type { FavouriteItem } from "../api/favouritesApi";

export interface User {
  id: string;
  username: string;
  password: string;
  cart?: CartItem[];
  favourites?: FavouriteItem[];
  orders?: CheckoutProduct[];
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 60000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("loginTime", Date.now().toString());
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loginTime");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const loginTime = localStorage.getItem("loginTime");

    if (savedUser && loginTime) {
      const now = Date.now();
      const timeCheck = now - parseInt(loginTime);

      if (timeCheck >= SESSION_DURATION) {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem("redirectAfterLogin", currentPath);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        logout();
      } else {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
          localStorage.removeItem("user");
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTime");

      if (loginTime && user) {
        const now = Date.now();
        const elapsed = now - parseInt(loginTime);

        if (elapsed >= SESSION_DURATION) {
          const currentPath = window.location.pathname + window.location.search;
          localStorage.setItem("redirectAfterLogin", currentPath);
          logout();
          alert("Session expired. Please login again.");
          window.location.href = "/login";
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
