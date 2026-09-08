import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import {
  Settings, MapPin, Phone, Mail, Clock, Save, MessageCircle
} from 'lucide-react';

// SVG brand icons
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.94A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black"/></svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
);
const IconTiktok = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.85 1.56V6.8a4.84 4.84 0 0 1-1.08-.11z"/></svg>
);

// Daftar key yang dikelola
const SETTING_KEYS = [
  'footer_school_name',
  'footer_tagline',
  'footer_address',
  'footer_phone',
  'footer_email',
  'footer_hours_weekday',
  'footer_hours_saturday',
  'footer_copyright',
  'social_facebook',
  'social_instagram',
  'social_youtube',
  'social_whatsapp',
  'social_twitter',
  'social_tiktok',
];

const DEFAULT_VALUES: Record<string, string> = {
  footer_school_name: 'MTs KHWM',
  footer_tagline: 'Lembaga pendidikan Islam tingkat menengah pertama yang berdedikasi mencetak generasi berprestasi, berakhlakul karimah, dan berwawasan luas.',
  footer_address: 'Jl. Pendidikan No. 123, Kecamatan Taktakan, Kota Serang, Banten 42162',
  footer_phone: '(0254) 1234567',
  footer_email: 'info@mtskhwm.sch.id',
  footer_hours_weekday: '07:00 - 15:00 WIB',
  footer_hours_saturday: '07:00 - 12:00 WIB',
  footer_copyright: 'MTs KH. A. Wahab Muhsin',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_whatsapp: '',
  social_twitter: '',
  social_tiktok: '',
};

export function FooterAdmin() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', SETTING_KEYS);
      if (error) throw error;
      if (data && data.length > 0) {
        const merged = { ...DEFAULT_VALUES };
        data.forEach((row: { key: string; value: string }) => {
          merged[row.key] = row.value ?? '';
        });
        setValues(merged);
      }
    } catch (err: any) {
      console.error('Gagal memuat pengaturan:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const upsertData = SETTING_KEYS.map((key) => ({
        key,
        value: values[key] ?? '',
      }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(upsertData, { onConflict: 'key' });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const set = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat pengaturan...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary-start" />
          Pengaturan Footer
        </h1>
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[160px]">
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan!' : 'Simpan Semua'}
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm font-medium">
          ✓ Perubahan berhasil disimpan. Footer website sudah terupdate.
        </div>
      )}

      {/* Info Sekolah */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
          🏫 Info Sekolah
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nama Sekolah (di Footer)
          </label>
          <input
            type="text"
            value={values.footer_school_name}
            onChange={(e) => set('footer_school_name', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
            placeholder="MTs KHWM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tagline / Deskripsi Singkat
          </label>
          <textarea
            value={values.footer_tagline}
            onChange={(e) => set('footer_tagline', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm resize-none"
            placeholder="Deskripsi singkat sekolah..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Teks Copyright
          </label>
          <input
            type="text"
            value={values.footer_copyright}
            onChange={(e) => set('footer_copyright', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
            placeholder="MTs KH. A. Wahab Muhsin"
          />
          <p className="text-xs text-slate-400 mt-1">
            Tampil sebagai: © {new Date().getFullYear()} <em>{values.footer_copyright || '...'}</em>. Hak Cipta Dilindungi.
          </p>
        </div>
      </section>

      {/* Kontak */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
          📞 Informasi Kontak
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-start" /> Alamat
          </label>
          <textarea
            value={values.footer_address}
            onChange={(e) => set('footer_address', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm resize-none"
            placeholder="Jl. Pendidikan No. 123..."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-start" /> Nomor Telepon
            </label>
            <input
              type="text"
              value={values.footer_phone}
              onChange={(e) => set('footer_phone', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
              placeholder="(0254) 1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-start" /> Email
            </label>
            <input
              type="email"
              value={values.footer_email}
              onChange={(e) => set('footer_email', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
              placeholder="info@mtskhwm.sch.id"
            />
          </div>
        </div>
      </section>

      {/* Jam Operasional */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
          🕐 Jam Operasional
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-start" /> Senin – Jumat
            </label>
            <input
              type="text"
              value={values.footer_hours_weekday}
              onChange={(e) => set('footer_hours_weekday', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
              placeholder="07:00 - 15:00 WIB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-start" /> Sabtu
            </label>
            <input
              type="text"
              value={values.footer_hours_saturday}
              onChange={(e) => set('footer_hours_saturday', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
              placeholder="07:00 - 12:00 WIB"
            />
          </div>
        </div>
      </section>

      {/* Media Sosial */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
          📱 Media Sosial
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
          Isi URL untuk menampilkannya di footer. Kosongkan jika tidak ingin ditampilkan.
        </p>

        <div className="space-y-4">
          {/* Facebook */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <IconFacebook />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Facebook</label>
              <input
                type="url"
                value={values.social_facebook}
                onChange={(e) => set('social_facebook', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
                placeholder="https://facebook.com/mtskhwm"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
              <IconInstagram />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Instagram</label>
              <input
                type="url"
                value={values.social_instagram}
                onChange={(e) => set('social_instagram', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
                placeholder="https://instagram.com/mtskhwm"
              />
            </div>
          </div>

          {/* YouTube */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
              <IconYoutube />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">YouTube</label>
              <input
                type="url"
                value={values.social_youtube}
                onChange={(e) => set('social_youtube', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
                placeholder="https://youtube.com/@mtskhwm"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">WhatsApp</label>
              <input
                type="text"
                value={values.social_whatsapp}
                onChange={(e) => set('social_whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
                placeholder="628xxxxxxxxxx (format internasional, tanpa +)"
              />
            </div>
          </div>

          {/* Twitter / X */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <IconTwitter />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Twitter / X</label>
              <input
                type="url"
                value={values.social_twitter}
                onChange={(e) => set('social_twitter', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
                placeholder="https://x.com/mtskhwm"
              />
            </div>
          </div>

          {/* TikTok */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <IconTiktok />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">TikTok</label>
              <input
                type="url"
                value={values.social_tiktok}
                onChange={(e) => set('social_tiktok', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-primary-start text-sm"
                placeholder="https://tiktok.com/@mtskhwm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Simpan Bottom */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[200px]">
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : saved ? '✓ Berhasil Disimpan!' : 'Simpan Semua Perubahan'}
        </Button>
      </div>
    </div>
  );
}
