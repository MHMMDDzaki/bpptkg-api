# Backend API BPPTKG

Ini adalah layanan backend untuk proyek API BPPTKG. Proyek ini menggunakan Node.js, Express, dan MongoDB, serta terintegrasi dengan Google Drive untuk penyimpanan file dan mengambil data dari API eksternal.

## Prerequisites

Pastikan kamu sudah memiliki software berikut terinstal di komputermu:

-   **Node.js** (v20 atau lebih baru)
    
-   **MongoDB** (v8 atau lebih baru)
    
-   **MongoDB Shell (`mongosh`)** atau **MongoDB Compass**
    

## 🚀 Langkah-langkah Setup

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan proyek ini di lingkungan lokal.

### Langkah 1: Setup Folder Google Drive

Buat sebuah folder baru di Google Drive yang akan digunakan oleh aplikasi.

1.  Buka Google Drive, buat folder baru (misalnya, `bpptkg-api-storage`).
    
2.  Buka folder tersebut, dan salin **ID Folder** dari URL di browser.
    
    -   Contoh URL: `https://drive.google.com/drive/u/0/folders/INI_ADALAH_ID_FOLDERNYA`
        
    -   Simpan ID ini. Contoh ID: `1QGfvkatFbjhvcQPYgWSXhs1uuO7Do5u7`.
        

### Langkah 2: Setup Google Service Account

Aplikasi memerlukan akses terprogram ke folder Google Drive.

1.  Buka [Google Cloud Console > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts).
    
2.  Klik **"+ CREATE SERVICE ACCOUNT"**, beri nama (misal: `bpptkg-api-executor`), lalu klik **"CREATE AND CONTINUE"** dan **"DONE"**.
    
3.  Salin alamat email service account yang baru dibuat.
    
4.  Kembali ke folder Google Drive dari **Langkah 1**. Klik kanan pada folder > **Share**.
    
5.  Masukkan alamat email service account, berikan role **Editor**, lalu klik **Send/Share**.
    

### Langkah 3: Unduh Kredensial Google

Aplikasi memerlukan kunci JSON untuk otentikasi.

1.  Di halaman Service Accounts, klik pada service account yang baru dibuat.
    
2.  Pilih tab **"KEYS"** > **"ADD KEY"** > **"Create new key"**.
    
3.  Pilih tipe **JSON** dan klik **"CREATE"**.
    
4.  File JSON akan terunduh. **Ganti nama file tersebut menjadi `google-credentials.json`** dan letakkan di direktori utama (root) proyek ini.
    

### Langkah 4: Jalankan Server MongoDB

Server database MongoDB harus aktif. Pastikan server MongoDB dapat diakses dari tempat kamu akan menjalankan aplikasi ini.

-   **Jika MongoDB ada di mesin yang sama:** Jalankan server (via `mongod` atau MongoDB Compass). Alamatnya biasanya `127.0.0.1` atau `localhost`.
    
-   **Jika MongoDB ada di mesin lain di jaringan:** Pastikan server MongoDB sudah berjalan dan kamu mengetahui alamat IP-nya (contoh: `10.120.8.37`).
    

### Langkah 5: Buat Database & Import Data Awal

Kita akan membuat database dan mengisi koleksi (collection) awal.

1.  Buka `mongosh` dan koneksikan ke server MongoDB-mu.
    
2.  Buat dan masuk ke database `mydb` dengan perintah:
    
    Bash
    
    ```
    use mydb
    ```
    
3.  Dari direktori **utama proyek** di terminal, jalankan `mongoimport` dengan URI yang sesuai dengan lokasimu:
   
    
    ```
    # Ganti 'localhost' dengan IP server MongoDB jika berbeda
    MONGO_SERVER_URI="mongodb://localhost:27017/mydb"
    
    # Impor koleksi rsam_config dan users
    mongoimport --uri $MONGO_SERVER_URI --collection rsam_config --file mydb.rsam_config.json --jsonArray
    mongoimport --uri $MONGO_SERVER_URI --collection users --file my.db.users.json --jsonArray
    ```
    

