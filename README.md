# MOMENT AI Frontend

Frontend Next.js untuk aplikasi pendamping perjalanan kehamilan dan dashboard tenaga kesehatan.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3001`. Salin `.env.example` menjadi `.env.local`; nilai awalnya menghubungkan frontend ke API NestJS di `http://localhost:3000/api/v1`. Backend perlu berjalan dan `.env` backend harus sudah diisi. Mode backend adalah default. Gunakan `NEXT_PUBLIC_ENABLE_MOCKS=true` hanya untuk melihat data contoh; mode ini tidak membuat akun atau menerima login karena akun demo tidak disimpan.

Browser tidak memanggil backend secara langsung. Route handler `/api/auth/*` dan `/api/proxy/*` meneruskan request server-side dengan token dari cookie `httpOnly`. Registrasi publik hanya untuk ibu hamil; akun staf dibuat oleh admin dari Dashboard → Administrasi. Dashboard edukasi memakai alur draf, review klinis, persetujuan, dan publikasi.

Fitur prototype yang belum didukung endpoint backend (seperti konsultasi real-time, pengingat obat pribadi, grafik klinis otomatis, dan penilaian risiko otomatis) tetap ditandai sebagai demo atau belum tersedia. Data kesehatan yang tampil pada mode live berasal dari API.
