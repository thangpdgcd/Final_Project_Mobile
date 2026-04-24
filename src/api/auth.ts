import type { AuthResponse } from "@/api/types";
import { apiPost } from "../lib/api";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export const loginApi = async (input: LoginInput) => {
  // backend: POST /api/login
  const data = await apiPost("/api/login", input);
  const token = data?.token ?? data?.accessToken;
  return { token, user: data?.user } as AuthResponse;
};

export const registerApi = async (input: RegisterInput) => {
  // Backend register does not return access token; login after register.
  await apiPost("/api/register", input);
  const data = await apiPost("/api/login", { email: input.email, password: input.password });
  const token = data?.token ?? data?.accessToken;
  return { token, user: data?.user } as AuthResponse;
};

export const logoutApi = async () => {
  await apiPost("/api/logout");
  return { ok: true };
};

export const getMeApi = async () => {
  // Keep existing flow for now (token-based auth for native uses axios interceptors elsewhere).
  // If needed, we can extend fetch helper to add Authorization header too.
  throw new Error("getMeApi is not wired to fetch helper yet.");
};
