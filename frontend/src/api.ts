import axios from "axios";
import { BACKEND_URL } from "./config";

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.msg || error.message;
  }

  return "Something went wrong";
}

export function isLoggedIn() {
  const token = localStorage.getItem("token");
  return Boolean(token && token !== "null");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export interface User {
  id: string;
  email?: string;
  name: string | null;
  bio?: string | null;
  createdAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string | null;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorID: string;
  author: {
    id: string;
    name: string | null;
    bio?: string | null;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
