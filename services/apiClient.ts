// external
import axios from "axios";

// internal
import { API_BASE_URL } from "../configuration/config";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
