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
          // .eq('status', 'published') // Already handled by RLS if anon, but good practice
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Berita & Informasi</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400">Belum ada berita dalam kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map(news => (
            <article key={news.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-md transition-shadow">
              {news.cover_image_url ? (
                <div className="aspect-video w-full overflow-hidden">
                  <img src={news.cover_image_url} alt={news.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-slate-400">No Image</span>
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  {news.category && (
                    <span className="text-xs font-semibold text-primary-start bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                      {news.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(news.published_at || news.created_at)}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 line-clamp-2">
                  <Link to={`/berita/${news.slug}`} className="hover:text-primary-start transition-colors">
                    {news.title}
                  </Link>
                </h2>
                
                <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow text-sm line-clamp-3">
                  {truncateText(news.content, 150)}
                </p>
                
                <Link to={`/berita/${news.slug}`} className="mt-auto">
                  <Button variant="secondary" className="w-full">
                    Baca Selengkapnya
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
