import axios from "axios";
import { parseXml } from "./xml";
import type { AuthResponse } from "../types/survey";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const authClient = axios.create({ baseURL: BASE_URL });

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const xml = `<login_request>\n  <email>${email}</email>\n  <password>${password}</password>\n</login_request>`;
  const res = await authClient.post<string>("/api/auth/login", xml, {
    headers: { "Content-Type": "application/xml", Accept: "application/xml" },
    responseType: "text",
  });

  // Parse XML response — handles both snake_case and camelCase field names
  const parsed = parseXml<{
    auth_response?: {
      token: string;
      type: string;
      username: string;
      email: string;
      role: string;
    };
    authResponse?: {
      token: string;
      type: string;
      username: string;
      email: string;
      role: string;
    };
  }>(res.data);

  const data = parsed.auth_response ?? parsed.authResponse;

  if (!data?.token) {
    throw new Error("Login failed: unexpected response from server.");
  }

  return {
    token: data.token,
    type: data.type,
    username: data.username,
    email: data.email,
    role: data.role,
  };
}
