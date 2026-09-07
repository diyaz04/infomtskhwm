export function formatDate(dateString: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function truncateText(text: string, maxLength: number = 120) {
  if (!text) return '';
  // Strip HTML tags for excerpt
  const stripped = text.replace(/(<([^>]+)>)/gi, "");
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
}

export function optimizeCloudinaryUrl(url: string) {
  if (!url) return url;
  // If it's already a Cloudinary URL, inject f_auto,q_auto
  // Example: https://res.cloudinary.com/demo/image/upload/v1234/file.jpg
  // Target: https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234/file.jpg
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  return url;
}

export function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function getYoutubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export function getTiktokId(url: string) {
  if (!url) return null;
  // match tiktok video id from URL like https://www.tiktok.com/@user/video/7402019946894396678
  const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (match) return match[1];
  
  // Also support short URLs if they resolve to video, but that requires fetching. 
  // For now, assume standard URL or direct embed URL.
  const embedMatch = url.match(/tiktok\.com\/embed\/v2\/(\d+)/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export function getVideoPlatform(url: string): 'youtube' | 'tiktok' | 'unknown' {
  if (!url) return 'unknown';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'unknown';
}
