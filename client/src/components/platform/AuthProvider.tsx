import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type AuthUser = {
  id: string;
  email: string;
  role: string;
  profileId: string | null;
};

const AuthContext = createContext<{
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; role?: "client" | "coach" | "physician" | "admin" }) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery<{ user: AuthUser | null }>({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load auth session");
      return response.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      await apiRequest("POST", "/api/auth/login", payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth-session"] }),
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; role?: "client" | "coach" | "physician" | "admin" }) => {
      await apiRequest("POST", "/api/auth/register", payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth-session"] }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth-session"] }),
  });

  return (
    <AuthContext.Provider
      value={{
        user: sessionQuery.data?.user ?? null,
        isLoading: sessionQuery.isLoading,
        login: async (payload) => loginMutation.mutateAsync(payload),
        register: async (payload) => registerMutation.mutateAsync(payload),
        logout: async () => logoutMutation.mutateAsync(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
