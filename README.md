# Thrift-Through Backend

Backend dari thrift-through (aplikasi penjualan/penukaran barang bekas elektronik)


## Tech Stack

- **Framework**: [Express.js](https://expressjs.com/) (Node.js)
- **Database**: [PostgreSQL](https://www.postgresql.org/) dengan [TypeORM](https://typeorm.io/)
- **Authentication**: JWT (JSON Web Token) & Cookie-parser
- **Real-time**: [Socket.io](https://socket.io/) (WebSockets)
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) (Gemini SDK)
- **File Upload**: [Multer](https://github.com/expressjs/multer)

## Scripts

Berikut adalah penjelasan script yang tersedia di `package.json`:

- `npm start`: Menjalankan server backend utama menggunakan `node`.
- `npm run env`: Menyalin file `.env.example` menjadi `.env` secara otomatis. Pastikan untuk mengisi nilai environment variables setelah menjalankan ini.
- `npm run migration:run`: Menjalankan migrasi database TypeORM untuk membuat skema tabel secara otomatis.
- `npm run migration:revert`: Membatalkan migrasi database terakhir.
- `npm run migration:show`: Menampilkan status migrasi database yang sudah dijalankan.
- `npm run seed:run`: Menjalankan proses seeding data awal (master data) menggunakan skema migrasi khusus untuk seeder.
- `npm run seed:revert`: Membatalkan proses seeding terakhir.

## Cara Setup

1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Environment Variables**:
    Jalankan script `env` untuk membuat file `.env`:
    ```bash
    npm run env
    ```
    Buka file `.env` dan lengkapi konfigurasi berikut:
    - Database (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT)
    - `JWT_SECRET`: Secret key untuk otentikasi.
    - `GEMINI_API_KEY`: API Key dari Google AI Studio.

3.  **Inisialisasi Database**:
    Pastikan database PostgreSQL sudah dibuat, lalu jalankan migrasi dan seeding:
    ```bash
    npm run migration:run
    npm run seed:run
    ```

4.  **Menjalankan Server**:
    ```bash
    npm start
    ```
    Server akan berjalan di `http://localhost:5000` (atau port yang dikonfigurasi).
