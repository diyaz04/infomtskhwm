import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { type Staff } from '../../types';
import { Button } from '../../components/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Trash2, Edit, Plus, X, Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

import * as XLSX from 'xlsx';

// Excel columns (excluding photo/bg)
const EXCEL_HEADERS = ['full_name','position','category','education','email','phone','subjects','skills','quote','bio','display_order','is_active'];

function downloadTemplate() {
  const wsData = [
    // Header row
    EXCEL_HEADERS,
    // Example row
    ['Ahmad Fauzi, S.Pd','Guru Matematika','Guru','S1 Pendidikan Matematika','ahmad@mtskhwm.sch.id','081234567890','Matematika','Kreatif, Disiplin','Matematika adalah bahasa alam','Guru berpengalaman 10 tahun',1,'true'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Set column widths
  ws['!cols'] = EXCEL_HEADERS.map((h) => ({ wch: Math.max(h.length + 4, 20) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Guru & Staf');
  XLSX.writeFile(wb, 'template_import_guru_staf.xlsx');
}

function parseExcel(buffer: ArrayBuffer): Record<string, string>[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
  return rows.filter(row => row['full_name']);
}


interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function StaffAdmin() {
  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form' | 'import'>('list');
  const [uploading, setUploading] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Form states
  const [id, setId] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [category, setCategory] = useState('Guru');
  const [bio, setBio] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Additional details
  const [education, setEducation] = useState('');
  const [quote, setQuote] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subjects, setSubjects] = useState('');
  const [skills, setSkills] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgFile, setBgFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase.from('staff').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      if (data) setItems(data);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setId(''); setFullName(''); setPosition(''); setCategory('Guru');
    setBio(''); setDisplayOrder(0); setIsActive(true); setPhotoUrl(''); setFile(null);
    setEducation(''); setQuote(''); setEmail(''); setPhone(''); setSubjects(''); setSkills(''); setBgImageUrl(''); setBgFile(null);
  };

  const handleEdit = (item: Staff) => {
    setId(item.id); setFullName(item.full_name); setPosition(item.position); 
    setCategory(item.category); setBio(item.bio || ''); setDisplayOrder(item.display_order); 
    setIsActive(item.is_active); setPhotoUrl(item.photo_url || ''); setFile(null);
    setEducation(item.education || ''); setQuote(item.quote || ''); setEmail(item.email || '');
    setPhone(item.phone || ''); setSubjects(item.subjects || ''); setSkills(item.skills || '');
    setBgImageUrl(item.background_image_url || ''); setBgFile(null);
    setView('form');
  };

  const handleDelete = async (deleteId: string) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      const { error } = await supabase.from('staff').delete().eq('id', deleteId);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !position) return alert('Data wajib diisi (Nama, Jabatan)');
    
    setUploading(true);
    try {
      let finalPhotoUrl = photoUrl;
      let finalBgImageUrl = bgImageUrl;

      if (file) {
        finalPhotoUrl = await uploadToCloudinary(file, 'staff');
      }
      if (bgFile) {
        finalBgImageUrl = await uploadToCloudinary(bgFile, 'staff_bg');
      }

      const payload = {
        full_name: fullName, position, category, bio, display_order: displayOrder, 
        is_active: isActive, photo_url: finalPhotoUrl,
        education, quote, email, phone, subjects, skills, background_image_url: finalBgImageUrl
      };

      if (id) {
        const { error } = await supabase.from('staff').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff').insert([payload]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const parsed = parseExcel(buffer);
      setImportPreview(parsed);
      setImportResult(null);
    };
    reader.readAsArrayBuffer(f);
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const row of importPreview) {
      try {
        const payload = {
          full_name: row.full_name || '',
          position: row.position || '',
          category: ['Pimpinan','Guru','Staf'].includes(row.category) ? row.category : 'Guru',
          education: row.education || null,
          email: row.email || null,
          phone: row.phone || null,
          subjects: row.subjects || null,
          skills: row.skills || null,
          quote: row.quote || null,
          bio: row.bio || null,
          display_order: parseInt(row.display_order) || 0,
          is_active: row.is_active?.toLowerCase() !== 'false',
          photo_url: null,
          background_image_url: null,
        };
        const { error } = await supabase.from('staff').insert([payload]);
        if (error) throw error;
        result.success++;
      } catch (err: any) {
        result.failed++;
        result.errors.push(`"${row.full_name}": ${err.message}`);
      }
    }

    setImportResult(result);
    setImporting(false);
    if (result.success > 0) fetchItems();
  };

  // ── IMPORT VIEW ──
  if (view === 'import') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-primary-start" />
            Import Data Guru & Staf
          </h2>
          <button onClick={() => { setView('list'); setImportPreview([]); setImportResult(null); }} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Download Template */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary-start text-white text-sm flex items-center justify-center font-bold">1</span>
            Download Template CSV
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Download template di bawah, isi data guru/staf (satu baris = satu orang). Kolom foto dan background akan diisi manual setelah import.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-600 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap">
            {EXCEL_HEADERS.join(' | ')}
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download Template (CSV)
          </button>
        </div>

        {/* Step 2: Upload */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary-start text-white text-sm flex items-center justify-center font-bold">2</span>
            Upload File CSV
          </h3>
          <input
            ref={importFileRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => importFileRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-start rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary-start transition-colors text-sm font-medium w-full justify-center"
          >
            <Upload className="w-5 h-5" />
            Pilih File CSV
          </button>
        </div>

        {/* Step 3: Preview & Import */}
        {importPreview.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-start text-white text-sm flex items-center justify-center font-bold">3</span>
              Preview Data ({importPreview.length} baris)
            </h3>
            <p className="text-sm text-slate-500 mb-4">Periksa data di bawah sebelum mengimpor. Foto & background tidak diimpor.</p>

            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700 mb-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Jabatan</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Pendidikan</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Mapel</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-700/50">
                      <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{row.full_name}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.position}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {row.category || 'Guru'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{row.education}</td>
                      <td className="px-3 py-2 text-slate-500">{row.email}</td>
                      <td className="px-3 py-2 text-slate-500">{row.subjects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!importResult && (
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing ? 'Mengimpor...' : `Import ${importPreview.length} Data`}
              </Button>
            )}

            {importResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                    <CheckCircle className="w-6 h-6" />
                    {importResult.success} berhasil
                  </div>
                  {importResult.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
                      <AlertCircle className="w-6 h-6" />
                      {importResult.failed} gagal
                    </div>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-1">
                    {importResult.errors.map((e, i) => <p key={i}>{e}</p>)}
                  </div>
                )}
                <Button onClick={() => { setView('list'); setImportPreview([]); setImportResult(null); }} className="gap-2">
                  Kembali ke Daftar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{id ? 'Edit' : 'Tambah'} Guru & Staf</h2>
          <button onClick={() => { setView('list'); resetForm(); }} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
              <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jabatan *</label>
              <input type="text" value={position} onChange={e=>setPosition(e.target.value)} required className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: Guru IPA" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none">
                <option value="Pimpinan">Pimpinan</option>
                <option value="Guru">Guru</option>
                <option value="Staf">Staf</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pendidikan Terakhir</label>
              <input type="text" value={education} onChange={e=>setEducation(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: S1 Pendidikan IPA" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="email@mtskhwm.sch.id" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No. Kontak / HP</label>
              <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="0812..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
              <input type="text" value={subjects} onChange={e=>setSubjects(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: IPA Terpadu, Biologi" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skill / Karakter (Pisahkan Koma)</label>
              <input type="text" value={skills} onChange={e=>setSkills(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: Komunikatif, Inovatif, Profesional" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Motto / Kutipan</label>
              <input type="text" value={quote} onChange={e=>setQuote(e.target.value)} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Contoh: Ilmu adalah cahaya..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urutan Tampil</label>
              <input type="number" value={displayOrder} onChange={e=>setDisplayOrder(parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Foto Profil</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
              {photoUrl && !file && <p className="text-xs text-primary-start mt-1">Foto sudah ada.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gambar Latar (Cover / Banner)</label>
              <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files?.[0] || null)} className="w-full" />
              {bgImageUrl && !bgFile && <p className="text-xs text-primary-start mt-1">Latar belakang sudah ada.</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tentang Guru (Bio)</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={5} className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-primary-start" placeholder="Tuliskan biografi singkat tentang guru..."></textarea>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isActive" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="mr-2" />
            <label htmlFor="isActive" className="text-sm font-medium">Aktif Tampil di Website</label>
          </div>
          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Guru & Staf</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setView('import'); setImportPreview([]); setImportResult(null); }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <Button onClick={() => setView('form')} className="gap-2"><Plus className="w-4 h-4" /> Tambah Data</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Belum ada data guru & staf</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{item.full_name}</td>
                  <td className="px-4 py-3">{item.position}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.is_active ? 'Aktif' : 'Sembunyi'}
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

