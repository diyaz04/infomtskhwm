-- 1. Tabel "news" (Berita)
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    category TEXT,
    author_name TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel "opinions" (Opini)
CREATE TABLE opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT NOT NULL,
    author_role TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel "buletin_editions" (Edisi Buletin)
CREATE TABLE buletin_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    edition_number TEXT,
    cover_image_url TEXT,
    original_pdf_url TEXT,
    total_pages INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel "buletin_pages" (Halaman per Edisi)
CREATE TABLE buletin_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID REFERENCES buletin_editions(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT buletin_pages_edition_id_page_number_key UNIQUE (edition_id, page_number)
);

-- 5. Tabel "staff" (Guru & Staf)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    position TEXT NOT NULL,
    category TEXT NOT NULL,
    photo_url TEXT,
    bio TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabel "featured_programs" (Program Unggulan)
CREATE TABLE featured_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buletin_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buletin_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_programs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLICIES FOR PUBLIC (ANON) - HANYA SELECT UNTUK DATA YANG PUBLISHED/ACTIVE
-- ==============================================================================

-- News
CREATE POLICY "Public can view published news"
ON news FOR SELECT USING (status = 'published');

-- Opinions
CREATE POLICY "Public can view published opinions"
ON opinions FOR SELECT USING (status = 'published');

-- Buletin Editions
CREATE POLICY "Public can view published buletin editions"
ON buletin_editions FOR SELECT USING (status = 'published');

-- Buletin Pages (bisa dilihat jika edisinya published)
CREATE POLICY "Public can view pages of published buletin editions"
ON buletin_pages FOR SELECT USING (
    edition_id IN (SELECT id FROM buletin_editions WHERE status = 'published')
);

-- Staff
CREATE POLICY "Public can view active staff"
ON staff FOR SELECT USING (is_active = true);

-- Featured Programs
CREATE POLICY "Public can view active featured programs"
ON featured_programs FOR SELECT USING (is_active = true);


-- ==============================================================================
-- POLICIES FOR AUTHENTICATED (ADMIN) - BISA MELAKUKAN SEGALA HAL (INSERT, UPDATE, DELETE, SELECT SEMUA)
-- ==============================================================================

-- News
CREATE POLICY "Admin can manage news" ON news
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Opinions
CREATE POLICY "Admin can manage opinions" ON opinions
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Buletin Editions
CREATE POLICY "Admin can manage buletin editions" ON buletin_editions
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Buletin Pages
CREATE POLICY "Admin can manage buletin pages" ON buletin_pages
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Staff
CREATE POLICY "Admin can manage staff" ON staff
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Featured Programs
CREATE POLICY "Admin can manage featured programs" ON featured_programs
FOR ALL TO authenticated USING (true) WITH CHECK (true);
