import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { type BuletinEdition } from '../../types';
import { Button } from '../../components/Button';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Trash2, CheckCircle, XCircle, FileUp, Image as ImageIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function BuletinAdmin() {
  const { role } = useOutletContext<{ role: 'admin' | 'osis', userEmail: string }>();
  const [editions, setEditions] = useState<BuletinEdition[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [editionNumber, setEditionNumber] = useState('');
  const [source, setSource] = useState(role === 'osis' ? 'OSIS' : 'Redaksi');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEditions();
  }, [role]);

  async function fetchEditions() {
    try {
      let query = supabase.from('buletin_editions').select('*').order('created_at', { ascending: false });
      if (role === 'osis') {
        query = query.eq('source', 'OSIS');
      }
      const { data, error } = await query;

      if (error) throw error;
      if (data) setEditions(data);
    } catch (error) {
      console.error('Error fetching editions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Harap pilih file PDF');
      return;
    }
    
    setPdfFile(file);
    setPreviewImages([]);
    setUploadStatus('Membaca file PDF...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      const images: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL('image/webp', 0.8));
        }
      }
      
      setPreviewImages(images);
      setUploadStatus('');
    } catch (err) {
      console.error('Error reading PDF:', err);
      setUploadStatus('Gagal membaca PDF. Pastikan file valid.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pdfFile || previewImages.length === 0) {
      alert('Judul dan File PDF dengan preview valid wajib diisi');
      return;
    }

    setUploading(true);
    setUploadStatus('Memulai upload...');
    
    try {
      const finalStatus = role === 'osis' ? 'pending' : 'draft';
      const finalSource = role === 'osis' ? 'OSIS' : source;

      // 1. Create Edition Draft first to get ID
      const { data: editionData, error: editionError } = await supabase
        .from('buletin_editions')
        .insert({
          title,
          edition_number: editionNumber,
          total_pages: previewImages.length,
          status: finalStatus,
          source: finalSource
        })
        .select()
        .single();

      if (editionError) throw editionError;
      const editionId = editionData.id;

      // 2. Upload images one by one and save to buletin_pages
      let firstPageUrl = '';
      
      for (let i = 0; i < previewImages.length; i++) {
        setUploadStatus(`Mengupload halaman ${i + 1} dari ${previewImages.length}...`);
        
        // Convert data URL to Blob
        const res = await fetch(previewImages[i]);
        const blob = await res.blob();
        
        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(blob, 'buletin');
        
        if (i === 0) firstPageUrl = imageUrl;

        // Insert to Supabase buletin_pages
        const { error: pageError } = await supabase
          .from('buletin_pages')
          .insert({
            edition_id: editionId,
            page_number: i,
            image_url: imageUrl
          });

        if (pageError) throw pageError;
        
        setUploadProgress(Math.round(((i + 1) / previewImages.length) * 100));
      }

      // 3. Update edition with cover image
      setUploadStatus('Menyelesaikan proses...');
      const { error: updateError } = await supabase
        .from('buletin_editions')
        .update({ cover_image_url: firstPageUrl })
        .eq('id', editionId);

      if (updateError) throw updateError;

      // Reset form
      setTitle('');
      setEditionNumber('');
      setPdfFile(null);
      setPreviewImages([]);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      alert('Upload berhasil disimpan sebagai Draft!');
      fetchEditions();

    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Terjadi kesalahan saat upload: ' + err.message);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('buletin_editions')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      fetchEditions();
    } catch (err) {
      alert('Gagal mengubah status');
    }
  };

  const deleteEdition = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus edisi buletin ini? (Halaman terkait juga akan terhapus)')) return;
    
    try {
      const { error } = await supabase
        .from('buletin_editions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEditions();
    } catch (err) {
      alert('Gagal menghapus edisi');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Buletin</h1>
      </div>

      {/* Upload Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileUp className="w-5 h-5 text-primary-start" />
          Upload Edisi Baru
        </h2>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul Buletin *</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Misal: Buletin Edisi Spesial Ramadhan"
                className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-primary-start"
                required
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Edisi</label>
              <input 
                type="text" 
                value={editionNumber}
                onChange={e => setEditionNumber(e.target.value)}
                placeholder="Misal: Vol. 5 / Jan 2026"
                className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-primary-start"
                disabled={uploading}
              />
            </div>
          </div>

          {role !== 'osis' && (
            <div>
              <label className="block text-sm font-medium mb-1">Sumber</label>
              <select 
                value={source} 
                onChange={e => setSource(e.target.value)} 
                className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-primary-start"
                disabled={uploading}
              >
                <option value="Redaksi">Redaksi</option>
                <option value="OSIS">OSIS</option>
                <option value="Ekstrakurikuler">Ekstrakurikuler</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Pilih File PDF *</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={handlePdfSelect}
              ref={fileInputRef}
              className="w-full"
              disabled={uploading}
            />
            {uploadStatus && <p className="text-sm text-primary-start mt-2">{uploadStatus}</p>}
          </div>

          {/* Previews */}
          {previewImages.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 
                Preview Halaman ({previewImages.length} Halaman)
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="flex-shrink-0 w-24 border border-slate-200 shadow-sm bg-white p-1 rounded">
                    <img src={src} alt={`Page ${idx+1}`} className="w-full h-auto" />
                    <div className="text-center text-xs mt-1 text-slate-500">{idx+1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-4">
              <div 
                className="bg-primary-start h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="button" 
              onClick={handleUpload}
              disabled={uploading || previewImages.length === 0 || !title}
            >
              {uploading ? 'Mengupload...' : (role === 'osis' ? 'Simpan Pengajuan' : 'Simpan & Upload ke Cloudinary')}
            </Button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4">{role === 'osis' ? 'Daftar Pengajuan Buletin' : 'Daftar Edisi Buletin'}</h2>
        
        {loading ? (
          <div className="text-center py-4 text-slate-500">Memuat data...</div>
        ) : editions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">
            Belum ada edisi buletin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Judul</th>
                  <th className="px-4 py-3">Sumber</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Halaman</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {editions.map(edition => (
                  <tr key={edition.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {edition.title}
                      {edition.edition_number && <div className="text-xs text-slate-500 font-normal">{edition.edition_number}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{edition.source || 'Redaksi'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {edition.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : edition.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <XCircle className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          <XCircle className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{edition.total_pages}</td>
                    <td className="px-4 py-3">{new Date(edition.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {role !== 'osis' && (
                        <Button 
                          variant="secondary" 
                          className="px-3 py-1 text-xs"
                          onClick={() => toggleStatus(edition.id, edition.status)}
                        >
                          {edition.status === 'published' ? 'Set Draft' : 'Publish'}
                        </Button>
                      )}
                      <button 
                        onClick={() => deleteEdition(edition.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
