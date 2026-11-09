import { serverApi } from "./api";
import type { User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const result = await serverApi<{ user: User }>("/auth/me");
    return result.user;
  } catch (error) {
    if (error instanceof Error && /401|unauthorized|tidak ditemukan/i.test(error.message)) return null;
    throw error;
  }
}
