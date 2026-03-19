import { api } from "./apiClient";

export async function signInWithGoogle(idToken: string) {
  const response = await api.post("/auth/google", { idToken });
  return response.data;
}
