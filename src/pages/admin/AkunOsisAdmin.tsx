import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';

export function AkunOsisAdmin() {
  const { role } = useOutletContext<{ role: 'admin' | 'osis' }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (role !== 'admin') {
    return <div className="p-6 text-center text-red-500">Akses ditolak. Hanya Admin utama yang dapat membuka halaman ini.</div>;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (!email.toLowerCase().includes('osis')) {
      setMessage({ type: 'error', text: 'Email wajib mengandung kata "osis" (contoh: humas.osis@mtskhwm.sch.id)' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Get current session token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-osis-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat akun');
      }

      setMessage({ type: 'success', text: 'Akun OSIS berhasil dibuat! Silakan berikan email dan password kepada pengurus OSIS.' });
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Buat Akun OSIS</h1>
          <p className="text-slate-500 dark:text-slate-400">Buatkan akun akses terbatas untuk anggota OSIS. Mereka hanya bisa mengajukan draft berita/opini.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        {message.text && (
          <div className={`p-4 rounded-md mb-6 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nama Lengkap / Jabatan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Contoh: Divisi Jurnalistik OSIS"
              required 
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-start" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email Akun <span className="text-red-500">*</span></label>
            <p className="text-xs text-slate-500 mb-2">Wajib menggunakan kata "osis" di dalam email agar sistem membatasinya.</p>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="contoh: osis@mtskhwm.sch.id"
              required 
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-start" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password Sementara <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Minimal 6 karakter"
              required 
              minLength={6}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-start" 
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Memproses...' : 'Daftarkan Akun OSIS'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
