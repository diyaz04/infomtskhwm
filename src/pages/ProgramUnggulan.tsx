import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { type FeaturedProgram } from '../types';
import { optimizeCloudinaryUrl } from '../lib/utils';
import { Book, Award, Star, Users, Target, Laptop, Globe, Music, Activity, Heart } from 'lucide-react';

const ICON_MAP: Record<string, any> = { Book, Award, Star, Users, Target, Laptop, Globe, Music, Activity, Heart };

export function ProgramUnggulan() {
  const [programs, setPrograms] = useState<FeaturedProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const { data, error } = await supabase
          .from('featured_programs')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data) setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Memuat program unggulan...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Program Unggulan</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Berbagai program dan fasilitas terbaik yang kami tawarkan untuk menunjang prestasi dan bakat siswa MTs KHWM.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400">Data belum tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map(program => {
            const IconComponent = program.icon_name ? ICON_MAP[program.icon_name] || Star : Star;
            return (
              <div key={program.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                {program.image_url && (
                  <div className="h-48 overflow-hidden relative">
                    <img src={optimizeCloudinaryUrl(program.image_url)} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                )}
                
                <div className={`p-6 md:p-8 ${program.image_url ? '-mt-10 relative z-10' : ''}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm ${program.image_url ? 'bg-white dark:bg-slate-800 text-primary-start' : 'bg-green-50 dark:bg-green-900/30 text-primary-start'}`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{program.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{program.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
