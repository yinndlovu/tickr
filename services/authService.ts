// internal
import { api } from "./apiClient";

export interface AuthUserDetails {
  id: number;
  name?: string | null;
  email: string;
  profilePictureUrl?: string | null;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  details?: AuthUserDetails | null;
}

export async function authenticateWithGoogle(
  idToken: string,
): Promise<AuthApiResponse> {
  const response = await api.post("/auth/google", { idToken });
  return response.data;
}

export const signInWithGoogle = authenticateWithGoogle;

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthApiResponse> {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthApiResponse> {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
}
