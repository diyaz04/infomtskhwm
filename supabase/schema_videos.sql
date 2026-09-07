-- Tabel "activity_videos" (Video Kegiatan)
CREATE TABLE activity_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view videos"
ON activity_videos FOR SELECT USING (true);

CREATE POLICY "Admin can manage videos" ON activity_videos
FOR ALL TO authenticated USING (true) WITH CHECK (true);
