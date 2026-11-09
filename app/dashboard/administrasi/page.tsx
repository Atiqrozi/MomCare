import { redirect } from "next/navigation";
import { NakesShell } from "@/components/nakes-shell";
import { PageTitle } from "@/components/ui";
import { AdminConsole } from "@/components/admin-console";
import { getCurrentUser } from "@/lib/session";
import { serverApi } from "@/lib/api";

type UserRow = { id: string; fullName: string; email: string; role: string; status: string };
type FacilityRow = { _id: string; name: string; code: string; address: string; phone?: string; status?: string };
type AuditRow = { _id: string; action: string; resourceType: string; timestamp: string };
type PageData<T> = { data: T[] };

export default async function AdministrationPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "ADMIN") redirect("/dashboard");
  const live = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "true";
  const [userResponse, facilityResponse, auditResponse] = live ? await Promise.all([
    serverApi<PageData<UserRow> | UserRow[]>("/users?limit=100").catch(() => []),
    serverApi<FacilityRow[]>("/facilities").catch(() => []),
    serverApi<PageData<AuditRow> | AuditRow[]>("/users/audit-logs?limit=10").catch(() => []),
  ]) : [{ data: [] }, [], { data: [] }];
  const users = Array.isArray(userResponse) ? userResponse : userResponse?.data ?? [];
  const facilities = Array.isArray(facilityResponse) ? facilityResponse : [];
  const auditLogs = Array.isArray(auditResponse) ? auditResponse : auditResponse?.data ?? [];
  return <NakesShell user={user}><PageTitle eyebrow="Akses admin" title="Administrasi" description="Kelola akun staf, fasilitas kesehatan, dan tinjau audit terbaru." />{!live && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Aktifkan backend dengan NEXT_PUBLIC_ENABLE_MOCKS=false untuk mengelola data.</div>}<AdminConsole users={users} facilities={facilities} auditLogs={auditLogs} /></NakesShell>;
}
