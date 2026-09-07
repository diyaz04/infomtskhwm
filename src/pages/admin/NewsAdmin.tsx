import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { type News } from '../../types';
import { Button } from '../../components/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { generateSlug, formatDate } from '../../lib/utils';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export function NewsAdmin() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [uploading, setUploading] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Kegiatan');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('draft');
  const [coverUrl, setCoverUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setItems(data);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!id) setSlug(generateSlug(e.target.value));
  };

  const resetForm = () => {
    setId(''); setTitle(''); setSlug(''); setContent(''); setCategory('Kegiatan');
    setAuthor(''); setStatus('draft'); setCoverUrl(''); setFile(null);
  };

  const handleEdit = (item: News) => {
    setId(item.id); setTitle(item.title); setSlug(item.slug); setContent(item.content);
    setCategory(item.category || ''); setAuthor(item.author_name || ''); 
    setStatus(item.status); setCoverUrl(item.cover_image_url || ''); setFile(null);
    setView('form');
  };

  const handleDelete = async (deleteId: string) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('id', deleteId);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return alert('Data wajib diisi');
    
    setUploading(true);
    try {
      let finalCoverUrl = coverUrl;
      if (file) {
        finalCoverUrl = await uploadToCloudinary(file, 'news');
      }

      const payload = {
        title, slug, content, category, author_name: author, status, 
        cover_image_url: finalCoverUrl, 
        published_at: status === 'published' ? new Date().toISOString() : null
      };

      if (id) {
        const { error } = await supabase.from('news').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert([payload]);
        if (error) throw error;
      }

      alert('Berhasil disimpan');
      resetForm();
      setView('list');
      fetchItems();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{id ? 'Edit' : 'Tambah'} Berita</h2>
          <button onClick={() => { setView('list'); resetForm(); }} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul *</label>
              <input type="text" value={title} onChange={handleTitleChange} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none">
                <option value="Kegiatan">Kegiatan</option>
                <option value="Prestasi">Prestasi</option>
                <option value="Pengumuman">Pengumuman</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Penulis</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
              {coverUrl && !file && <p className="text-xs text-primary-start mt-1">Image sudah ada, biarkan kosong jika tidak ingin mengubah.</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konten (Bisa menggunakan tag HTML sederhana) *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={10} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start"></textarea>
          </div>
          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Berita</h1>
        <Button onClick={() => setView('form')} className="gap-2"><Plus className="w-4 h-4" /> Tambah Berita</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
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
