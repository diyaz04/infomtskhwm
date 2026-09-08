import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { type BuletinEdition } from '../types';
import { formatDate, optimizeCloudinaryUrl } from '../lib/utils';
import { FlipbookViewer } from '../components/FlipbookViewer';
import { BookOpen } from 'lucide-react';

export function Buletin() {
  const [editions, setEditions] = useState<BuletinEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdition, setSelectedEdition] = useState<BuletinEdition | null>(null);

  useEffect(() => {
    async function fetchEditions() {
      try {
        const { data, error } = await supabase
          .from('buletin_editions')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) throw error;
        if (data) setEditions(data);
      } catch (error) {
        console.error('Error fetching buletin editions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEditions();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat buletin...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Buletin Digital</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Jelajahi berbagai edisi buletin MTs KHWM secara interaktif. Klik pada cover untuk membaca.
        </p>
      </div>

      {editions.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400">Belum ada edisi buletin yang diterbitkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {editions.map(edition => (
            <div 
              key={edition.id}
              onClick={() => setSelectedEdition(edition)}
              className="group cursor-pointer flex flex-col relative"
            >
              <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded shadow-sm border border-white/20">
                {edition.source || 'Redaksi'}
              </div>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md mb-4 border border-slate-200 dark:border-slate-800 group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                {edition.cover_image_url ? (
                  <img 
                    src={optimizeCloudinaryUrl(edition.cover_image_url)} 
                    alt={edition.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-col p-4 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mb-2" />
                    <span className="text-sm text-slate-400">No Cover</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex items-center justify-center bg-primary-start text-white text-sm font-semibold py-2 px-4 rounded-full">
                    Baca Sekarang
                  </div>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-start transition-colors">
                {edition.title}
              </h3>
              
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto">
                <span>{edition.edition_number && `Edisi ${edition.edition_number}`}</span>
                <span>{formatDate(edition.published_at || edition.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEdition && (
        <FlipbookViewer 
          editionId={selectedEdition.id} 
          editionTitle={selectedEdition.title}
          onClose={() => setSelectedEdition(null)} 
        />
      )}
    </div>
  );
}
