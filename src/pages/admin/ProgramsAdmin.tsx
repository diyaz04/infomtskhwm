import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { type FeaturedProgram } from '../../types';
import { Button } from '../../components/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Trash2, Edit, Plus, X, Book, Award, Star, Users, Target, Laptop, Globe, Music, Activity, Heart } from 'lucide-react';
import React from 'react';

const ICON_LIST = [
  { name: 'Book', component: Book },
  { name: 'Award', component: Award },
  { name: 'Star', component: Star },
  { name: 'Users', component: Users },
  { name: 'Target', component: Target },
  { name: 'Laptop', component: Laptop },
  { name: 'Globe', component: Globe },
  { name: 'Music', component: Music },
  { name: 'Activity', component: Activity },
  { name: 'Heart', component: Heart },
];

export function ProgramsAdmin() {
  const [items, setItems] = useState<FeaturedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [uploading, setUploading] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Star');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase.from('featured_programs').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      if (data) setItems(data);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setId(''); setTitle(''); setDescription(''); setIconName('Star');
    setDisplayOrder(0); setIsActive(true); setImageUrl(''); setFile(null);
  };

  const handleEdit = (item: FeaturedProgram) => {
    setId(item.id); setTitle(item.title); setDescription(item.description); 
    setIconName(item.icon_name || 'Star'); setDisplayOrder(item.display_order); 
    setIsActive(item.is_active); setImageUrl(item.image_url || ''); setFile(null);
    setView('form');
  };

  const handleDelete = async (deleteId: string) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      const { error } = await supabase.from('featured_programs').delete().eq('id', deleteId);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return alert('Data wajib diisi (Judul, Deskripsi)');
    
    setUploading(true);
    try {
      let finalImageUrl = imageUrl;
      if (file) {
        finalImageUrl = await uploadToCloudinary(file, 'programs');
      }

      const payload = {
        title, description, icon_name: iconName, display_order: displayOrder, 
        is_active: isActive, image_url: finalImageUrl
      };

      if (id) {
        const { error } = await supabase.from('featured_programs').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('featured_programs').insert([payload]);
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{id ? 'Edit' : 'Tambah'} Program</h2>
          <button onClick={() => { setView('list'); resetForm(); }} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Program *</label>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urutan Tampil</label>
              <input type="number" value={displayOrder} onChange={e=>setDisplayOrder(parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={isActive ? 'true' : 'false'} onChange={e=>setIsActive(e.target.value === 'true')} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none">
                <option value="true">Aktif Tampil</option>
                <option value="false">Sembunyikan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gambar (Opsional)</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pilih Icon</label>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {ICON_LIST.map(({ name, component: IconComponent }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIconName(name)}
                  className={`p-2 flex flex-col items-center justify-center rounded-md border ${iconName === name ? 'bg-green-100 border-green-500 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  <IconComponent className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi *</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={4} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start"></textarea>
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Program Unggulan</h1>
        <Button onClick={() => setView('form')} className="gap-2"><Plus className="w-4 h-4" /> Tambah Program</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Nama Program</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const IconComponent = ICON_LIST.find(i => i.name === item.icon_name)?.component || Star;
                return (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3"><IconComponent className="w-5 h-5 text-slate-500" /></td>
                    <td className="px-4 py-3">{item.is_active ? 'Aktif' : 'Sembunyi'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
