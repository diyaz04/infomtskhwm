-- Script Dummy Data untuk MTs KH. A. Wahab Muhsin
-- Pastikan Anda sudah menjalankan script schema tabel (termasuk activity_videos) sebelumnya.

-- HAPUS DATA LAMA (Opsional: Uncomment baris di bawah jika ingin mengosongkan data sebelumnya)
-- TRUNCATE TABLE news, opinions, buletin_editions, buletin_pages, staff, featured_programs, activity_videos RESTART IDENTITY CASCADE;

-- 1. Insert News (Berita)
INSERT INTO news (title, slug, content, category, author_name, status, published_at, cover_image_url) VALUES 
('MTs KHWM Raih Juara 1 Lomba Pramuka Tingkat Provinsi', 'mts-khwm-raih-juara-1-pramuka', '<p>Prestasi gemilang kembali diraih oleh regu Pramuka MTs KH. A. Wahab Muhsin...</p>', 'Prestasi', 'Admin', 'published', now(), 'https://images.unsplash.com/photo-1590402237072-4d320eaee658?auto=format&fit=crop&q=80&w=800'),
('Pelaksanaan Ujian Semester Genap Tahun 2026 Berjalan Lancar', 'ujian-semester-genap-2026', '<p>Seluruh siswa mengikuti ujian dengan tertib dan mematuhi aturan madrasah...</p>', 'Akademik', 'Admin', 'published', now() - interval '1 day', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800'),
('Kunjungan Edukatif Siswa Kelas VIII ke Museum Sejarah', 'kunjungan-edukatif-museum', '<p>Kegiatan outdoor learning ini bertujuan untuk memberikan wawasan sejarah...</p>', 'Kegiatan', 'Admin', 'published', now() - interval '2 day', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'),
('Penerimaan Peserta Didik Baru (PPDB) Gelombang 1 Dibuka', 'ppdb-gelombang-1-dibuka', '<p>Pendaftaran telah resmi dibuka untuk tahun ajaran baru. Segera daftarkan putra/putri Anda...</p>', 'Pengumuman', 'Panitia PPDB', 'published', now() - interval '3 day', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'),
('Ekstrakurikuler Paskibra Laksanakan Diklat Gabungan', 'diklat-paskibra-gabungan', '<p>Diklat gabungan dilaksanakan selama dua hari di lapangan utama madrasah...</p>', 'Ekstrakurikuler', 'Pembina Paskibra', 'published', now() - interval '4 day', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800'),
('Khotmil Qur''an dan Doa Bersama Jelang Ujian Nasional', 'khotmil-quran-doa-bersama', '<p>Ribuan doa dipanjatkan demi kesuksesan siswa-siswi kelas IX dalam menghadapi ujian...</p>', 'Kegiatan', 'Admin', 'published', now() - interval '5 day', 'https://images.unsplash.com/photo-1606771146200-a15d97f3b890?auto=format&fit=crop&q=80&w=800'),
('Tim Futsal MTs KHWM Tembus Babak Final Liga Pelajar', 'futsal-masuk-final', '<p>Dengan kerja keras dan disiplin, tim futsal kita berhasil mengalahkan lawan-lawannya...</p>', 'Prestasi', 'Admin', 'published', now() - interval '6 day', 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=800');

-- 2. Insert Opinions (Opini)
INSERT INTO opinions (title, slug, content, author_name, author_role, status, published_at, cover_image_url) VALUES
('Pentingnya Adab Sebelum Ilmu di Era Digital', 'pentingnya-adab-sebelum-ilmu', '<p>Di tengah pesatnya teknologi, akhlak sering dilupakan...</p>', 'KH. Ahmad, S.Ag', 'Kepala Madrasah', 'published', now(), 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'),
('Membangun Literasi Sejak Dini di Madrasah', 'membangun-literasi-madrasah', '<p>Buku adalah jendela dunia. Madrasah harus menjadi pionir literasi...</p>', 'Siti Aminah, M.Pd', 'Guru Bahasa Indonesia', 'published', now() - interval '10 day', 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=800'),
('Menjaga Kesehatan Mental Remaja di Masa Pubertas', 'kesehatan-mental-remaja', '<p>Sebagai pendidik, kita harus peka terhadap perubahan psikologis siswa...</p>', 'Drs. Budi Santoso', 'Guru BK', 'published', now() - interval '20 day', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800'),
('Integrasi Pendidikan Agama dan Sains', 'integrasi-agama-sains', '<p>Agama dan sains bukanlah dua hal yang bertentangan, melainkan saling melengkapi...</p>', 'Ust. Hasan, S.Pd.I', 'Guru IPA', 'published', now() - interval '30 day', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800');

-- 3. Insert Buletin
DO $$
DECLARE
  b1 uuid := gen_random_uuid();
  b2 uuid := gen_random_uuid();
  b3 uuid := gen_random_uuid();
  b4 uuid := gen_random_uuid();
BEGIN
  INSERT INTO buletin_editions (id, title, edition_number, status, published_at, total_pages, cover_image_url) VALUES
  (b1, 'Gema Madrasah - Edisi Spesial Ramadhan', 'Vol 12', 'published', now(), 1, 'https://images.unsplash.com/photo-1585806655184-e58f03f71c4c?auto=format&fit=crop&q=80&w=600'),
  (b2, 'Gema Madrasah - Menyambut Tahun Ajaran Baru', 'Vol 11', 'published', now() - interval '30 day', 1, 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&q=80&w=600'),
  (b3, 'Gema Madrasah - Edisi Hari Santri', 'Vol 10', 'published', now() - interval '60 day', 1, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600'),
  (b4, 'Gema Madrasah - Kelulusan Angkatan 2025', 'Vol 9', 'published', now() - interval '90 day', 1, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600');

  INSERT INTO buletin_pages (edition_id, page_number, image_url) VALUES
  (b1, 1, 'https://images.unsplash.com/photo-1585806655184-e58f03f71c4c?auto=format&fit=crop&q=80&w=600'),
  (b2, 1, 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&q=80&w=600'),
  (b3, 1, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600'),
  (b4, 1, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600');
END $$;

-- 4. Insert Staff (Guru & Staf)
INSERT INTO staff (full_name, position, category, display_order, is_active, photo_url, bio) VALUES
('KH. Ahmad, S.Ag', 'Kepala Madrasah', 'Pimpinan', 1, true, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', 'Mendedikasikan hidup untuk pendidikan Islam sejak tahun 2000.'),
('Siti Aminah, M.Pd', 'Wakil Kepala Bid. Kurikulum', 'Pimpinan', 2, true, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', 'Berfokus pada pengembangan kurikulum modern berbasis akhlak.'),
('Drs. Budi Santoso', 'Guru Matematika', 'Guru', 3, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', 'Mengajar matematika dengan pendekatan praktis dan menyenangkan.'),
('Ust. Hasan, S.Pd.I', 'Guru PAI', 'Guru', 4, true, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', 'Pembina keagamaan dan tahfidz qur''an.'),
('Agus Supriyadi', 'Kepala Tata Usaha', 'Staf', 5, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', 'Mengelola administrasi dan pelayanan sarana prasarana madrasah.'),
('Sari Wijayanti', 'Staf Administrasi', 'Staf', 6, true, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', 'Membantu urusan kesiswaan dan persuratan umum.');

-- 5. Insert Featured Programs
INSERT INTO featured_programs (title, description, icon_name, is_active, display_order) VALUES
('Tahfidz Al-Qur''an', 'Program menghafal Al-Qur''an dengan target minimal 3 Juz selama masa pendidikan 3 tahun.', 'BookOpen', true, 1),
('Bilingual Class', 'Kelas khusus dengan pengantar bahasa Arab dan Inggris untuk mata pelajaran tertentu.', 'Globe', true, 2),
('Pramuka Garuda', 'Pembinaan kepramukaan intensif hingga meraih tingkatan tertinggi Pramuka Garuda.', 'Target', true, 3),
('IT Club & Robotika', 'Ekstrakurikuler unggulan di bidang teknologi informasi, coding, dan dasar robotika.', 'Laptop', true, 4);

-- 6. Insert Activity Videos (Youtube URLs)
INSERT INTO activity_videos (title, youtube_url, display_order) VALUES
('Kemeriahan HUT RI ke-81 di MTs KHWM', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
('Dokumenter: Sejarah Berdirinya MTs KH. A. Wahab Muhsin', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 2),
('Penampilan Tim Marawis pada Peringatan Maulid Nabi', 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', 3),
('Karya Bakti Sosial Siswa di Lingkungan Sekitar', 'https://www.youtube.com/watch?v=L_jWHffIx5E', 4);
