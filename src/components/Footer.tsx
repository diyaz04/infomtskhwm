import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// SVG brand icons
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.94A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M4 4l16 16M4 20L20 4"/></svg>
);
const IconTiktok = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.85 1.56V6.8a4.84 4.84 0 0 1-1.08-.11z"/></svg>
);

const DEFAULTS = {
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

type Settings = typeof DEFAULTS;

export function Footer() {
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', Object.keys(DEFAULTS))
      .then(({ data }) => {
        if (data && data.length > 0) {
          const merged = { ...DEFAULTS };
          data.forEach((row: { key: string; value: string }) => {
            (merged as any)[row.key] = row.value ?? '';
          });
          setS(merged);
        }
      });
  }, []);

  const socialLinks = [
    { url: s.social_facebook,  icon: <IconFacebook />,      label: 'Facebook'  },
    { url: s.social_instagram, icon: <IconInstagram />,     label: 'Instagram' },
    { url: s.social_youtube,   icon: <IconYoutube />,       label: 'YouTube'   },
    { url: s.social_whatsapp ? `https://wa.me/${s.social_whatsapp}` : '',
                               icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp',
      raw: s.social_whatsapp },
    { url: s.social_twitter,   icon: <IconTwitter />,       label: 'Twitter'   },
    { url: s.social_tiktok,    icon: <IconTiktok />,        label: 'TikTok'    },
  ].filter((item) => ('raw' in item ? item.raw : item.url));

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Kolom 1: Identitas & Sosial */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Logo MTs KHWM" className="w-12 h-12 object-contain bg-white rounded-full p-1" />
              <span className="text-xl font-bold text-white">{s.footer_school_name}</span>
            </div>
            <p className="text-sm leading-relaxed">{s.footer_tagline}</p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-start hover:text-white transition-colors"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Tautan Cepat</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/berita" className="hover:text-primary-start transition-colors">Berita Terkini</Link></li>
              <li><Link to="/opini" className="hover:text-primary-start transition-colors">Opini &amp; Artikel</Link></li>
              <li><Link to="/buletin" className="hover:text-primary-start transition-colors">Buletin Digital</Link></li>
              <li><Link to="/guru-staf" className="hover:text-primary-start transition-colors">Direktori Guru &amp; Staf</Link></li>
              <li><Link to="/program-unggulan" className="hover:text-primary-start transition-colors">Program Unggulan</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary-start flex-shrink-0" />
                <span>{s.footer_address}</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-primary-start flex-shrink-0" />
                <span>{s.footer_phone}</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-primary-start flex-shrink-0" />
                <span>{s.footer_email}</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Jam Operasional */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Jam Operasional</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-primary-start flex-shrink-0" />
                <div>
                  <span className="block text-white">Senin - Jumat</span>
                  <span>{s.footer_hours_weekday}</span>
                </div>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-primary-start flex-shrink-0" />
                <div>
                  <span className="block text-white">Sabtu</span>
                  <span>{s.footer_hours_saturday}</span>
                </div>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className="text-slate-500">Minggu &amp; Libur Nasional Tutup</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {s.footer_copyright}. Hak Cipta Dilindungi.</p>
          <p>Powered by <span className="text-primary-start font-medium">SIM KHWM</span></p>
        </div>
      </div>
    </footer>
  );
}
