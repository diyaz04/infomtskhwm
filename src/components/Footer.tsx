import { MapPin, Phone, Mail, Clock, Globe, MessageCircle, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Logo MTs KHWM" className="w-12 h-12 object-contain bg-white rounded-full p-1" />
              <span className="text-xl font-bold text-white">MTs KHWM</span>
            </div>
            <p className="text-sm leading-relaxed">
              Lembaga pendidikan Islam tingkat menengah pertama yang berdedikasi mencetak generasi berprestasi, berakhlakul karimah, dan berwawasan luas.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-start hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-start hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-start hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Tautan Cepat</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/berita" className="hover:text-primary-start transition-colors">Berita Terkini</Link></li>
              <li><Link to="/opini" className="hover:text-primary-start transition-colors">Opini & Artikel</Link></li>
              <li><Link to="/buletin" className="hover:text-primary-start transition-colors">Buletin Digital</Link></li>
              <li><Link to="/guru-staf" className="hover:text-primary-start transition-colors">Direktori Guru & Staf</Link></li>
              <li><Link to="/program-unggulan" className="hover:text-primary-start transition-colors">Program Unggulan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary-start flex-shrink-0" />
                <span>Jl. Pendidikan No. 123, Kecamatan Taktakan, Kota Serang, Banten 42162</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-primary-start flex-shrink-0" />
                <span>(0254) 1234567</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-primary-start flex-shrink-0" />
                <span>info@mtskhwm.sch.id</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Jam Operasional</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-primary-start flex-shrink-0" />
                <div>
                  <span className="block text-white">Senin - Jumat</span>
                  <span>07:00 - 15:00 WIB</span>
                </div>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-primary-start flex-shrink-0" />
                <div>
                  <span className="block text-white">Sabtu</span>
                  <span>07:00 - 12:00 WIB</span>
                </div>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className="text-slate-500">Minggu & Libur Nasional Tutup</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} MTs KH. A. Wahab Muhsin. Hak Cipta Dilindungi.</p>
          <p>Powered by <span className="text-primary-start font-medium">SIM KHWM</span></p>
        </div>
      </div>
    </footer>
  );
}
