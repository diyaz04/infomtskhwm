import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Calendar, ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type Opinion } from '../types';
import { formatDate } from '../lib/utils';
import { Button } from '../components/Button';
import { FlyerGenerator, type FlyerData } from '../components/FlyerGenerator';

export function OpiniDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFlyer, setShowFlyer] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('opinions')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setOpinion(data);
      } catch (error) {
        console.error('Error fetching opinion detail:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat detail opini...</div>;
  }

  if (!opinion) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Opini tidak ditemukan</h2>
        <Link to="/opini">
          <Button>Kembali ke Opini</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <Link to="/opini" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-start transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Opini
        </Link>
      </div>

      <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 leading-tight text-center">
          {opinion.title}
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <UserCircle className="w-10 h-10" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900 dark:text-white">{opinion.author_name}</h3>
              {opinion.author_role && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{opinion.author_role}</p>
              )}
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(opinion.published_at || opinion.created_at)}</span>
          </div>
        </div>

        {opinion.cover_image_url && (
          <div className="w-full rounded-xl overflow-hidden mb-8 shadow-sm">
            <img src={opinion.cover_image_url} alt={opinion.title} className="w-full h-auto object-cover max-h-[400px]" />
          </div>
        )}

        <div 
          className="prose prose-slate dark:prose-invert max-w-none prose-lg prose-p:leading-relaxed prose-a:text-primary-start hover:prose-a:text-primary-hoverStart"
          dangerouslySetInnerHTML={{ __html: opinion.content }}
        />
        
        {/* Tombol Flyer */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => setShowFlyer(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors font-medium shadow-sm"
          >
            <ImageIcon className="w-5 h-5" />
            Buat Flyer Opini
          </button>
        </div>
      </article>
    </div>

    {/* Flyer Generator Modal */}
    {showFlyer && opinion && (
      <FlyerGenerator
        data={{
          title: opinion.title,
          content: opinion.content,
          coverImageUrl: opinion.cover_image_url,
          publishedAt: opinion.published_at,
          createdAt: opinion.created_at,
          articleUrl: window.location.href,
        } satisfies FlyerData}
        onClose={() => setShowFlyer(false)}
      />
    )}
    </>
  );
}
