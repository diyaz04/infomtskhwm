import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { type News } from '../types';
import { formatDate, truncateText } from '../lib/utils';
import { Button } from '../components/Button';

export function Berita() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published') // Only show published
          .order('published_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setNewsList(data);
          const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean))) as string[];
          setCategories(['Semua', ...uniqueCategories]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  const filteredNews = activeCategory === 'Semua' 
    ? newsList 
    : newsList.filter(item => item.category === activeCategory);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat berita...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Berita Terbaru</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary-start text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">Belum ada berita di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map(news => (
            <Link key={news.id} to={`/berita/${news.slug}`} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 dark:border-slate-700">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                {news.cover_image_url ? (
                  <img src={news.cover_image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                )}
                {news.category && (
                  <div className="absolute top-4 left-4 bg-primary-start text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {news.category}
                  </div>
                )}
                {news.source === 'instagram' ? (
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Instagram
                  </div>
                ) : news.source && news.source !== 'manual' && news.source !== 'Redaksi' ? (
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-md shadow-sm border border-white/20">
                    {news.source}
                  </div>
                ) : null}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(news.published_at || news.created_at)}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 line-clamp-2">
                  <span className="group-hover:text-primary-start transition-colors">
                    {news.title}
                  </span>
                </h2>
                
                <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow text-sm line-clamp-3">
                  {truncateText(news.content, 150)}
                </p>
                
                <div className="mt-auto">
                  <Button variant="secondary" className="w-full group-hover:bg-primary-start group-hover:text-white transition-colors">
                    Baca Selengkapnya
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
