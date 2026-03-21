import { api } from "./apiClient";

export async function authenticateWithGoogle(idToken: string) {
  const response = await api.post("/auth/google", { idToken });
  return response.data;
}

export const signInWithGoogle = authenticateWithGoogle;
