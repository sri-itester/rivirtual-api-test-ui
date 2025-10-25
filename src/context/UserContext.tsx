"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface DecodedToken {
  userId: number;
  email: string;
  name: string;
  exp: number;
}

interface UserContextType {
  user: DecodedToken | null;
  setUser: (user: DecodedToken | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token expired
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
      } else {
        setUser(decoded);
      }
    } catch (e) {
      console.warn("Invalid JWT", e);
      localStorage.removeItem("token");
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
