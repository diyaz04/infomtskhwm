export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  author_name: string | null;
  status: string;
  source?: string;
  source_url?: string | null;
  source_post_id?: string | null;
  tiktok_url?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  likes_count?: number;
}

export interface NewsComment {
  id: string;
  news_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Opinion {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  author_role: string | null;
  status: string;
  source?: string;
  published_at: string | null;
  created_at: string;
}

export interface BuletinEdition {
  id: string;
  title: string;
  edition_number: string | null;
  cover_image_url: string | null;
  original_pdf_url: string | null;
  total_pages: number;
  status: string;
  source?: string;
  published_at: string | null;
  created_at: string;
}

export interface BuletinPage {
  id: string;
  edition_id: string;
  page_number: number;
  image_url: string;
  created_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  position: string;
  category: string;
  photo_url: string | null;
  background_image_url: string | null;
  bio: string | null;
  education: string | null;
  quote: string | null;
  email: string | null;
  phone: string | null;
  subjects: string | null;
  skills: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FeaturedProgram {
  id: string;
  title: string;
  description: string;
  icon_name: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ActivityVideo {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}
