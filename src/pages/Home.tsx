import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { type News, type Opinion, type BuletinEdition, type FeaturedProgram, type ActivityVideo } from '../types';
import { formatDate, optimizeCloudinaryUrl, getYoutubeId, getTiktokId, getVideoPlatform } from '../lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight, PlayCircle, BookOpen, Star, Award, Users, Target, Laptop, Globe, Music, Activity, Heart } from 'lucide-react';
import { FlipbookViewer } from '../components/FlipbookViewer';

const ICON_MAP: Record<string, any> = { BookOpen, Star, Award, Users, Target, Laptop, Globe, Music, Activity, Heart };

export function Home() {
  const [highlightNews, setHighlightNews] = useState<News[]>([]);
  const [buletin, setBuletin] = useState<BuletinEdition[]>([]);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [programs, setPrograms] = useState<FeaturedProgram[]>([]);
  const [videos, setVideos] = useState<ActivityVideo[]>([]);
  
  // Categorized News state
  const [allNews, setAllNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [newsPage, setNewsPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [selectedBuletin, setSelectedBuletin] = useState<BuletinEdition | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ActivityVideo | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [newsRes, buletinRes, opinionRes, progRes, videoRes] = await Promise.all([
          supabase.from('news').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(20),
          supabase.from('buletin_editions').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(4),
          supabase.from('opinions').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(4),
          supabase.from('featured_programs').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('activity_videos').select('*').order('display_order', { ascending: true }).limit(5)
        ]);

        if (newsRes.data) {
          setHighlightNews(newsRes.data.slice(0, 5));
          setAllNews(newsRes.data);
          const cats = Array.from(new Set(newsRes.data.map(n => n.category).filter(Boolean))) as string[];
          setCategories(['Semua', ...cats]);
        }
        if (buletinRes.data) setBuletin(buletinRes.data);
        if (opinionRes.data) setOpinions(opinionRes.data);
        if (progRes.data) setPrograms(progRes.data);
        if (videoRes.data && videoRes.data.length > 0) {
          setVideos(videoRes.data);
          setSelectedVideo(videoRes.data[0]);
        }

      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-rotate highlight news
  useEffect(() => {
    if (highlightNews.length <= 1) return;
    const interval = setInterval(() => {
      setHighlightIndex(prev => (prev + 1) % highlightNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [highlightNews]);

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-500">Memuat halaman...</div>;
  }

  const currentHighlight = highlightNews[highlightIndex];

  // News Filtering
  const filteredNews = activeCategory === 'Semua' 
    ? allNews.slice(1) // exclude hero
    : allNews.filter(n => n.category === activeCategory);
  
  const newsPerPage = 6;
  const paginatedNews = filteredNews.slice(newsPage * newsPerPage, (newsPage + 1) * newsPerPage);
  const maxNewsPage = Math.ceil(filteredNews.length / newsPerPage) - 1;

  const nextNewsPage = () => setNewsPage(p => Math.min(p + 1, maxNewsPage));
  const prevNewsPage = () => setNewsPage(p => Math.max(p - 1, 0));

  return (
    <div className="bg-slate-50 dark:bg-slate-900 w-full">
      {/* BLOK 2: Berita Terkini */}
      {currentHighlight && (
        <div className="container mx-auto px-4 md:px-6 pt-4 pb-2 md:py-6">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 h-10 md:h-12 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-start to-primary-end text-white font-bold text-[10px] md:text-sm px-3 md:px-5 h-full flex items-center gap-1.5 shrink-0">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              BERITA TERKINI <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </div>
            <div className="flex-1 overflow-hidden px-3 md:px-4">
              <Link to={`/berita/${currentHighlight.slug}`} className="text-[11px] md:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-start truncate block transition-colors">
                {currentHighlight.title}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 space-y-10 md:space-y-12">
        {/* BLOK 3: Hero + Buletin */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Hero News Slider */}
          <div className="lg:col-span-8">
            {currentHighlight && (
              <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-md group">
                <Link to={`/berita/${currentHighlight.slug}`} className="block w-full h-full">
                  <img src={optimizeCloudinaryUrl(currentHighlight.cover_image_url || '')} alt={currentHighlight.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-5 md:p-10">
                    {currentHighlight.category && (
                      <span className="bg-gradient-to-r from-primary-start to-primary-end text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full w-max mb-3 md:mb-4 shadow-sm">
                        {currentHighlight.category.toUpperCase()}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-snug group-hover:text-green-300 transition-colors line-clamp-3">
                      {currentHighlight.title}
                    </h2>
                    <div className="text-slate-300 text-xs md:text-sm mt-3 flex items-center gap-3 mb-4">
                      <span>{formatDate(currentHighlight.published_at || currentHighlight.created_at)}</span>
                      {currentHighlight.author_name && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                          <span>{currentHighlight.author_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
                  {highlightNews.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={(e) => { e.preventDefault(); setHighlightIndex(idx); }}
                      className={`w-2 h-2 rounded-full transition-all ${idx === highlightIndex ? 'bg-primary-start w-6' : 'bg-white/60 hover:bg-white'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Buletin */}
          <div className="lg:col-span-4 flex flex-col mt-4 md:mt-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white border-l-[5px] border-primary-start pl-3">
                Bulletin Terkini
              </h3>
              <Link to="/buletin" className="text-sm font-medium text-primary-start flex items-center gap-1 hover:underline">
                Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 flex-grow content-start">
              {buletin.slice(0,4).map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBuletin(b)}
                  className="cursor-pointer group flex flex-col items-start"
                  style={{ perspective: '800px' }}
                >
                  {/* 3D Book Wrapper */}
                  <div
                    className="relative w-full transition-transform duration-500 ease-out group-hover:[transform:rotateY(-8deg)_translateX(4px)]"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Book Cover (Front face) */}
                    <div className="relative w-full aspect-[3/4] rounded-r-md overflow-hidden shadow-[6px_6px_20px_rgba(0,0,0,0.25)] dark:shadow-[6px_6px_20px_rgba(0,0,0,0.5)]">
                      {b.cover_image_url ? (
                        <img
                          src={optimizeCloudinaryUrl(b.cover_image_url)}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-400 opacity-60" />
                        </div>
                      )}
                      {/* Shine overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>

                    {/* Spine (left edge) */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-l-sm bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-900 dark:to-slate-700"
                      style={{
                        width: '14px',
                        transform: 'rotateY(-90deg) translateX(-7px)',
                        transformOrigin: 'left center',
                        boxShadow: '-2px 0 6px rgba(0,0,0,0.3)',
                        background: b.cover_image_url ? 'linear-gradient(to right, #1e293b, #334155)' : 'linear-gradient(to right, #334155, #475569)'
                      }}
                    ></div>

                    {/* Page edge / paper stack (right side) */}
                    <div
                      className="absolute top-[2px] right-[-6px] h-[calc(100%-4px)] w-[6px] rounded-r-sm"
                      style={{
                        background: 'repeating-linear-gradient(to bottom, #f1f5f9 0px, #e2e8f0 1px, #f8fafc 1px, #f8fafc 3px)',
                        boxShadow: '1px 0 3px rgba(0,0,0,0.15)'
                      }}
                    ></div>
                  </div>

                  {/* Title below book */}
                  <h4 className="mt-3 text-[11px] md:text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary-start transition-colors leading-snug w-full pr-1">
                    {b.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BLOK 4: Berita + Opini */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          {/* Kolom Kiri: Berita List */}
          <div className="lg:col-span-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b-2 border-slate-200 dark:border-slate-800 pb-2 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-primary-start">
              Berita Utama
            </h3>
            
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-6 border-b border-slate-200 dark:border-slate-700 mb-6 scrollbar-hide pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setNewsPage(0); }}
                  className={`text-sm font-bold whitespace-nowrap pb-2 border-b-2 transition-colors ${activeCategory === cat ? 'border-primary-start text-primary-start' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {paginatedNews.map(news => (
                <Link key={news.id} to={`/berita/${news.slug}`} className="flex gap-4 group">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    {news.cover_image_url && <img src={optimizeCloudinaryUrl(news.cover_image_url)} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                  </div>
                  <div className="flex flex-col py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary-start font-bold">{news.category}</span>
                      {news.source === 'instagram' ? (
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                          Instagram
                        </span>
                      ) : news.source && news.source !== 'manual' && news.source !== 'Redaksi' ? (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">{news.source}</span>
                      ) : null}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-3 group-hover:text-primary-start transition-colors">
                      {news.title}
                    </h4>
                    <span className="text-xs text-slate-500 mt-auto">{formatDate(news.published_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredNews.length > newsPerPage && (
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={prevNewsPage} disabled={newsPage === 0} className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextNewsPage} disabled={newsPage >= maxNewsPage} className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Opini */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 mb-6 pb-2 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-primary-start">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Opini</h3>
              <Link to="/opini" className="text-xs text-slate-500 hover:text-primary-start">Lihat lebih banyak &gt;</Link>
            </div>

            <div className="space-y-6">
              {opinions.map((op, idx) => (
                <Link key={op.id} to={`/opini/${op.slug}`} className={`group ${idx === 0 ? 'block' : 'flex gap-4'}`}>
                  {idx === 0 ? (
                    // Featured Opini
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-sm mb-4">
                      {op.cover_image_url && <img src={optimizeCloudinaryUrl(op.cover_image_url)} alt={op.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {op.source || 'Redaksi'}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                        <div className="text-primary-start font-bold text-sm mb-1">{op.author_name}</div>
                        <h4 className="text-white font-bold text-lg leading-tight group-hover:text-green-300 transition-colors">{op.title}</h4>
                      </div>
                    </div>
                  ) : (
                    // Small list items
                    <>
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {op.cover_image_url && <img src={optimizeCloudinaryUrl(op.cover_image_url)} alt={op.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                      </div>
                      <div className="flex flex-col py-0.5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-primary-start text-xs font-bold">{op.author_name}</div>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">{op.source || 'Redaksi'}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight line-clamp-2 group-hover:text-primary-start transition-colors">
                          {op.title}
                        </h4>
                      </div>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BLOK 5: Video Section */}
        {videos.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-16 after:h-1 after:bg-primary-start after:rounded-full">
                  Galeri Video
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm max-w-2xl">
                  Kumpulan video dokumentasi kegiatan dan profil MTs KH. A. Wahab Muhsin. Kunjungi channel media sosial kami untuk video selengkapnya.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 shrink-0 flex items-center gap-3">
                <a 
                  href="https://www.youtube.com/@mtskhawahabmuhsin" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 bg-[#FF0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-md shadow-red-500/20"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
                  YouTube
                </a>
                <a 
                  href="https://www.tiktok.com/@mtskhawahabmuhsin?_r=1&_t=ZS-99Wnj8EFRd1" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-md shadow-slate-900/20 border border-slate-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.94-5.18 3.13-6.52 1.39-.85 3.03-1.12 4.62-.94v4.06c-.66-.17-1.35-.12-1.98.11-.96.34-1.66 1.18-1.89 2.15-.31 1.34.42 2.75 1.71 3.23 1.18.44 2.54.02 3.29-.93.57-.74.83-1.67.84-2.6.02-6.52.01-13.04.01-19.56H12.525z"/></svg>
                  TikTok
                </a>
              </div>
            </div>
            
            <section className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Main Player */}
              <div className="lg:col-span-8 p-6 md:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-700">
                <h3 className="text-xl font-bold mb-4">{selectedVideo?.title || videos[0].title}</h3>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
                  {(() => {
                    const currentVidUrl = selectedVideo?.youtube_url || videos[0].youtube_url;
                    const platform = getVideoPlatform(currentVidUrl);
                    if (platform === 'youtube') {
                      return (
                        <iframe 
                          src={`https://www.youtube.com/embed/${getYoutubeId(currentVidUrl)}?rel=0`} 
                          title={selectedVideo?.title || videos[0].title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        ></iframe>
                      );
                    } else if (platform === 'tiktok') {
                      return (
                        <iframe 
                          src={`https://www.tiktok.com/embed/v2/${getTiktokId(currentVidUrl)}`} 
                          title={selectedVideo?.title || videos[0].title}
                          allow="encrypted-media;" 
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        ></iframe>
                      );
                    } else {
                      return <span className="text-slate-500">Video tidak didukung</span>;
                    }
                  })()}
                </div>
              </div>
              
              {/* Sidebar Playlist */}
              <div className="lg:col-span-4 bg-slate-800 flex flex-col h-[400px] lg:h-auto">
                <div className="p-5 border-b border-slate-700">
                  <h4 className="font-bold text-lg">Video Kegiatan MTs</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {videos.map((vid) => {
                    const isSelected = selectedVideo ? selectedVideo.id === vid.id : videos[0].id === vid.id;
                    const platform = getVideoPlatform(vid.youtube_url);
                    return (
                    <div key={vid.id} onClick={() => setSelectedVideo(vid)} className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}>
                      <div className="w-24 h-16 shrink-0 bg-slate-900 rounded-md overflow-hidden relative">
                        {platform === 'youtube' ? (
                          <img src={`https://img.youtube.com/vi/${getYoutubeId(vid.youtube_url)}/mqdefault.jpg`} alt={vid.title} className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center opacity-80">
                            <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.94-5.18 3.13-6.52 1.39-.85 3.03-1.12 4.62-.94v4.06c-.66-.17-1.35-.12-1.98.11-.96.34-1.66 1.18-1.89 2.15-.31 1.34.42 2.75 1.71 3.23 1.18.44 2.54.02 3.29-.93.57-.74.83-1.67.84-2.6.02-6.52.01-13.04.01-19.56H12.525z"/></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center text-white/80">
                          {isSelected && <span className="absolute inset-0 border-2 border-primary-start rounded-md"></span>}
                          <PlayCircle className={`w-6 h-6 ${isSelected ? 'text-primary-start' : ''}`} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h5 className="font-medium text-sm line-clamp-2 leading-tight">{vid.title}</h5>
                        {isSelected && <span className="text-primary-start text-[10px] uppercase font-bold mt-1 tracking-wider">Sedang Diputar</span>}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </section>
          </div>
        )}

        {/* BLOK 6: Program Unggulan */}
        <section className="pt-12 pb-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Program Unggulan</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-primary-start to-primary-end mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map(prog => {
              const IconComp = prog.icon_name ? ICON_MAP[prog.icon_name] || Star : Star;
              return (
                <Link key={prog.id} to="/program-unggulan" className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-primary-start mb-5 group-hover:scale-110 transition-transform">
                    <IconComp className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-start transition-colors">{prog.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">{prog.description}</p>
                </Link>
              )
            })}
          </div>
        </section>

      </div>

      {/* Buletin Viewer Modal */}
      {selectedBuletin && <FlipbookViewer editionId={selectedBuletin.id} editionTitle={selectedBuletin.title} onClose={() => setSelectedBuletin(null)} />}
    </div>
  );
}
