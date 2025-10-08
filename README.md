# Praktikum Pemrograman Web  🌐

## Modul 2 📖
Javascript dan Typescript

## Anggota Kelompok 👥
| Nama    | NRP  |
|---------|------|
| Imam Mahmud Dalil Fauzan  | 5027241100  |
| Mochammad Atha Tajuddin | 5027241093  |
| Mey Rosalina | 5027241004  |

## Membuat Website **Kumpulan Resep dengan Autentikasi**.
Web Terdiri dari **Halaman Login** dan **Halaman Kumpulan Resep**. 

API yang digunakan:
- Users API (untuk login): `https://dummyjson.com/users`.
- Recipes API (Recipes Collection): `https://dummyjson.com/recipes`.

Semua data dipanggil menggunakan `fetch`.

### Spesifikasi Fitur ⚙️
#### Login Page 🔐
- Autentikasi user menggunakan data dari `https://dummyjson.com/users`.
- Username harus sesuai dengan data di dummy, password **bebas** tetapi **tidak boleh kosong**.

  Contoh `username` yang bisa digunakan:
    - `emilys`
    - `emilyme`
    - `hbingley1`
    - `rshawe2`
    - `kmeus4`
- Menampilkan loading state dan memberi jeda 1.5 detik saat proses login berlangsung.
- Error Handling ketika username/password salah atau koneksi API bermasalah.
- Menampilkan success message saat login berhasil.
- Setelah login sukses, otomatis diarahkan ke page recipes.
- Variabel `firstName` dari user tersimpan di `localStorage`.

#### Recipes Page 😋
- Halaman ini tidak bisa diakses ketika belum login (ketika user sudah tersimpan pada `localStorage`).
- Terdapat navigation bar dengan nama user dan tombol logout.
- Setiap card terdapat gambar, nama, waktu masak, tingkat kesulitan, cuisine, rating, dan ingredients.
- Semua data bersumber dari `https://dummyjson.com/recipes`.
- Fitur search real-time (debouncing) berdasarkan nama resep, cuisine, ingredients, dan tags.
- Fitur filter by cuisine melalui dropdown.
- Fitur filter by difficult melalui dropdown.
- Button "View Full Recipe" berfungsi untuk menampilkan detail lebih lengkap mengenai resep makanan tersebut.
- Terdapat Button "Show More" untuk menampilkan card berikutnya ketika terlalu banyak recipes yang ditampilkan (defaultnya 9 resep).
- Disertakan Error Handling ketika terjadi hal tak terduga seperti fetch gagal.
