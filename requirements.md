# MOMENT AI — Frontend Requirements

> **Produk:** MOMENT AI (*Maternal Journey Assistant*)  
> **Dokumen:** Spesifikasi kebutuhan frontend (aplikasi ibu hamil dan Healthcare Provider Dashboard)  
> **Status:** Draft awal untuk MVP Hackathon  
> **Frontend stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod  
> **Backend:** NestJS REST API `/api/v1` (lihat `requirements.md` backend) dengan autentikasi JWT  
> **Referensi:** Proposal Hackathon MOMENT AI dan prototype UI/UX [MOMENT AI – Dashboard Tenaga Kesehatan](https://moment-ai-nakes.vercel.app/)

---

## 1. Ringkasan Proyek

MOMENT AI adalah platform pendampingan kesehatan maternal yang membantu ibu hamil memantau perjalanan kehamilan, mengelola jadwal Antenatal Care (ANC), memperoleh edukasi berbasis Buku KIA, dan mengakses informasi layanan rumah sakit. Bagi tenaga kesehatan, platform menyediakan dashboard untuk memantau jadwal dan status kunjungan serta mengidentifikasi ibu hamil yang melewatkan pemeriksaan.

Frontend bertugas menyajikan antarmuka untuk dua kelompok pengguna utama, mengonsumsi REST API backend secara aman, dan memastikan informasi kesehatan ditampilkan dengan jelas, aksesibel, serta tidak menyiratkan diagnosis atau keputusan klinis otomatis.

### 1.1 Tujuan frontend

- Menyediakan **aplikasi ibu hamil** yang mobile-first: Beranda, Jadwal ANC, Jurnal & Rekam Medis, Vaksinasi, Edukasi, Layanan RS, dan Profil.
- Menyediakan **Healthcare Provider Dashboard** yang desktop-first: ringkasan, jadwal, jadwal terlewat, daftar dan detail pasien.
- Menyediakan antarmuka **pengelolaan konten dan layanan** untuk `CONTENT_EDITOR`, `CLINICAL_REVIEWER`, dan `ADMIN` sesuai kontrak backend.
- Menerapkan autentikasi JWT dan pembatasan tampilan berbasis peran (RBAC) tanpa menggantikan otorisasi di server.
- Menyediakan pengalaman yang konsisten (loading, empty, error state), responsif, dan aksesibel.
- Dapat didemokan dengan data sintetis, termasuk ketika backend belum lengkap (mock API via MSW).

### 1.2 Batasan MVP

1. MVP memakai data dummy/sintetis; tidak ada integrasi SIMRS.
2. Frontend **bukan** sumber kebenaran otorisasi. Menyembunyikan menu/tombol hanya untuk UX; backend tetap memvalidasi peran dan cakupan data.
3. Frontend tidak boleh menghitung, menampilkan, atau menyiratkan **diagnosis**, skor risiko klinis, atau rekomendasi tindakan medis otomatis. Teks seperti "berisiko preeklamsia" hanya boleh tampil jika berasal dari data yang disahkan tenaga kesehatan dan sudah disepakati kontraknya dengan backend.
4. Fitur yang ada pada prototype tetapi **belum memiliki endpoint backend** (konsultasi/chat dokter, chatbot AI, pengingat obat & vitamin, grafik KIA, pendampingan 1000 HPK, pemantauan risiko/preeklamsia) **tidak termasuk MVP wajib**. Jika ditampilkan untuk demo, gunakan feature flag dan label "Segera hadir"/"Contoh tampilan" (lihat bagian 15).
5. Pengiriman WhatsApp/SMS dilakukan backend. Frontend hanya menampilkan status notifikasi (`pending`, `sent`, `failed`, `cancelled`) dan tidak mengklaim pesan pasti diterima.
6. Bahasa antarmuka MVP: **Bahasa Indonesia**. Seluruh teks dipusatkan agar mudah dialihbahasakan di kemudian hari.

---

## 2. Teknologi dan Dependensi

| Komponen | Pilihan |
|---|---|
| Framework | Next.js (App Router), versi stabil terbaru saat inisialisasi |
| Bahasa | TypeScript dengan `strict: true` |
| Styling | Tailwind CSS (konfigurasi CSS-first/`@theme` pada versi 4) |
| Komponen UI | shadcn/ui (Radix UI), `class-variance-authority`, `clsx`, `tailwind-merge` |
| Ikon | `lucide-react` |
| Data fetching & cache | TanStack Query v5 (client), `fetch` di Server Components |
| Tabel | TanStack Table (daftar jadwal/pasien/log) |
| Form & validasi | React Hook Form, Zod, `@hookform/resolvers` |
| Autentikasi | JWT access token dari backend, disimpan di cookie `httpOnly` melalui Next.js Route Handler (pola BFF) |
| Routing guard | `proxy.ts` (Next.js 16+) atau `middleware.ts` (versi sebelumnya) untuk redirect kasar; pemeriksaan otoritatif di layout/server |
| Tanggal & zona waktu | `date-fns` v4 dengan locale `id` dan `@date-fns/tz` (tampilan `Asia/Jakarta`) |
| Chart | Recharts melalui komponen `chart` shadcn/ui |
| Notifikasi UI | Sonner (toast) |
| Tema | `next-themes` (light/dark; light sebagai default) |
| State URL (filter/pagination) | `nuqs` atau `useSearchParams` |
| Render konten edukasi | `react-markdown` + `rehype-sanitize` (jika `body` berformat Markdown) |
| Tipe API | `openapi-typescript` yang dibangkitkan dari `http://localhost:3000/docs-json` |
| Mock API | MSW (Mock Service Worker) untuk development dan test |
| Unit/komponen test | Vitest, React Testing Library |
| E2E & aksesibilitas | Playwright, `@axe-core/playwright` |
| Code quality | ESLint (`eslint-config-next`), Prettier + `prettier-plugin-tailwindcss` |
| Version control | Git dan GitHub |
| Deployment | Vercel (konsisten dengan prototype yang sudah ada) |

Versi paket dikunci melalui lockfile. Jangan menambah dependensi berat tanpa alasan yang jelas; pilih komponen shadcn/ui yang benar-benar dipakai.

### 2.1 Prinsip arsitektur

- **Satu aplikasi Next.js** dengan *route group* terpisah untuk publik, ibu hamil, dan tenaga kesehatan/admin. Tampilan ibu hamil mobile-first, dashboard desktop-first.
- **Server Components secara default.** Gunakan `"use client"` hanya untuk interaktivitas (form, tabel interaktif, chart, dialog).
- **Browser tidak memanggil backend langsung.** Seluruh request melewati Next.js (Server Components atau Route Handler proxy `/api/proxy/*`) sehingga token tidak pernah dapat dibaca JavaScript di browser.
- Pisahkan: `app/` (routing & layout), `features/` (komponen, hook, schema per fitur), `components/ui` (shadcn), `lib/` (API client, auth, util).
- Mirror enum dan tipe backend pada satu lokasi (`types/` atau hasil generate OpenAPI) agar tidak ada string "ajaib" tersebar.
- Waktu dikirim/diterima dalam ISO 8601 UTC; konversi ke WIB hanya pada layer tampilan dan input form.
- Hindari logika bisnis klinis di frontend. Perhitungan yang diperbolehkan hanya bersifat tampilan (mis. usia kehamilan dalam minggu dari HPHT/EDD, berlabel "perkiraan").

---

## 3. Peran Pengguna, Rute, dan Hak Akses

Peran mengikuti backend: `PREGNANT_MOTHER`, `MIDWIFE`, `DOCTOR`, `ADMIN`, `CONTENT_EDITOR`, `CLINICAL_REVIEWER`.

### 3.1 Peta rute

| Route group | Path | Akses | Isi |
|---|---|---|---|
| `(public)` | `/` | Publik | **Landing page** MOMENT AI (lihat bagian 6.9); pengguna yang sudah login melihat tombol "Buka aplikasi" sesuai peran |
| `(public)` | `/#fitur`, `/#cara-kerja`, `/#keamanan`, `/#faq` | Publik | Anchor section pada landing page |
| `(auth)` | `/masuk`, `/daftar` | Publik (redirect jika sudah login) | Login dan registrasi ibu hamil |
| `(public)` | `/edukasi`, `/edukasi/[slug]` | Publik/akun sesuai kebijakan | Daftar dan detail materi `published` |
| `(public)` | `/layanan-rs`, `/layanan-rs/[slug]` | Publik/akun sesuai kebijakan | Daftar dan detail layanan RS |
| `(patient)` | `/beranda` | `PREGNANT_MOTHER` | Ringkasan usia kehamilan, jadwal terdekat, pintasan fitur |
| `(patient)` | `/jadwal-anc`, `/jadwal-anc/[id]` | `PREGNANT_MOTHER` | Daftar/detail jadwal, batalkan, ajukan reschedule |
| `(patient)` | `/kehamilan` | `PREGNANT_MOTHER` | Profil kehamilan dan timeline |
| `(patient)` | `/kehamilan/jurnal`, `/kehamilan/jurnal/baru`, `/kehamilan/jurnal/[id]` | `PREGNANT_MOTHER` | CRUD jurnal |
| `(patient)` | `/rekam-medis`, `/rekam-medis/[id]` | `PREGNANT_MOTHER` | Riwayat pemeriksaan (baca) |
| `(patient)` | `/vaksinasi` | `PREGNANT_MOTHER` | Status dan jadwal vaksinasi (baca) |
| `(patient)` | `/pengingat` | `PREGNANT_MOTHER` | Status notifikasi/pengingat milik sendiri |
| `(patient)` | `/profil` | `PREGNANT_MOTHER` | Ubah profil, ganti password, persetujuan |
| `(staff)` | `/dashboard` | `DOCTOR`, `MIDWIFE`, `ADMIN` | Ringkasan, tren, jadwal hari ini |
| `(staff)` | `/dashboard/jadwal`, `/dashboard/jadwal/baru`, `/dashboard/jadwal/[id]` | `DOCTOR`, `MIDWIFE`, `ADMIN` | Daftar, buat, ubah status jadwal ANC |
| `(staff)` | `/dashboard/terlewat` | `DOCTOR`, `MIDWIFE`, `ADMIN` | Jadwal terlewat untuk tindak lanjut |
| `(staff)` | `/dashboard/pasien`, `/dashboard/pasien/[patientId]` | Staf berwenang | Daftar dan detail pasien (jurnal, rekam medis, vaksinasi, jadwal) |
| `(staff)` | `/dashboard/rekam-medis/baru` | Staf berwenang | Input catatan pemeriksaan |
| `(staff)` | `/dashboard/notifikasi` | Staf/`ADMIN` | Status pengingat dan retry |
| `(staff)` | `/dashboard/konten`, `/dashboard/konten/baru`, `/dashboard/konten/[id]` | `CONTENT_EDITOR`, `CLINICAL_REVIEWER`, role berwenang | Draf, review, approve/reject, publish, arsip |
| `(staff)` | `/dashboard/layanan-rs` | `ADMIN` | Kelola layanan RS |
| `(staff)` | `/dashboard/audit-log` | `ADMIN` berwenang | Audit log dengan filter terbatas |
| — | `/403`, `/404`, `/sesi-berakhir` | — | Halaman error dan sesi habis |

### 3.2 Aturan akses di frontend

- Setelah login, arahkan berdasarkan peran: `PREGNANT_MOTHER` → `/beranda`; peran staf/admin/editor/reviewer → `/dashboard`.
- Menu navigasi dan tombol aksi disaring berdasarkan peran (`can(role, action)` pada satu modul `lib/auth/permissions.ts`).
- Layout `(patient)` dan `(staff)` memverifikasi sesi di server (`GET /auth/me`); jika gagal → redirect ke `/masuk?next=<path>`.
- Jika backend mengembalikan `403`, tampilkan halaman/komponen "Tidak memiliki akses". Jika `404` untuk resource yang tidak dapat diakses, tampilkan "Data tidak ditemukan" tanpa membocorkan keberadaan data.
- **Jangan pernah** mengirim `userId`, `patientId` (kecuali pada endpoint staf yang memang menerimanya, mis. pembuatan jadwal), `role`, atau `facilityId` sebagai bukti kepemilikan pada aksi ibu hamil. Backend mengambil identitas dari token.
- Registrasi publik hanya membuat akun ibu hamil. Tidak ada pilihan peran pada form daftar.

---

## 4. Autentikasi dan Manajemen Sesi (JWT)

Backend menerbitkan `accessToken` (Bearer, `expiresIn` mis. 3600 detik) pada `POST /auth/login` dan **belum memiliki refresh token maupun endpoint logout**. Desain frontend mengikuti batasan tersebut.

### 4.1 Pola penyimpanan token (BFF dengan cookie httpOnly)

1. Form login memanggil Route Handler `POST /api/auth/login` milik Next.js.
2. Route Handler meneruskan kredensial ke `POST {API_BASE_URL}/auth/login`.
3. Jika berhasil, Route Handler menyimpan token pada cookie:
   - `moment_at`: `httpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/`, `Max-Age` = `expiresIn`.
   - `moment_role`: `httpOnly`, atribut sama; hanya dipakai `proxy.ts` untuk redirect kasar (bukan untuk otorisasi).
4. Response ke browser hanya berisi data pengguna non-sensitif (`id`, `fullName`, `role`), **tanpa** token.
5. Server Components membaca cookie dan menambahkan `Authorization: Bearer <token>` ke backend.
6. Client Components memanggil `/api/proxy/[...path]`; handler ini menempelkan header Authorization, meneruskan method/body/query ke `/api/v1/*`, dan mengembalikan status serta envelope apa adanya.
7. `POST /api/auth/logout` menghapus kedua cookie, mengosongkan cache TanStack Query, lalu redirect ke `/masuk`.

Persyaratan proxy:
- Hanya meneruskan path dalam allowlist (`/api/v1/...`); tolak path lain dan host lain (cegah SSRF).
- Validasi header `Origin`/`Sec-Fetch-Site` pada method mutasi (`POST/PUT/PATCH/DELETE`) sebagai perlindungan CSRF tambahan.
- Jangan meneruskan cookie browser ke backend dan jangan mencatat header Authorization, body, atau response berisi data kesehatan ke log.
- Teruskan/hasilkan `x-request-id` agar dapat ditelusuri dengan `requestId` backend.

> Alternatif sederhana (tidak disarankan): menyimpan token di memori/`localStorage` dan memanggil backend langsung dari browser. Ini menuntut CORS dan meningkatkan risiko pencurian token melalui XSS. Jika dipilih karena keterbatasan waktu hackathon, dokumentasikan sebagai keputusan sementara.

### 4.2 Siklus sesi

- Tidak ada refresh token: ketika token habis (`401`), frontend menghapus cookie dan mengarahkan ke `/sesi-berakhir` (atau `/masuk?next=...`) dengan pesan jelas. Draf formulir yang belum tersimpan sebaiknya dipertahankan sementara di `sessionStorage` untuk form jurnal saja (teks pengguna, bukan token), dan dihapus setelah berhasil dikirim.
- Tampilkan peringatan ringan beberapa menit sebelum sesi berakhir (berdasarkan `Max-Age` yang diketahui server).
- `GET /auth/me` dipakai sebagai sumber identitas/peran untuk UI dan di-*cache* per request (`React.cache`) pada server.
- Fitur ganti password memakai `POST /auth/change-password`; setelah berhasil, tampilkan konfirmasi dan sarankan login ulang sesuai perilaku backend.

### 4.3 Halaman autentikasi

| Halaman | Kebutuhan |
|---|---|
| Login (`/masuk`) | Email/password (metode final masih perlu dikonfirmasi), tampilkan/sembunyikan password, error umum tanpa membocorkan keberadaan akun, penanganan `429` |
| Registrasi (`/daftar`) | Nama lengkap, email/telepon, password, **persetujuan penggunaan data** (checkbox wajib dengan versi teks dan waktu persetujuan sesuai kontrak backend), indikator kekuatan password |
| Ganti password | Password lama, baru, konfirmasi; validasi Zod |
| Akun staf | Tidak ada registrasi publik; staf dibuat melalui proses administrasi |

---

## 5. Integrasi API

### 5.1 Konvensi

- Base URL server: `API_BASE_URL=http://localhost:3000/api/v1` (env server-only). Client memakai `/api/proxy`.
- Seluruh endpoint mengikuti daftar pada requirements backend bagian 7.
- Pagination memakai `page` dan `limit` (default 20, maksimum 100). Gunakan `meta.total`/`meta.totalPages` untuk kontrol halaman.
- Filter dan sort hanya memakai field yang diizinkan backend; sinkronkan filter ke URL (`?page=2&status=missed`).
- Tanggal diterima/dikirim ISO 8601; input form menggunakan zona WIB lalu dikonversi ke UTC sebelum dikirim.

### 5.2 API client

Buat satu modul `lib/api/client.ts` yang:

- Membungkus `fetch` dan mem-*parse* envelope `{ success, message, data, meta }`.
- Melempar `ApiError` terstruktur (`statusCode`, `message`, `details[]`, `requestId`) berdasarkan envelope error.
- Memetakan `details[].field` ke `setError` React Hook Form agar pesan validasi server tampil di bawah field terkait.
- Menangani status: `401` → sesi berakhir; `403` → akses ditolak; `404` → tidak ditemukan; `409` → konflik (mis. jadwal/duplikasi); `422` → aturan bisnis; `429` → tampilkan "Terlalu banyak percobaan, coba lagi nanti"; `5xx` → pesan umum + `requestId` untuk dilaporkan.
- Tidak pernah menampilkan stack trace atau detail internal ke pengguna.

### 5.3 TanStack Query

- Query key terstruktur per fitur: `['anc-appointments', filters]`, `['journals', filters]`, `['dashboard', 'summary', range]`, dst.
- `staleTime` wajar (mis. 30–60 detik untuk dashboard; lebih lama untuk edukasi dan layanan RS).
- Mutasi meng-*invalidate* query terkait (mis. batal/reschedule jadwal → daftar jadwal, detail, notifikasi).
- Jangan menyimpan data kesehatan di `localStorage`/`IndexedDB`. Cache hanya di memori dan dibersihkan saat logout.
- Gunakan *optimistic update* hanya untuk aksi risiko rendah (mis. ubah filter); aksi jadwal/rekam medis menunggu konfirmasi server.

### 5.4 Pemetaan fitur ke endpoint

| Fitur | Endpoint utama |
|---|---|
| Login/Registrasi/Profil | `POST /auth/login`, `POST /auth/register`, `GET/PATCH /auth/me`, `POST /auth/change-password` |
| Profil kehamilan & timeline | `GET/PUT /pregnancy/profile`, `GET /pregnancy/timeline` |
| Jurnal | `GET/POST /pregnancy/journals`, `GET/PATCH/DELETE /pregnancy/journals/:id` |
| Rekam medis | `GET /medical-records`, `GET /medical-records/:id`; staf: `POST`, `PATCH` |
| Vaksinasi | `GET /vaccinations`; staf: `POST`, `PATCH`, `DELETE` |
| Jadwal ANC | `GET /anc-appointments`, `GET /anc-appointments/:id`, `POST /:id/cancel`, `POST /:id/reschedule`; staf: `POST`, `PATCH` |
| Notifikasi | `GET /notifications`, `POST /notifications/:id/retry` |
| Edukasi | `GET /education`, `GET /education/:slug`; editor/reviewer: `POST`, `PATCH`, `submit-review`, `approve`, `reject`, `publish`, `archive` |
| Layanan RS | `GET /hospital-services`, `GET /hospital-services/:slug`; admin: `POST`, `PATCH`, `DELETE` |
| Dashboard | `GET /dashboard/summary`, `/appointments`, `/missed-appointments`, `/patients`, `/patients/:patientId`, `/audit-logs` |
| Health | `GET /health` (opsional, untuk halaman status internal) |

### 5.5 Tipe data

- Bangkitkan tipe dari OpenAPI: `npx openapi-typescript http://localhost:3000/docs-json -o src/types/api.d.ts` (skrip `pnpm gen:api`). Jika Swagger belum lengkap, definisikan tipe manual dan tandai `// TODO: sinkronkan dengan OpenAPI`.
- Enum yang harus dicerminkan: `Role`, status jadwal (`scheduled`, `confirmed`, `completed`, `missed`, `cancelled`, `rescheduled`), status notifikasi (`pending`, `sent`, `failed`, `cancelled`), kanal (`whatsapp`, `sms`, `in_app`), status konten (`draft`, `in_review`, `published`, `archived`), `verificationStatus` (`patient_reported`, `pending_review`, `verified`), status vaksinasi (`planned`, `scheduled`, `completed`, `skipped`, `cancelled`), `pregnancyStatus` (`ongoing`, `postpartum`, `completed`).

---

## 6. Kebutuhan Fitur per Modul

### 6.1 Beranda ibu hamil

- Sapaan dan ringkasan: usia kehamilan (minggu/hari, **perkiraan**, dihitung dari HPHT atau EDD bila tersedia), trimester, EDD.
- Kartu jadwal ANC terdekat (tanggal, jam WIB, dokter/bidan, lokasi) dengan aksi cepat ke detail.
- Pintasan ke Jadwal ANC, Jurnal, Rekam Medis, Vaksinasi, Edukasi, Layanan RS.
- Jika profil kehamilan belum diisi, tampilkan ajakan melengkapi (EDD/HPHT bersifat sukarela).
- Banner pernyataan: MOMENT AI mendukung layanan dan bukan pengganti pemeriksaan/keputusan tenaga kesehatan.

### 6.2 Pregnancy Journey Tracker

**Profil & timeline** — form profil kehamilan (HPHT, EDD opsional), tampilan timeline dari `GET /pregnancy/timeline`.

**Jurnal kehamilan**
- Daftar dengan pagination dan filter rentang tanggal; tombol tambah jurnal.
- Form: tanggal (default hari ini), mood, gejala (multi-input/tag dengan batas jumlah), catatan (batas panjang dengan penghitung karakter). Batas harus sama dengan DTO backend.
- Edit/hapus hanya jika backend mengizinkan; tampilkan pesan kebijakan jika ditolak.
- Label jelas bahwa jurnal adalah catatan pribadi dan **bukan diagnosis**. Tidak ada kesimpulan medis otomatis dari isi jurnal.

**Rekam medis & vaksinasi**
- Daftar riwayat pemeriksaan (tanggal, jenis, ringkasan, pengukuran) dan detail.
- Tampilkan `verificationStatus` dengan badge berbeda: **Dilaporkan pasien**, **Menunggu tinjauan**, **Terverifikasi tenaga kesehatan**. Data yang belum terverifikasi tidak boleh tampil seolah hasil resmi.
- Vaksinasi: daftar jadwal/status dengan badge (`planned`, `scheduled`, `completed`, `skipped`, `cancelled`). Ibu hamil hanya membaca; pencatatan dilakukan staf.
- Pengukuran (berat badan, tekanan darah) hanya ditampilkan sebagai data; tidak diberi label "normal/abnormal" kecuali nilai tersebut disediakan dan divalidasi backend/tenaga kesehatan.

### 6.3 Smart ANC Reminder

**Sisi ibu hamil**
- Daftar jadwal (mendatang/riwayat) dengan filter status; kalender ringkas/list kronologis.
- Detail jadwal: waktu WIB, dokter/bidan, fasilitas, jenis kunjungan, status, status pengingat.
- Aksi **Batalkan** dan **Ajukan perubahan jadwal** (dialog konfirmasi; alasan opsional sesuai kontrak backend). Setelah sukses, tampilkan status terbaru dan invalidasi cache.
- Halaman pengingat menampilkan status notifikasi milik sendiri; label netral ("Pengingat dijadwalkan", "Terkirim", "Gagal terkirim"). Jangan menjanjikan pesan sudah diterima.

**Sisi staf**
- Form buat jadwal: pilih pasien (dari `/dashboard/patients`), dokter/bidan, fasilitas, `scheduledAt`, jenis kunjungan, opsi pengingat (`enabled`, `minutesBefore`, `channel`). Validasi tanggal tidak di masa lalu, kanal yang didukung, dan tangani `409/422` (konflik/aturan bisnis) dengan pesan jelas.
- Ubah status jadwal (`confirmed`, `completed`, `missed`, `cancelled`, `rescheduled`) melalui dialog konfirmasi.
- Tabel jadwal (TanStack Table): kolom pasien, waktu, tenaga kesehatan, status, status pengingat; filter tanggal, status, tenaga kesehatan; pagination server-side.

### 6.4 Maternal Education Center

- Daftar materi `published` dengan pencarian, filter kategori (nutrisi, pemeriksaan kehamilan, tanda bahaya, persiapan persalinan, ASI, perawatan bayi baru lahir), dan kartu ringkasan.
- Detail materi: judul, isi, kategori, **sumber** (`sourceTitle`, `sourceUrl`, `sourceVersion`) dan tanggal pembaruan. Sumber wajib terlihat.
- Isi `body` dirender aman: jika Markdown gunakan `react-markdown` + `rehype-sanitize`; jika HTML wajib disanitasi (mis. DOMPurify) — format final perlu dikonfirmasi dengan backend. Jangan memakai `dangerouslySetInnerHTML` tanpa sanitasi.
- Materi **tanda bahaya** disertai kalimat standar: bila mengalami gejala yang mengkhawatirkan segera hubungi tenaga kesehatan atau layanan gawat darurat. Teks standar disetujui `CLINICAL_REVIEWER` dan disimpan sebagai konstanta/konten terpusat, bukan ditulis ulang di tiap halaman.
- Halaman dapat dibaca tanpa login jika kebijakan backend mengizinkan; tangani `401/403` bila tidak.

**Pengelolaan konten (editor/reviewer)**
- Daftar semua status dengan badge dan filter.
- Editor: form judul, slug, ringkasan, isi (editor teks/Markdown dengan pratinjau), kategori, sumber/versi sumber. Aksi: simpan draf, **kirim untuk review**.
- Reviewer: lihat konten `in_review`, aksi **setujui** atau **tolak dengan catatan** (catatan wajib).
- Aksi **publish** dan **arsip** hanya muncul untuk peran berwenang dan sesuai status (workflow draft → in_review → approved → published → archived). Tombol yang tidak valid untuk status saat ini dinonaktifkan.
- Tampilkan pembuat, peninjau, dan waktu perubahan.

### 6.5 Hospital Service

- Daftar layanan aktif dengan pencarian/filter unit; detail menampilkan deskripsi, unit/departemen, jam layanan, kontak, lokasi, dan alur layanan.
- Tampilkan hanya informasi dari backend. Jangan menambahkan jadwal dokter, tarif, atau ketersediaan yang tidak ada di data.
- Tautan telepon (`tel:`) dan petunjuk lokasi bila tersedia.
- **Admin:** form buat/ubah/arsip layanan dengan validasi, konfirmasi sebelum hapus/arsip.

### 6.6 Healthcare Provider Dashboard

- **Ringkasan** (`/dashboard/summary`): total pasien dalam cakupan, jadwal hari ini, ringkasan status kunjungan; kartu statistik dengan *skeleton* saat memuat.
- **Tren kunjungan ANC** dan **distribusi trimester** (Recharts) dari data yang disediakan backend. Jika endpoint belum menyediakan agregasi ini, nonaktifkan grafik atau gunakan data mock yang diberi label jelas.
- **Jadwal** (`/dashboard/appointments`): filter rentang tanggal, status, tenaga kesehatan.
- **Jadwal terlewat** (`/dashboard/missed-appointments`): daftar prioritas tindak lanjut (nama pasien, waktu terlewat, kontak sesuai izin, tautan ke detail pasien). Definisi "terlewat" mengikuti backend; frontend tidak mengubah status klinis pasien.
- **Daftar pasien** dan **detail pasien**: ringkasan kehamilan, jadwal, jurnal, rekam medis, vaksinasi sesuai izin. Tampilkan hanya data yang dikembalikan backend; tangani `403/404` dengan baik.
- **Input rekam medis & vaksinasi** (staf): form dengan field `recordDate`, `recordType`, `summary`, `measurements` terstruktur (sesuai DTO); data yang disimpan staf ditandai sesuai `verificationStatus` yang dikembalikan backend.
- **Audit log** (admin): tabel dengan filter terbatas; tidak menampilkan token/password/isi rekam medis.
- Dashboard tidak boleh menampilkan data lintas fasilitas atau pasien di luar cakupan; hal ini dijamin backend, frontend hanya merender respons.

### 6.7 Notifikasi (staf/admin)

- Daftar notifikasi dengan filter status/kanal/jadwal; badge status (`pending`, `sent`, `failed`, `cancelled`).
- Tombol **Coba kirim ulang** untuk notifikasi `failed` (peran berwenang), dengan konfirmasi dan penanganan `429/409` agar tidak memicu spam. Nonaktifkan tombol saat request berjalan.
- Pesan galat provider hanya ditampilkan dalam bentuk yang sudah disanitasi backend.

### 6.8 Profil & persetujuan

- Ubah data profil yang diizinkan (`PATCH /auth/me`), ganti password, tampilkan status dan versi persetujuan data.
- Alur pencabutan/ubah persetujuan mengikuti kebijakan dan endpoint backend (belum tersedia → tandai sebagai asumsi/fase lanjutan).

### 6.9 Landing Page (`/`)

Landing page adalah pintu masuk publik MOMENT AI: menjelaskan nilai produk kepada ibu hamil, tenaga kesehatan, dan manajemen rumah sakit, serta mengarahkan ke pendaftaran/login. Halaman ini juga dipakai sebagai materi presentasi/demo hackathon.

**Tujuan**
- Menjelaskan secara singkat apa itu MOMENT AI dan masalah yang diselesaikan.
- Memperkenalkan lima fitur utama dan manfaatnya bagi tiap pemangku kepentingan.
- Membangun kepercayaan (sumber Buku KIA, validasi klinis, privasi data) tanpa klaim berlebihan.
- Mengonversi pengunjung ke aksi: **Daftar** (ibu hamil) atau **Masuk** (ibu hamil/tenaga kesehatan).

**Struktur section (berurutan)**

| # | Section | Isi |
|---|---|---|
| 1 | Navbar | Logo, anchor (Fitur, Cara Kerja, Keamanan, FAQ), tombol **Masuk** dan **Daftar**; menu *sheet* pada mobile; tombol "Buka aplikasi" jika sudah login |
| 2 | Hero | Judul nilai utama (mis. "Pendamping perjalanan kehamilan Anda"), subjudul satu kalimat, CTA utama **Daftar Sekarang** dan CTA sekunder **Lihat Fitur**, ilustrasi/mockup aplikasi (gambar lokal via `next/image`) |
| 3 | Latar belakang masalah | Konteks AKI dan pentingnya keteraturan ANC dari proposal (mis. AKI 144 per 100.000 kelahiran hidup menurut SUPAS 2025; target SDGs < 70 pada 2030). Cantumkan sumber (Kemenkes, 2026) di bawah statistik. Hanya memakai angka yang tercantum pada proposal |
| 4 | Lima fitur utama | Kartu: Pregnancy Journey Tracker, Smart ANC Reminder, Maternal Education Center, Hospital Service, Healthcare Provider Dashboard — masing-masing ikon, deskripsi 1–2 kalimat, dan tautan anchor |
| 5 | Cara kerja | 3–4 langkah: daftar akun → jadwal ANC dan pengingat → catat jurnal dan pantau kehamilan → baca edukasi dan layanan RS; versi sisi tenaga kesehatan (pantau jadwal, tindak lanjut jadwal terlewat) |
| 6 | Untuk siapa | Tab/kartu: **Ibu hamil**, **Tenaga kesehatan**, **Rumah sakit/manajemen** dengan manfaat sesuai proposal |
| 7 | Pratinjau aplikasi | Tangkapan layar/mockup aplikasi ibu hamil dan dashboard (diambil dari prototype; berisi **data sintetis**, bukan data pasien nyata), dengan *carousel*/tab |
| 8 | Edukasi pilihan | 3 materi terbaru dari `GET /education?limit=3` (hanya `published`) dengan *fallback* statis bila API tidak tersedia |
| 9 | Perbedaan MOMENT AI | Tabel perbandingan fitur (mengacu pada Gambar 1 proposal). Pernyataan tentang produk lain harus dapat diverifikasi dan dicek ulang sebelum dipublikasikan; gunakan bahasa netral |
| 10 | Keamanan, privasi, dan batasan | Data dilindungi (akses berbasis peran, persetujuan data), konten mengacu Buku KIA dan ditinjau tenaga kesehatan, **MOMENT AI bukan pengganti pemeriksaan dan keputusan tenaga kesehatan** |
| 11 | SDG & mitra | SDG 3 dan SDG 9; identitas RS KORPRI Pura Raharja sebagai pengembang inovasi; logo hanya jika sudah ada izin penggunaan |
| 12 | Tim (opsional) | Lima anggota dan perannya sesuai proposal |
| 13 | FAQ | Akordeon: Apa itu MOMENT AI? Apakah menggantikan dokter/bidan? Bagaimana data saya digunakan? Apakah pengingat lewat WhatsApp? Bagaimana jika ada tanda bahaya? Siapa yang dapat menggunakan? |
| 14 | CTA penutup | Ajakan daftar/masuk dan tautan kontak resmi RS |
| 15 | Footer | Navigasi, tautan Edukasi dan Layanan RS, kontak resmi, kebijakan privasi, `ClinicalDisclaimer`, hak cipta |

**Aturan konten**
- **Jangan** menampilkan testimoni, jumlah pengguna, persentase peningkatan kehadiran ANC, atau klaim dampak yang belum dibuktikan. Dampak pada proposal bersifat potensi; gunakan kata "diharapkan", "membantu", "mendukung".
- Jangan menjanjikan diagnosis, deteksi risiko otomatis, atau konsultasi dokter selama fiturnya belum tersedia (bagian 1.2 butir 3–4).
- Fitur belum tersedia (chatbot AI, 1000 HPK, dll.) hanya boleh disebut sebagai "rencana pengembangan" dengan label jelas.
- Semua teks berbahasa Indonesia, dipusatkan di `lib/content/landing.ts` agar mudah diubah tanpa menyentuh komponen.
- Gambar/mockup tidak boleh memuat data pasien nyata.

**Perilaku dan data**
- Landing page dirender statis (SSG) dengan **ISR** untuk section data dinamis (edukasi pilihan); kegagalan API tidak boleh merusak halaman (gunakan *fallback* statis).
- Hanya memanggil endpoint publik (`/education`, `/hospital-services`); tidak ada data pengguna atau PHI.
- Jika cookie sesi ada, tombol Masuk/Daftar berubah menjadi **Buka aplikasi** yang mengarah ke `/beranda` atau `/dashboard` sesuai peran (cek ringan di server, tanpa memuat data kesehatan).
- CTA **Daftar** → `/daftar`; **Masuk** → `/masuk`; "Untuk tenaga kesehatan" → `/masuk` dengan petunjuk bahwa akun staf dibuat oleh administrator.
- Mode demo (opsional, P2): tautan ke akun demo hanya jika diaktifkan lewat env dan memakai data sintetis; kredensial tidak ditulis di kode atau repositori publik.

**SEO dan metadata**
- `lang="id"`, `metadata` Next.js (title, description, canonical), Open Graph dan Twitter card dengan gambar OG lokal.
- `sitemap.xml`, `robots.txt`; hanya halaman publik yang diindeks, rute `(patient)` dan `(staff)` diberi `noindex`.
- JSON-LD `Organization` sederhana; tidak memakai skema medis yang menyiratkan saran klinis.
- Satu `h1`, hierarki heading berurutan, teks alternatif gambar bermakna.

**UI/UX, aksesibilitas, dan performa**
- Mobile-first (360 px) dan responsif hingga 1440 px; memakai design token dan komponen shadcn/ui (`button`, `card`, `accordion`, `tabs`, `sheet`, `badge`, `carousel` bila diperlukan).
- Animasi ringan (CSS/transisi Tailwind); hormati `prefers-reduced-motion`. Tidak ada autoplay video bersuara.
- Target Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 90; LCP ≤ 2,5 detik pada jaringan 4G; tidak ada pergeseran tata letak (CLS rendah) dengan ukuran gambar eksplisit.
- Kontras warna memadai, fokus terlihat, navigasi keyboard penuh, anchor dengan *smooth scroll* yang tetap aksesibel.
- Tidak memakai skrip pihak ketiga selain yang disetujui; jika analitik dipakai, pilih yang menjaga privasi dan tidak merekam data kesehatan.

---

## 7. Desain UI/UX dan Komponen

### 7.1 Prinsip

- Mobile-first untuk area ibu hamil (target lebar 360–430 px), desktop-first untuk dashboard (≥ 1024 px, tetap dapat dipakai di tablet).
- Bahasa sederhana, nada hangat, hindari istilah medis tanpa penjelasan singkat.
- Satu aksi utama per layar; target sentuh minimal 44×44 px.
- Gaya visual mengikuti prototype: dominan merah muda/rose dengan aksen biru-sian, kartu membulat, ikon lucide. Definisikan sebagai *design token* (CSS variable) pada `globals.css` sehingga tema dapat disesuaikan dengan desain final.

### 7.2 Design tokens (Tailwind `@theme`)

- Warna: `primary` (rose), `secondary`/`accent` (biru-sian), `success`, `warning`, `destructive`, `muted`, `background`, `foreground`; versi light dan dark.
- Radius, bayangan, dan skala tipografi konsisten. Font: pilihan yang terbaca baik di layar kecil (mis. Poppins/Inter via `next/font`).
- Warna status (jadwal, notifikasi, konten, verifikasi) dipusatkan pada satu helper `StatusBadge` agar konsisten.

### 7.3 Komponen shadcn/ui yang dibutuhkan

`button`, `input`, `textarea`, `label`, `form`, `select`, `checkbox`, `radio-group`, `switch`, `calendar`, `popover`, `date-picker` (komposisi), `dialog`, `alert-dialog`, `sheet`, `dropdown-menu`, `tabs`, `table`, `badge`, `card`, `avatar`, `skeleton`, `separator`, `tooltip`, `sonner`, `pagination`, `alert`, `breadcrumb`, `sidebar`, `chart`, `progress`, `command` (opsional untuk pencarian pasien).

### 7.4 Komponen aplikasi bersama

- `AppShellPatient` (header + bottom navigation mobile), `AppShellStaff` (sidebar + topbar, dapat dilipat di tablet).
- `PageHeader`, `StatCard`, `StatusBadge`, `DataTable` (server-side pagination/sort/filter), `DateRangeFilter`, `EmptyState`, `ErrorState` (dengan `requestId`), `ConfirmDialog`, `RoleGate`, `ClinicalDisclaimer`, `SourceCitation`, `PregnancyWeekIndicator`.

### 7.5 State UI wajib

Setiap halaman data memiliki: **loading** (skeleton), **empty** (penjelasan + CTA), **error** (pesan ramah + tombol coba lagi + `requestId`), dan **forbidden/not-found**. Form menampilkan error per field dan status *submitting*.

---

## 8. Keamanan, Privasi, dan Keselamatan Klinis

1. **Token:** hanya di cookie `httpOnly`; tidak di `localStorage`, `sessionStorage`, URL, atau log.
2. **XSS:** tidak ada `dangerouslySetInnerHTML` tanpa sanitasi; konten edukasi disanitasi; escape default React dipertahankan.
3. **CSP & header keamanan** pada `next.config`: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`.
4. **Cache:** halaman dan respons terautentikasi memakai `Cache-Control: no-store`; tidak ada data pasien pada cache publik/CDN. Gunakan rendering dinamis untuk halaman bersesi.
5. **Logout:** hapus cookie, bersihkan cache TanStack Query, dan hentikan polling.
6. **Data minimal:** form hanya meminta field yang dibutuhkan; jangan meminta NIK atau identitas sensitif untuk demo. HPHT/EDD bersifat sukarela.
7. **PHI di klien:** jangan kirim data kesehatan ke analytics/third-party; jangan menaruh data kesehatan di query string; jangan menyimpan data pasien di storage persisten.
8. **Persetujuan:** persetujuan penggunaan data wajib pada registrasi dan tersimpan melalui backend (status, versi, waktu).
9. **Pesan galat:** jangan menampilkan detail internal; tampilkan `requestId` saja untuk pelaporan.
10. **Rate limit:** tangani `429` dengan jeda dan pesan jelas; nonaktifkan tombol kirim saat request berjalan.
11. **Dependensi:** jalankan `npm audit`/`pnpm audit` berkala; tidak memuat skrip pihak ketiga yang tidak perlu.
12. **Keselamatan klinis:** `ClinicalDisclaimer` tampil pada Beranda, Edukasi, dan Detail rekam medis; tidak ada label diagnosis/"normal–abnormal"/skor risiko buatan frontend; pembeda jelas antara data pasien dan data terverifikasi tenaga kesehatan.
13. **Notifikasi:** UI tidak menampilkan atau menyusun pesan pengingat yang memuat diagnosis atau hasil pemeriksaan.
14. **Data dummy:** seed/mock hanya memakai data sintetis; jangan menaruh data pasien nyata di repositori, screenshot, atau demo publik.

---

## 9. Aksesibilitas, Performa, dan Kompatibilitas

- **Aksesibilitas:** target WCAG 2.1 AA — kontras warna memadai, navigasi keyboard penuh, fokus terlihat, label form eksplisit, `aria-live` untuk toast/galat, dialog dengan *focus trap* (Radix), teks alternatif, tidak mengandalkan warna saja untuk status (selalu sertai teks/ikon). Ukuran font dasar minimal 16 px.
- **Performa:** gunakan Server Components, `next/image` dan `next/font`, *code splitting* untuk chart/editor, hindari *waterfall* fetch, tabel dengan pagination server-side. Target Lighthouse (mobile) Performance ≥ 80 dan Accessibility ≥ 90 pada halaman utama.
- **Responsif:** uji pada 360, 390, 768, 1024, 1440 px. Dashboard menyediakan tampilan kartu/horizontal-scroll untuk tabel pada layar kecil.
- **Kompatibilitas:** browser modern (Chrome, Safari iOS, Firefox, Edge) dua versi terakhir.
- **PWA (opsional/P2):** `manifest` dan ikon agar dapat dipasang ke layar utama; offline hanya untuk halaman statis, **tanpa** menyimpan data kesehatan offline.
- **Jaringan lemah:** indikator loading jelas, *retry* terbatas pada request GET, pesan ramah saat offline.

---

## 10. Struktur Folder yang Disarankan

```text
moment-ai-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── (public)/
│   │   │   ├── page.tsx            # landing page (compose section dari features/landing)
│   │   │   ├── edukasi/            # daftar + [slug]
│   │   │   └── layanan-rs/         # daftar + [slug]
│   │   ├── (auth)/
│   │   │   ├── masuk/
│   │   │   └── daftar/
│   │   ├── (patient)/
│   │   │   ├── layout.tsx          # verifikasi sesi + role
│   │   │   ├── beranda/
│   │   │   ├── jadwal-anc/
│   │   │   ├── kehamilan/          # profil, timeline, jurnal/
│   │   │   ├── rekam-medis/
│   │   │   ├── vaksinasi/
│   │   │   ├── pengingat/
│   │   │   └── profil/
│   │   ├── (staff)/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── jadwal/
│   │   │       ├── terlewat/
│   │   │       ├── pasien/
│   │   │       ├── rekam-medis/
│   │   │       ├── notifikasi/
│   │   │       ├── konten/
│   │   │       ├── layanan-rs/
│   │   │       └── audit-log/
│   │   ├── api/
│   │   │   ├── auth/{login,logout}/route.ts
│   │   │   └── proxy/[...path]/route.ts
│   │   ├── sesi-berakhir/
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── proxy.ts                    # (atau middleware.ts) redirect kasar berbasis cookie
│   ├── components/
│   │   ├── ui/                     # shadcn/ui
│   │   └── shared/                 # StatusBadge, DataTable, EmptyState, dll.
│   ├── features/
│   │   ├── auth/                   # schema, hooks, komponen form
│   │   ├── pregnancy/
│   │   ├── anc/
│   │   ├── education/
│   │   ├── hospital-services/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   └── landing/                # Navbar, Hero, FeatureCards, HowItWorks, FAQ, Footer, dll.
│   ├── lib/
│   │   ├── api/                    # client, error, query keys
│   │   ├── auth/                   # session, permissions
│   │   ├── date.ts                 # util WIB/UTC, usia kehamilan
│   │   ├── constants.ts            # enum, label status, teks disclaimer
│   │   ├── content/landing.ts      # teks landing page terpusat
│   │   └── utils.ts                # cn(), dll.
│   ├── hooks/
│   ├── mocks/                      # MSW handlers + data sintetis
│   └── types/                      # api.d.ts (generated), enum
├── tests/
│   ├── unit/
│   └── e2e/
├── public/
├── .env.example
├── components.json                 # konfigurasi shadcn/ui
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

Struktur dapat disederhanakan saat hackathon, tetapi pemisahan `app/`, `features/`, `lib/`, dan `components/` tetap dijaga.

---

## 11. Environment Variables

Sediakan `.env.example` tanpa secret sungguhan.

```dotenv
NODE_ENV=development

# URL backend (server-only, TIDAK diawali NEXT_PUBLIC_)
API_BASE_URL=http://localhost:3000/api/v1

# URL frontend
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=MOMENT AI

# Cookie sesi
AUTH_COOKIE_NAME=moment_at
AUTH_ROLE_COOKIE_NAME=moment_role
AUTH_COOKIE_SECURE=false        # true pada production (HTTPS)

# Feature flag demo (fitur belum memiliki endpoint backend)
NEXT_PUBLIC_ENABLE_MOCKS=false
NEXT_PUBLIC_FF_AI_CHAT=false
NEXT_PUBLIC_FF_MEDICATION_REMINDER=false
NEXT_PUBLIC_FF_RISK_MONITORING=false

NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Jakarta
```

Catatan:
- Port backend default `3000`; jalankan Next.js pada port **3001** (`next dev -p 3001`) agar tidak bentrok. Nilai ini sudah termasuk dalam `FRONTEND_ORIGINS` contoh backend (`http://localhost:5173,http://localhost:3001`). Karena request dibuat server-side lewat proxy, CORS di browser tidak digunakan, tetapi origin tetap perlu terdaftar jika memakai mode langsung.
- Hanya variabel berawalan `NEXT_PUBLIC_` yang terekspos ke browser; jangan menaruh secret di sana.
- Jangan commit `.env.local`. Gunakan secret/environment manager Vercel untuk production.

---

## 12. Testing Requirements

### 12.1 Unit & komponen (Vitest + React Testing Library)

- Schema Zod (login, registrasi, jurnal, jadwal, konten, layanan RS) termasuk batas panjang dan format tanggal.
- Util tanggal: konversi WIB↔UTC, perhitungan usia kehamilan, trimester.
- `permissions.ts` (`can(role, action)`) dan `RoleGate`.
- API client: parsing envelope sukses/error, pemetaan `details[]` ke field form, penanganan `401/403/404/429`.
- Komponen `StatusBadge`, `DataTable`, `EmptyState`, `ErrorState`, `ClinicalDisclaimer`.
- Sanitasi render konten edukasi (skrip tidak dieksekusi).

### 12.2 Integrasi (dengan MSW)

- Alur login → redirect berdasarkan peran → logout.
- CRUD jurnal, daftar jadwal ANC, batal/reschedule.
- Pembuatan jadwal oleh staf dengan error validasi dari server.
- Dashboard memuat ringkasan, jadwal, jadwal terlewat.
- Workflow konten: draf → kirim review → approve/reject → publish.
- Penanganan `401` (sesi berakhir) dan `403`.

### 12.3 End-to-end (Playwright)

- Pengguna tanpa sesi tidak dapat membuka `(patient)` maupun `(staff)`.
- `PREGNANT_MOTHER` tidak dapat membuka `/dashboard/*`; staf tidak melihat menu admin.
- Ibu hamil membuat jurnal, melihat jadwal, membatalkan jadwal.
- Staf membuat jadwal ANC dan melihatnya di daftar serta di dashboard.
- Token tidak dapat dibaca dari `document.cookie` dan tidak muncul di `localStorage`.
- Pemeriksaan aksesibilitas otomatis (`axe`) pada halaman utama tiap peran: tidak ada pelanggaran *critical/serious*.
- Layout tidak rusak pada viewport 360 px dan 1440 px.
- Landing page: CTA Daftar/Masuk mengarah ke rute yang benar, anchor navbar berfungsi, tombol berubah menjadi "Buka aplikasi" saat sudah login, halaman tetap tampil bila `GET /education` gagal, dan tidak ada pelanggaran `axe` *critical/serious*.

---

## 13. Kriteria Penerimaan MVP

Frontend MVP dinyatakan memenuhi kebutuhan awal apabila:

- [ ] Aplikasi Next.js + TypeScript (`strict`) + Tailwind + shadcn/ui berjalan dan dapat di-build tanpa galat tipe/lint.
- [ ] Login, registrasi ibu hamil (dengan persetujuan data), logout, dan penanganan sesi berakhir berfungsi; token tersimpan di cookie `httpOnly`.
- [ ] Redirect dan navigasi sesuai peran; rute terlarang menampilkan 403 atau redirect.
- [ ] Ibu hamil dapat membuat/melihat/mengubah jurnal dan melihat profil, timeline, rekam medis, serta vaksinasi.
- [ ] Ibu hamil dapat melihat jadwal ANC, status pengingat, membatalkan, dan mengajukan reschedule.
- [ ] Staf dapat membuat jadwal ANC, mengubah status, dan melihat daftar jadwal dengan filter dan pagination.
- [ ] Dashboard menampilkan ringkasan, jadwal, dan daftar jadwal terlewat sesuai respons backend.
- [ ] Maternal Education Center menampilkan hanya materi `published` dengan sumber, disanitasi, dan disertai disclaimer; alur editor/reviewer berjalan.
- [ ] Hospital Service dapat dibaca pengguna dan dikelola admin.
- [ ] Landing page memuat seluruh section pada bagian 6.9, CTA Daftar/Masuk berfungsi, dan tetap tampil dengan baik ketika API publik gagal.
- [ ] Landing page tidak memuat testimoni, angka dampak, atau klaim klinis yang tidak didukung proposal; disclaimer klinis tampil.
- [ ] Landing page memiliki metadata SEO/OG, `sitemap`, `robots`, dan lolos target Lighthouse pada bagian 6.9.
- [ ] Status verifikasi data kesehatan dibedakan secara jelas pada UI.
- [ ] Semua halaman data memiliki state loading, empty, error, dan forbidden/not-found.
- [ ] Error validasi server tampil pada field form terkait; `requestId` tampil pada galat tak terduga.
- [ ] Tampilan responsif (360–1440 px) dan lolos pemeriksaan aksesibilitas dasar.
- [ ] Header keamanan/CSP dan `no-store` pada halaman bersesi diterapkan.
- [ ] Tidak ada label diagnosis/skor risiko buatan frontend atau klaim menggantikan keputusan klinis.
- [ ] Unit/integrasi/e2e test untuk alur kritis tersedia dan lulus.
- [ ] Dapat didemokan dengan data sintetis (backend nyata atau mock MSW); tidak ada data pasien nyata di repositori.
- [ ] Deployment ke Vercel berhasil dengan variabel lingkungan yang benar.

---

## 14. Tahapan Implementasi yang Disarankan

Disesuaikan dengan timeline hackathon (UI/UX 6 jam, development 24 jam, testing 12 jam). Prioritas: **P0** wajib demo, **P1** sebaiknya ada, **P2** jika sempat.

### Tahap 1 — Fondasi (P0)
1. Inisialisasi Next.js + TypeScript, Tailwind, shadcn/ui, ESLint/Prettier.
2. Design token, layout dasar (`AppShellPatient`, `AppShellStaff`), komponen bersama.
3. API client, envelope/error handling, TanStack Query provider.
4. Route Handler login/logout, proxy, `proxy.ts`, helper sesi dan `permissions.ts`.
5. MSW + data sintetis agar UI dapat dikembangkan paralel dengan backend.

### Tahap 2 — Aplikasi ibu hamil (P0)
1. Login/registrasi dengan persetujuan data.
2. Beranda, profil kehamilan, jurnal (CRUD).
3. Jadwal ANC (daftar, detail, batal, reschedule) dan status pengingat.
4. Rekam medis dan vaksinasi (baca).
5. Landing page (P0 untuk demo/pitch): section statis lebih dulu, lalu section edukasi pilihan dari API dengan *fallback*.

### Tahap 3 — Dashboard tenaga kesehatan (P0)
1. Ringkasan, daftar jadwal, jadwal terlewat.
2. Buat/ubah jadwal ANC; daftar dan detail pasien.
3. Input rekam medis/vaksinasi (P1).

### Tahap 4 — Konten, layanan, dan administrasi (P1)
1. Maternal Education Center (publik) + render aman + disclaimer.
2. Workflow editor/reviewer.
3. Hospital Service (publik + admin).
4. Notifikasi (status + retry), audit log.

### Tahap 5 — Pengujian dan finalisasi (P0)
1. Unit/integrasi/e2e untuk alur kritis, `axe`, uji responsif.
2. Sinkronisasi kontrak dengan OpenAPI backend; hapus mock yang tidak diperlukan.
3. Perbaikan UX, bug, dan persiapan demo.
4. Deployment Vercel dan uji dari end-to-end ke backend.

### Tahap 6 — Fase lanjutan (P2)
Chatbot AI/konsultasi, pengingat obat & vitamin, grafik KIA, 1000 HPK, pemantauan risiko (dengan validasi klinis), PWA, refresh token/pencabutan sesi, integrasi SIMRS.

---

## 15. Kesenjangan Frontend–Backend, Referensi, dan Asumsi

### 15.1 Kesenjangan yang perlu disepakati dengan backend

| Topik | Kondisi saat ini | Tindak lanjut |
|---|---|---|
| Fitur prototype tanpa endpoint | Konsultasi/chat dokter, chatbot AI, pengingat obat & vitamin, grafik KIA, 1000 HPK, pemantauan preeklamsia tidak ada di daftar endpoint | Feature flag + label "Segera hadir", atau tambahkan endpoint bila disepakati |
| Refresh token & logout | Tidak ada pada MVP backend | Sesi berakhir saat token habis; logout dilakukan di sisi frontend |
| Manajemen akun staf | Registrasi publik hanya ibu hamil; tidak ada endpoint pengelolaan user | Akun staf dibuat/di-*seed* oleh backend/admin; tentukan endpoint bila perlu UI admin |
| Kontrak `register` | Field persetujuan (`consent`) belum dirinci | Konfirmasi payload (status, versi, waktu) |
| Format `body` konten edukasi | Tipe string; format belum ditetapkan | Konfirmasi Markdown atau HTML |
| Bentuk respons dashboard | Struktur `summary`, tren, dan distribusi belum dirinci | Sinkronkan dengan OpenAPI; sembunyikan grafik jika belum ada |
| Payload `cancel`/`reschedule` | Belum dirinci | Konfirmasi field (alasan, waktu baru) dan apakah reschedule langsung diterapkan atau berupa pengajuan |
| Daftar pasien untuk pembuatan jadwal | Tersedia lewat `/dashboard/patients` | Pastikan filter pencarian nama tersedia |
| Batas panjang field | Backend hanya menyebut "dibatasi" | Samakan batas Zod dengan DTO backend |
| Klaim JWT | Isi payload JWT tidak didefinisikan | Frontend tidak bergantung pada isi token; peran diambil dari `/auth/me` |

### 15.2 Sumber dari proposal MOMENT AI

- Fitur utama: Pregnancy Journey Tracker, Smart ANC Reminder, Maternal Education Center, Hospital Service, dan Healthcare Provider Dashboard.
- Materi edukasi mengacu pada Buku KIA Kemenkes dan divalidasi tenaga kesehatan.
- MVP memakai data simulasi; integrasi SIMRS bukan prasyarat.
- Sistem mendukung layanan dan administrasi, bukan pengganti keputusan klinis.

### 15.3 Referensi prototype

- [MOMENT AI – UI/UX Dashboard untuk Tenaga Kesehatan](https://moment-ai-nakes.vercel.app/)
- Layar pada proposal (Gambar 8 dan 9): tampilan awal, pendaftaran, menu awal, jadwal ANC, rekam medis & jurnal, edukasi, layanan RS, konsultasi, pengingat obat & vitamin, profil, serta dashboard tenaga kesehatan. Layar yang bergantung pada fitur di luar kontrak backend mengikuti aturan pada bagian 1.2 butir 4.

### 15.4 Asumsi teknis yang masih perlu dikonfirmasi

- Metode login final: email/password, nomor telepon/OTP, atau kombinasi.
- Apakah aplikasi ibu hamil cukup berupa web responsif/PWA atau dibutuhkan aplikasi mobile native terpisah (proposal menyebut Flutter untuk mobile).
- Apakah dashboard dan aplikasi pasien tetap satu aplikasi Next.js atau dipisah (prototype dashboard saat ini berada di deployment terpisah).
- Definisi peran manajemen rumah sakit pada dashboard.
- Kebijakan retensi, koreksi, dan penghapusan data kesehatan yang memengaruhi aksi hapus pada UI.
- Domain production frontend/backend dan kebijakan akses Swagger production.

---

**Catatan implementasi:** Gunakan dokumen ini sebagai spesifikasi awal frontend. Sebelum implementasi final, sinkronkan kontrak endpoint, field DTO, dan alur layar dengan backend (OpenAPI) dan prototype UI/UX, serta validasi teks kesehatan dan alur klinis bersama pihak rumah sakit.
