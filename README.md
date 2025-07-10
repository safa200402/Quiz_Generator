# Petunjuk Penggunaan Template Quiz HTML Satu File

---

## Langkah-Langkah Sederhana:

1. **Ubah Element Descripsi**  
   Ganti isi elemen deskripsi dengan data deskripsi quiz dalam format HTML.

2. **Ubah Link Tombol More Quiz**  
   Ganti atribut `href` pada elemen tombol dengan id `#moreQuizBtn` sesuai kebutuhan.

3. **Ubah `encodedToken` dan `chatID` Telegram**  
   - Gunakan halaman **"Encode & Decode Base64.html"** untuk membuat `encodedToken` dari bot token Telegram-mu.  
   - Pastikan user chatID sudah memulai bot dengan perintah `start`.

4. **Ubah Nama File**  
   Nama title dari quiz sesuai nama file.

5. **Ubah Variabel `questions`**  
   Untuk mengganti soal-soal quiz.

---

## Cara Membuat Soal

1. Siapkan file teks materi (string teks).

2. Gunakan ChatGPT dengan prompt berikut untuk membuat soal pilihan ganda berbahasa Arab:
```
Aku ingin kamu di chat ini membuatkan soal pilihan ganda dari text yang akan aku berikan
Aku ingin jenis soalnya adalah ma‘lumatiyyah
Contoh:  

➡️Buah yang kaya akan vitamin C adalah...?
Pisang
Semangka
Jeruk ✅
Apel

Jangan menggunakan simbol selain yang disebutkan.
Gunakan Bahasa Arab.
```

3. Jika ingin menambahkan soal jawaban singkat sekaligus soal pilihan ganda, gunakan prompt ini:
```
Aku ingin kamu di chat ini membuatkan soal pilihan ganda dan soal jawaban singkat dari text yang akan aku berikan
Aku ingin jenis soalnya adalah ma‘lumatiyyah
Contoh:  
➡️Warna domba adalah?  
Putih ✅  
➡️Buah yang kaya akan vitamin C adalah...?
Pisang
Semangka
Jeruk ✅
Apel

Jangan menggunakan simbol selain yang disebutkan.
Gunakan Bahasa Arab.
```
4. Modifikasi prompt sesuai kebutuhan untuk hasil soal yang diinginkan.

5. Copy-paste materi teks maksimal sekitar **61 baris** ke ChatGPT untuk membuat soal.

6. Pastikan hasil dari AI adalah seperti ini:
➡️Buah yang kaya akan vitamin C adalah...?
Pisang
Semangka
Jeruk ✅
Apel

7. Setelah semanya dimodifikasi, lakukan obfuscator: copy file quiz.html ke folder obfuscator jalankan app.js atau app.exe supaya code tidak bisa di baca.

---

### Tips Tambahan

- Gunakan token bot Telegram yang valid dan sudah aktif.  
- Pastikan user sudah start chat dengan bot sebelum mengambil chatID.  
- Soal dalam bahasa Arab sesuai contoh untuk menjaga konsistensi.

---

Selamat mencoba dan semoga quiz-mu sukses!
