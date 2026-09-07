import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { type Staff } from '../types';
import { ArrowLeft, User, Briefcase, GraduationCap, Phone, Mail, BookOpen, UserCheck, Star, Zap } from 'lucide-react';
import { Button } from '../components/Button';

export function GuruStafDetail() {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setStaff(data);
      } catch (error) {
        console.error('Error fetching staff details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500">Memuat profil...</div>;

  if (!staff) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Profil tidak ditemukan</h2>
        <Link to="/guru-staf">
          <Button>Kembali ke Daftar Guru & Staf</Button>
        </Link>
      </div>
    );
  }

  const skillsList = staff.skills ? staff.skills.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Banner / Cover */}
      <div 
        className="w-full relative bg-cover bg-center flex flex-col justify-end min-h-[350px] md:min-h-[400px]"
        style={{ 
          backgroundImage: `url(${staff.background_image_url || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=2000'})`,
          backgroundColor: '#0f5132'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-800/30 mix-blend-multiply"></div>

        <div className="absolute top-4 md:top-6 left-4 md:left-6 z-20">
          <Link to="/guru-staf" className="inline-flex items-center text-sm font-medium text-white hover:text-green-300 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </div>

        <div className="relative z-10 w-full p-6 md:p-12 flex flex-col md:flex-row md:items-end gap-6 mt-16">
          <div className="flex w-full md:w-auto justify-end md:justify-start order-1 md:order-none -mt-12 md:mt-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-white shadow-xl flex-shrink-0">
              {staff.photo_url ? (
                <img src={staff.photo_url} alt={staff.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
                </div>
              )}
            </div>
          </div>
          <div className="text-white flex-grow order-2 md:order-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-start/90 rounded-full text-xs font-bold text-white mb-3 backdrop-blur-sm shadow-sm">
              <BookOpen className="w-3 h-3" />
              {staff.category === 'Pimpinan' ? 'Pimpinan Madrasah' : staff.category}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 tracking-tight">{staff.full_name}</h1>
            <p className="text-lg md:text-xl text-green-50 mb-3 font-medium">{staff.position}</p>
            {staff.education && (
              <div className="flex items-center gap-2 text-sm text-green-100 mb-4">
                <GraduationCap className="w-4 h-4" />
                {staff.education}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-l-4 border-primary-start pl-3">Tentang Guru</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {staff.bio || 'Belum ada deskripsi profil.'}
              </p>
            </div>

            {skillsList.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Karakter & Kompetensi</h4>
                <div className="flex flex-wrap gap-3">
                  {skillsList.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium">
                      {index % 3 === 0 ? <Star className="w-4 h-4" /> : index % 3 === 1 ? <Zap className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {staff.quote && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
                <div className="text-4xl text-green-300 dark:text-green-700 font-serif mb-2">"</div>
                <p className="text-slate-700 dark:text-slate-300 italic font-medium relative z-10 pl-4">
                  {staff.quote}
                </p>
                <div className="mt-4 pl-4 text-sm font-bold text-green-700 dark:text-green-500">— {staff.full_name}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Informasi Guru</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nama Lengkap</p>
                  <p className="font-medium text-slate-900 dark:text-white">{staff.full_name}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-700"></div>
              
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Jabatan</p>
                  <p className="font-medium text-slate-900 dark:text-white">{staff.position}</p>
                </div>
              </div>

              {staff.subjects && (
                <>
                  <div className="border-t border-slate-100 dark:border-slate-700"></div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mata Pelajaran</p>
                      <p className="font-medium text-slate-900 dark:text-white">{staff.subjects}</p>
                    </div>
                  </div>
                </>
              )}
              
              <div className="border-t border-slate-100 dark:border-slate-700"></div>

              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pendidikan Terakhir</p>
                  <p className="font-medium text-slate-900 dark:text-white">{staff.education || '-'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700"></div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Kontak</p>
                  <p className="font-medium text-slate-900 dark:text-white">{staff.phone || '-'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700"></div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-medium text-slate-900 dark:text-white break-all">{staff.email || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a href={staff.phone ? `https://wa.me/${staff.phone.replace(/[^0-9]/g, '')}` : '#'} target="_blank" rel="noreferrer" className="w-full block">
                <Button className="w-full justify-center gap-2">
                  <Phone className="w-4 h-4" /> Hubungi Guru
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
