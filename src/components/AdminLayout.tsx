import { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, BookOpen, Newspaper, MessageSquare, Users, Star, Video, Settings } from 'lucide-react';

export function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memeriksa sesi...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-primary-end">
            SIM Admin
          </h2>
        </div>
        
        <nav className="flex-grow p-4 space-y-1">
          <Link to="/admin/berita" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <Newspaper className="w-5 h-5" /> Kelola Berita
          </Link>
          <Link to="/admin/opini" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <MessageSquare className="w-5 h-5" /> Kelola Opini
          </Link>
          <Link to="/admin/buletin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <BookOpen className="w-5 h-5" /> Kelola Buletin
          </Link>
          <Link to="/admin/guru-staf" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <Users className="w-5 h-5" /> Kelola Guru & Staf
          </Link>
          <Link to="/admin/program-unggulan" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <Star className="w-5 h-5" /> Program Unggulan
          </Link>
          <Link to="/admin/video" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <Video className="w-5 h-5" /> Video Kegiatan
          </Link>
          <Link to="/admin/footer" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            <Settings className="w-5 h-5" /> Pengaturan Footer
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
