import React, { useState, useEffect, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type BuletinPage } from '../types';
import { optimizeCloudinaryUrl } from '../lib/utils';

interface FlipbookViewerProps {
  editionId: string;
  onClose: () => void;
  editionTitle?: string;
}

// Individual page rendered inside the flipbook
const Page = React.forwardRef<HTMLDivElement, { page: BuletinPage; visible: boolean }>(
  ({ page, visible }, ref) => {
    return (
      <div
        ref={ref}
        className="select-none overflow-hidden bg-white"
        style={{ width: '100%', height: '100%' }}
      >
        {visible ? (
          <img
            src={optimizeCloudinaryUrl(page.image_url)}
            alt={`Halaman ${page.page_number}`}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-start border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }
);
Page.displayName = 'Page';

export function FlipbookViewer({ editionId, onClose, editionTitle }: FlipbookViewerProps) {
  const [pages, setPages] = useState<BuletinPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 400, height: 580 });
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive dimensions
  const calcDimensions = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isPortrait = vw < 768;

    if (isPortrait) {
      // Mobile: fill full screen, minus top bar (52px) + bottom bar (56px)
      const availH = vh - 52 - 56 - 16; // 16px breathing room
      const w = vw - 16; // 8px margin each side
      // clamp height so it doesn't exceed available
      const h = Math.min(Math.round(w * 1.41), availH);
      const finalW = Math.round(h / 1.41);
      setDimensions({ width: finalW, height: h });
    } else {
      // Desktop: two-page spread
      const maxW = Math.min((vw - 160) / 2, 480);
      const maxH = vh - 160;
      const h = Math.min(Math.round(maxW * 1.41), maxH);
      const w = Math.round(h / 1.41);
      setDimensions({ width: w, height: h });
    }
  }, []);

  useEffect(() => {
    calcDimensions();
    window.addEventListener('resize', calcDimensions);
    return () => window.removeEventListener('resize', calcDimensions);
  }, [calcDimensions]);

  useEffect(() => {
    async function fetchPages() {
      try {
        const { data, error } = await supabase
          .from('buletin_pages')
          .select('*')
          .eq('edition_id', editionId)
          .order('page_number', { ascending: true });
        if (error) throw error;
        setPages(data || []);
        setTotalPages(data?.length || 0);
      } catch (err) {
        console.error('Error fetching buletin pages:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPages();
  }, [editionId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') flipPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPage, totalPages]);

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
    setIsFlipping(false);
  };

  const onFlipStart = () => setIsFlipping(true);

  const flipNext = () => {
    if (!isFlipping && currentPage < totalPages - 1) {
      flipBookRef.current?.pageFlip()?.flipNext();
    }
  };

  const flipPrev = () => {
    if (!isFlipping && currentPage > 0) {
      flipBookRef.current?.pageFlip()?.flipPrev();
    }
  };

  const goToPage = (page: number) => {
    flipBookRef.current?.pageFlip()?.turnToPage(page);
  };

  const zoomIn = () => setZoom(z => Math.min(z + 0.2, 2.0));
  const zoomOut = () => setZoom(z => Math.max(z - 0.2, 0.6));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  // Spread indicator e.g. "3 / 10"
  const isPortrait = window.innerWidth < 768;
  const displayPage = currentPage + 1;
  const displayRight = isPortrait ? currentPage + 1 : Math.min(currentPage + 2, totalPages);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#1a1a2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-primary-start animate-bounce" />
          <span className="text-white text-lg font-medium">Memuat Buletin...</span>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#1a1a2e] flex flex-col items-center justify-center gap-6">
        <BookOpen className="w-16 h-16 text-slate-500" />
        <p className="text-white text-xl font-medium">Halaman buletin belum tersedia.</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-primary-start text-white rounded-full font-bold hover:bg-primary-end transition-colors"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center, #2d2d44 0%, #0d0d1a 100%)' }}
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-8 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary-start" />
          <span className="text-white font-semibold text-sm md:text-base truncate max-w-[200px] md:max-w-sm">
            {editionTitle || 'Buletin'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.6}
            className="hidden md:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
            title="Perkecil"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="hidden md:block text-white/50 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={zoom >= 2.0}
            className="hidden md:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
            title="Perbesar"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="hidden md:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Layar Penuh"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors ml-2"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main flipbook area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-0 md:px-4 py-0 md:py-2">
        {/* Prev button */}
        <button
          onClick={flipPrev}
          disabled={currentPage === 0}
          className="hidden md:flex shrink-0 w-12 h-12 rounded-full items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all disabled:opacity-20 disabled:cursor-default mr-4 shadow-lg"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Book container with shadow + zoom */}
        <div
          className="relative transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Subtle page shadow/glow */}
          <div
            className="absolute inset-0 rounded-sm pointer-events-none"
            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}
          ></div>

          {/* @ts-ignore */}
          <HTMLFlipBook
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            minWidth={200}
            maxWidth={600}
            minHeight={280}
            maxHeight={900}
            drawShadow={true}
            flippingTime={700}
            maxShadowOpacity={0.6}
            showCover={true}
            mobileScrollSupport={false}
            onFlip={onFlip}
            onChangeState={onFlipStart}
            className="flip-book"
            ref={flipBookRef}
            startPage={0}
            usePortrait={isPortrait}
            startZIndex={10}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
          >
            {pages.map((page, index) => {
              const isNearCurrent = Math.abs(index - currentPage) <= 3;
              return (
                <Page
                  key={page.id}
                  page={page}
                  visible={isNearCurrent}
                />
              );
            })}
          </HTMLFlipBook>
        </div>

        {/* Next button */}
        <button
          onClick={flipNext}
          disabled={currentPage >= totalPages - 1}
          className="hidden md:flex shrink-0 w-12 h-12 rounded-full items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all disabled:opacity-20 disabled:cursor-default ml-4 shadow-lg"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Controls bar */}
      <div className="shrink-0 flex items-center justify-center gap-3 md:gap-6 px-4 py-3 bg-black/30 backdrop-blur-sm border-t border-white/10">
        {/* Mobile prev */}
        <button
          onClick={flipPrev}
          disabled={currentPage === 0}
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page dots (max 10 shown) */}
        <div className="flex items-center gap-1.5 overflow-hidden max-w-[200px]">
          {pages.slice(0, Math.min(totalPages, 12)).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToPage(idx)}
              className={`rounded-full transition-all duration-200 ${
                idx === currentPage
                  ? 'w-5 h-2 bg-primary-start'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Halaman ${idx + 1}`}
            />
          ))}
          {totalPages > 12 && <span className="text-white/40 text-xs ml-1">…</span>}
        </div>

        {/* Page number */}
        <span className="text-white/80 font-medium text-sm min-w-[70px] text-center">
          {isPortrait
            ? `${displayPage} / ${totalPages}`
            : `${displayPage}–${displayRight} / ${totalPages}`}
        </span>

        {/* Mobile next */}
        <button
          onClick={flipNext}
          disabled={currentPage >= totalPages - 1}
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-primary-start to-primary-end disabled:opacity-30 transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
