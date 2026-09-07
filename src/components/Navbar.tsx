import { NavLink, useNavigate } from 'react-router-dom';
import { DarkModeToggle } from './DarkModeToggle';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Newspaper, MessageSquare, Book, Users, Star, ChevronRight } from 'lucide-react';

function cn(...inputs: string[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000); // 2 seconds window
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      navigate('/admin/login');
      setClickCount(0);
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Berita', path: '/berita', icon: Newspaper },
    { name: 'Opini', path: '/opini', icon: MessageSquare },
    { name: 'Buletin', path: '/buletin', icon: Book },
    { name: 'Guru & Staf', path: '/guru-staf', icon: Users },
    { name: 'Program Unggulan', path: '/program-unggulan', icon: Star },
  ];

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-white dark:bg-slate-900 transition-colors relative z-50">
      {/* Tier 1: Logo & Title */}
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-4">
        {/* Logo and Big Text */}
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-1 overflow-hidden" 
          onClick={handleLogoClick}
          title="Ketuk 5 kali untuk login admin"
        >
          <img 
            src="/logo.png" 
            alt="Logo MTs KHWM" 
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 object-contain shrink-0" 
          />
          <div className="flex flex-col truncate">
            <h1 className="text-[1.1rem] sm:text-[1.3rem] leading-tight md:text-4xl lg:text-5xl font-black tracking-tighter uppercase truncate">
              <span className="text-[#0f172a] dark:text-white">KABAR</span> <br className="md:hidden" />
              <span className="text-primary-start">MTs KH A WAHAB MUHSIN</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 font-serif italic mt-0.5 truncate">
              Portal Berita & Informasi Madrasah
            </p>
          </div>
        </div>

        {/* Date & Toggle (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {currentDate}
            </span>
            <DarkModeToggle />
          </div>
          <button 
            className="md:hidden p-2 -mr-2 text-primary-start"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Tier 2: Navigation Links (Desktop Sticky) */}
      <nav className="hidden md:block sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-5 py-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all border-b-[3px]',
                      isActive
                        ? 'text-primary-start border-primary-start'
                        : 'text-slate-600 border-transparent bg-transparent dark:text-slate-300 hover:text-primary-start'
                    )
                  }
                >
                  <Icon className="w-4 h-4 hidden" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Menu Navigasi</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all',
                        isActive
                          ? 'bg-green-50 dark:bg-green-900/20 text-primary-start'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Mode Gelap</span>
                <DarkModeToggle />
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest">
                MTs KH A Wahab Muhsin
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
