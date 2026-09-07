import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { type ActivityVideo } from '../../types';
import { Button } from '../../components/Button';
import { Trash2, Edit, Plus, X, Video } from 'lucide-react';
import React from 'react';

export function VideosAdmin() {
  const [items, setItems] = useState<ActivityVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [saving, setSaving] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase.from('activity_videos').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      if (data) setItems(data);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setId(''); setTitle(''); setYoutubeUrl(''); setDisplayOrder(0);
  };

  const handleEdit = (item: ActivityVideo) => {
    setId(item.id); 
    setTitle(item.title); 
    setYoutubeUrl(item.youtube_url); 
    setDisplayOrder(item.display_order); 
    setView('form');
  };

  const handleDelete = async (deleteId: string) => {
    if (!window.confirm('Yakin ingin menghapus video ini?')) return;
    try {
      const { error } = await supabase.from('activity_videos').delete().eq('id', deleteId);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) return alert('Data wajib diisi (Judul, URL YouTube)');
    
    setSaving(true);
    try {
      const payload = {
        title, 
        youtube_url: youtubeUrl, 
        display_order: displayOrder
      };

      if (id) {
        const { error } = await supabase.from('activity_videos').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('activity_videos').insert([payload]);
        if (error) throw error;
      }

      alert('Berhasil disimpan');
      resetForm();
      setView('list');
      fetchItems();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{id ? 'Edit' : 'Tambah'} Video</h2>
          <button onClick={() => { setView('list'); resetForm(); }} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul Video *</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: Kegiatan Porseni 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Video (YouTube / TikTok) *</label>
            <input type="url" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://www.tiktok.com/@.../video/..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Urutan Tampil (Angka)</label>
            <input type="number" value={displayOrder} onChange={e=>setDisplayOrder(parseInt(e.target.value))} className="w-full md:w-1/3 px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none" />
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Menyimpan...' : 'Simpan Video'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Video Kegiatan</h1>
        <Button onClick={() => setView('form')} className="gap-2"><Plus className="w-4 h-4" /> Tambah Video</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 uppercase font-medium">
              <tr>
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Judul Video</th>
                <th className="px-4 py-3 hidden md:table-cell">URL Video</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">Belum ada video kegiatan</td>
                </tr>
              ) : items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-500 font-medium">{item.display_order}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <Video className="w-4 h-4 text-slate-500 hidden sm:block" /> {item.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell overflow-hidden text-ellipsis max-w-xs whitespace-nowrap">
                    <a href={item.youtube_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {item.youtube_url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
