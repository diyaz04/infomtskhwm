import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { type Opinion } from '../../types';
import { Button } from '../../components/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { generateSlug } from '../../lib/utils';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export function OpinionsAdmin() {
  const { role } = useOutletContext<{ role: 'admin' | 'osis', userEmail: string }>();
  const [items, setItems] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [uploading, setUploading] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [status, setStatus] = useState(role === 'osis' ? 'pending' : 'draft');
  const [source, setSource] = useState(role === 'osis' ? 'OSIS' : 'Redaksi');
  const [coverUrl, setCoverUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, [role]);

  async function fetchItems() {
    try {
      let query = supabase.from('opinions').select('*').order('created_at', { ascending: false });
      if (role === 'osis') {
        query = query.eq('source', 'OSIS');
      }
      const { data, error } = await query;
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
    setId(''); setTitle(''); setSlug(''); setContent('');
    setAuthor(''); setAuthorRole(''); setStatus(role === 'osis' ? 'pending' : 'draft'); 
    setSource(role === 'osis' ? 'OSIS' : 'Redaksi');
    setCoverUrl(''); setFile(null);
  };

  const handleEdit = (item: Opinion) => {
    setId(item.id); setTitle(item.title); setSlug(item.slug); setContent(item.content);
    setAuthor(item.author_name); setAuthorRole(item.author_role || ''); 
    setStatus(item.status); setSource(item.source || 'Redaksi');
    setCoverUrl(item.cover_image_url || ''); setFile(null);
    setView('form');
  };

  const handleDelete = async (deleteId: string) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      const { error } = await supabase.from('opinions').delete().eq('id', deleteId);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content || !author) return alert('Data wajib diisi (Judul, Slug, Penulis, Konten)');
    
    setUploading(true);
    try {
      let finalCoverUrl = coverUrl;
      if (file) {
        finalCoverUrl = await uploadToCloudinary(file, 'opinions');
      }

      const finalStatus = role === 'osis' ? 'pending' : status;
      const finalSource = role === 'osis' ? 'OSIS' : source;

      const payload = {
        title, slug, content, author_name: author, author_role: authorRole, status: finalStatus, 
        source: finalSource, cover_image_url: finalCoverUrl, 
        published_at: finalStatus === 'published' ? new Date().toISOString() : null
      };

      if (id) {
        const { error } = await supabase.from('opinions').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('opinions').insert([payload]);
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{id ? 'Edit' : 'Tambah'} Opini</h2>
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
              <label className="block text-sm font-medium mb-1">Nama Penulis *</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jabatan Penulis</label>
              <input type="text" value={authorRole} onChange={e => setAuthorRole(e.target.value)} placeholder="Misal: Guru Bahasa Indonesia" className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              {role === 'osis' ? (
                <div className="w-full px-4 py-2 border rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Pengajuan (Pending)
                </div>
              ) : (
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none">
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                </select>
              )}
            </div>

            {role !== 'osis' && (
              <div>
                <label className="block text-sm font-medium mb-1">Sumber</label>
                <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none">
                  <option value="Redaksi">Redaksi</option>
                  <option value="OSIS">OSIS</option>
                  <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
              {coverUrl && !file && <p className="text-xs text-primary-start mt-1">Image sudah ada, biarkan kosong jika tidak mengubah.</p>}
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{role === 'osis' ? 'Pengajuan Opini' : 'Kelola Opini'}</h1>
        <Button onClick={() => setView('form')} className="gap-2"><Plus className="w-4 h-4" /> Tambah Opini</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Sumber</th>
                <th className="px-4 py-3">Penulis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{item.source || 'Redaksi'}</span>
                  </td>
                  <td className="px-4 py-3">{item.author_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'published' ? 'bg-green-100 text-green-700' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
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
