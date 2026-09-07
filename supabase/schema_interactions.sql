-- Fitur Likes dan Komentar untuk Berita

-- 1. Tambahkan kolom likes_count ke tabel news
ALTER TABLE news ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;

-- 2. Buat tabel komentar berita
CREATE TABLE IF NOT EXISTS news_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES news(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Aktifkan RLS untuk news_comments
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- 4. Policy agar publik bisa membaca komentar
CREATE POLICY "Public can view news comments" 
ON news_comments FOR SELECT 
USING (true);

-- 5. Policy agar publik bisa mengirim komentar tanpa login
CREATE POLICY "Public can insert news comments" 
ON news_comments FOR INSERT 
WITH CHECK (true);

-- 6. Fungsi RPC (Remote Procedure Call) untuk menambah jumlah like dengan aman
CREATE OR REPLACE FUNCTION increment_news_like(news_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE news 
  SET likes_count = COALESCE(likes_count, 0) + 1 
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