### Langkah 6: Dapatkan ID Konfigurasi RSAM

Aplikasi perlu ID unik dari dokumen konfigurasi yang baru saja diimpor.

1.  Di `mongosh` (pastikan masih di dalam `use mydb`), jalankan perintah query:
    
    JavaScript
    
    ```
    db.rsam_config.findOne()
    ```
    
2.  Hasilnya akan menampilkan satu dokumen. Salin nilai dari field `_id`.
    
    JSON
    
    ```
    // Contoh output:
    {
      "_id": ObjectId("6810a7f1c99ff35d7545ec02"), // <-- Salin nilai di dalam tanda kutip
      "name": "Default Config",
      // ... field lainnya
    }
    ```
    
3.  **Penting:** Salin **hanya string heksadesimal** di dalam tanda kutip (contoh: `6810a7f1c99ff35d7545ec02`), bukan seluruh `ObjectId(...)`.
    

### Langkah 7: Konfigurasi Environment File (`.env`)

Buat file `.env` dengan menyalin dari contoh yang ada, lalu isi nilainya.

1.  Jalankan di terminal: `cp .env.example .env`
    
2.  Buka file `.env` dan isi nilainya. Penjelasan setiap variabel ada di bawah.
    
    Code snippet
    
    ```
    #-----------------------------------------
    # PENGATURAN DATABASE & SERVER
    #-----------------------------------------
    MONGODB_URI=mongodb://10.120.8.37:27017/mydb
    HOST=10.120.8.37
    PORT=3000
    
    #-----------------------------------------
    # PENGATURAN AUTENTIKASI (JWT)
    #-----------------------------------------
    JWT_SECRET=rahasia_sangat_rahasia
    JWT_EXPIRES_IN=1h
    
    #-----------------------------------------
    # PENGATURAN INTEGRASI GOOGLE DRIVE
    #-----------------------------------------
    GOOGLE_DRIVE_CREDENTIALS="./google-credentials.json"
    GOOGLE_DRIVE_FOLDER_ID=1QGfvkatFbjhvcQPYgWSXhs1uuO7Do5u7
    
    #-----------------------------------------
    # PENGATURAN SPESIFIK APLIKASI
    #-----------------------------------------
    API_BPPTKG="http://192.168.0.45:16030/rsam/?code=MELAB_HHZ_VG_00&t1=-0.0006&rsamP=10&tz=Asia/Jakarta&csv=1"
    RSAM_CONFIG_ID=6810a7f1c99ff35d7545ec02
    ```
    
    -   **MONGODB_URI**: Alamat lengkap ke server MongoDB-mu (dari Langkah 4) diikuti nama database (dari Langkah 5).
        
    -   **HOST**: IP Address tempat aplikasi ini akan berjalan. Gunakan `127.0.0.1` jika hanya untuk akses di mesin yang sama, atau gunakan IP jaringan (misal: `10.120.8.37`) agar bisa diakses dari perangkat lain di jaringan yang sama.
        
    -   **JWT_SECRET**: Kunci rahasia untuk otentikasi. Ganti dengan milikmu yang unik.
        
    -   **GOOGLE_DRIVE_FOLDER_ID**: ID folder dari Langkah 1.
        
    -   **RSAM_CONFIG_ID**: ID yang kamu salin pada Langkah 6.
        

### Langkah 8: Instalasi Dependensi

Instal semua package Node.js yang dibutuhkan proyek.
```
npm install
```

### Langkah 9: Jalankan Proyek

Jalankan server dalam mode pengembangan.
```
npm run dev
```

Server sekarang akan berjalan sesuai alamat `HOST` dan `PORT` yang kamu tentukan (contoh: `http://10.120.8.37:3000`). Setup selesai! 🎉