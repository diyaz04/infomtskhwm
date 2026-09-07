import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { type Staff } from '../types';
import { optimizeCloudinaryUrl } from '../lib/utils';
import { UserCircle } from 'lucide-react';

export function GuruStaf() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data) setStaffList(data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Memuat data guru dan staf...</div>;

  const grouped = {
    Pimpinan: staffList.filter(s => s.category === 'Pimpinan'),
    Guru: staffList.filter(s => s.category === 'Guru'),
    Staf: staffList.filter(s => s.category === 'Staf'),
  };

  const renderGroup = (title: string, data: Staff[]) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 border-b-2 border-primary-start inline-block pb-2">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map(person => (
            <Link to={`/guru-staf/${person.id}`} key={person.id} className="block group">
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center p-6 hover:shadow-md transition-all group-hover:border-primary-start/50 group-hover:-translate-y-1 h-full">
                <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700">
                  {person.photo_url ? (
                    <img src={optimizeCloudinaryUrl(person.photo_url)} alt={person.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserCircle className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-start transition-colors">{person.full_name}</h3>
                <p className="text-sm font-medium text-primary-start mb-3">{person.position}</p>
                {person.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-auto">{person.bio}</p>}
                <div className="mt-4 text-xs font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Profil &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Direktori Guru & Staf</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Mengenal lebih dekat para pendidik dan tenaga kependidikan di MTs KHWM yang berdedikasi tinggi.
        </p>
      </div>

      {renderGroup('Pimpinan Madrasah', grouped.Pimpinan)}
      {renderGroup('Dewan Guru', grouped.Guru)}
      {renderGroup('Staf Tata Usaha & Karyawan', grouped.Staf)}
      
      {staffList.length === 0 && (
         <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
           <p className="text-slate-500 dark:text-slate-400">Data belum tersedia.</p>
         </div>
      )}
    </div>
  );
}
