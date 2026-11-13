import { cookies } from "next/headers";
import type { ApiEnvelope } from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.AUTH_COOKIE_NAME ?? "moment_at")?.value;
  const url = new URL(path.replace(/^\/+/, ""), `${API_BASE_URL.replace(/\/+$/, "")}/`);
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    console.error("[session-monitor]", JSON.stringify({ event: "server_api_network_error", path, at: new Date().toISOString() }));
    throw new ApiError(`Backend API tidak dapat dihubungi di ${url.origin}. Pastikan server backend berjalan dan API_BASE_URL mengarah ke alamat yang benar.`, 503);
  }
  const payload = (await response.json().catch(() => null)) as Partial<ApiEnvelope<T>> | null;
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.warn("[session-monitor]", JSON.stringify({ event: "server_api_auth_error", path, status: response.status, requestId: response.headers.get("x-request-id"), at: new Date().toISOString() }));
    }
    throw new ApiError(
      payload?.message ?? `Permintaan gagal (${response.status})`,
      response.status,
      response.headers.get("x-request-id") ?? undefined,
    );
  }
  return payload?.data as T;
}
