import { http } from "./http";

export type AuthResponse = {
  token: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  displayName: string;
  email: string;
  password: string;
};

export async function loginApi(body: LoginRequest) {
  const res = await http.post<AuthResponse>("/auth/login", body);
  return res.data;
}

export async function registerApi(body: RegisterRequest) {
  const res = await http.post<AuthResponse>("/auth/register", body);
  return res.data;
}

export async function meApi() {
  const res = await http.get("/auth/me");
  return res.data;
}
