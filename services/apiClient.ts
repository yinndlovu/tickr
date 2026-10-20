// external
import axios from "axios";

// internal
import { API_BASE_URL } from "../configuration/config";

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

// the auth context owns the token, the client only needs to attach it
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// called when the server rejects the token (expired / revoked)
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && authToken) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

// the API answers 400 with { success: false, message } for expected failures
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "can't reach the server. check your connection and try again.";
    }
    const message = error.response.data?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
