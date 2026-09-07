import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { type Opinion } from '../types';
import { formatDate, truncateText } from '../lib/utils';
import { Button } from '../components/Button';
import { UserCircle } from 'lucide-react';

export function Opini() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpinions() {
      try {
        const { data, error } = await supabase
          .from('opinions')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        if (data) setOpinions(data);
      } catch (error) {
        console.error('Error fetching opinions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOpinions();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat opini...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Opini Guru & Tokoh</h1>
        <p className="text-slate-600 dark:text-slate-400">Tulisan inspiratif dan pandangan berharga dari keluarga besar MTs KHWM dan tokoh masyarakat.</p>
      </div>

      {opinions.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400">Belum ada opini yang diterbitkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opinions.map(opinion => (
            <article key={opinion.id} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-md transition-shadow">
              
              <div className="flex items-center gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                  <UserCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{opinion.author_name}</h3>
                  {opinion.author_role && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{opinion.author_role}</p>
                  )}
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="text-xs text-primary-start font-medium mb-2">
                  {formatDate(opinion.published_at || opinion.created_at)}
                </div>
                <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 line-clamp-2">
                  <Link to={`/opini/${opinion.slug}`} className="hover:text-primary-start transition-colors">
                    {opinion.title}
                  </Link>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 italic">
                  "{truncateText(opinion.content, 180)}"
                </p>
              </div>
              
              <Link to={`/opini/${opinion.slug}`} className="mt-auto">
                <Button variant="secondary" className="w-full">
                  Baca Selengkapnya
                </Button>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
