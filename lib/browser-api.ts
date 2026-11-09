import type { ApiEnvelope } from "./types";

export class BrowserApiError extends Error {
  constructor(message: string, readonly status: number, readonly requestId?: string) {
    super(message);
    this.name = "BrowserApiError";
  }
}

export async function browserApi<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  return fetch(`/api/proxy${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "x-request-id": crypto.randomUUID(), ...init?.headers },
  }).then(async (response) => {
    const payload = (await response.json().catch(() => null)) as Partial<ApiEnvelope<T>> | null;
    if (!response.ok) {
      throw new BrowserApiError(
        payload?.message ?? `Permintaan gagal (${response.status})`,
        response.status,
        response.headers.get("x-request-id") ?? undefined,
      );
    }
    return payload?.data as T;
  });
}
