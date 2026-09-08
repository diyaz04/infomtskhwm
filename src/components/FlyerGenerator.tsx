import { useRef, useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { Download, X, Loader2, RefreshCw, ImageIcon } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Button } from './Button';

export interface FlyerData {
  title: string;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  articleUrl: string;
}

interface Props {
  data: FlyerData;
  onClose: () => void;
}

// ── Canvas helpers ─────────────────────────────────────────────────────────────

function loadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Wrap text on canvas; returns number of lines drawn */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      if (lineCount === maxLines - 1) {
        let truncated = line;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0)
          truncated = truncated.slice(0, -1);
        ctx.fillText(truncated + '...', x, y + lineCount * lineHeight);
        return lineCount + 1;
      }
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount++;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + lineCount * lineHeight);
  return lineCount + 1;
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Object-fit: cover — calc source crop */
function coverCrop(imgW: number, imgH: number, dstW: number, dstH: number) {
  const ir = imgW / imgH;
  const dr = dstW / dstH;
  let sx = 0, sy = 0, sw = imgW, sh = imgH;
  if (ir > dr) { sw = imgH * dr; sx = (imgW - sw) / 2; }
  else          { sh = imgW / dr; sy = (imgH - sh) / 2; }
  return { sx, sy, sw, sh };
}

// ── Layout constants (tuned to template 828×1035) ─────────────────────────────
const W = 828, H = 1035;
const IMG_X = 50,  IMG_Y = 122, IMG_W = 728, IMG_H = 432, IMG_R = 26;
const TITLE_X = 50, TITLE_Y = 578, TITLE_LH = 48, TITLE_MAX_W = 728;
const EXRP_X  = 50, EXRP_LH  = 30, EXRP_MAX_W  = 728;
const QR_X = 570, QR_Y = 768, QR_SIZE = 220;

// ── Component ─────────────────────────────────────────────────────────────────

export function FlyerGenerator({ data, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const generate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setGenerating(true);
    setError(null);
    canvas.width  = W;
    canvas.height = H;

    try {
      // 1. Template background
      const tpl = await loadImage('/flyer-template.png');
      ctx.drawImage(tpl, 0, 0, W, H);

      // 2. Cover image with rounded-rect clip
      ctx.save();
      roundedRectPath(ctx, IMG_X, IMG_Y, IMG_W, IMG_H, IMG_R);
      ctx.clip();

      if (data.coverImageUrl) {
        try {
          const cover = await loadImage(data.coverImageUrl, 'anonymous');
          const { sx, sy, sw, sh } = coverCrop(cover.naturalWidth, cover.naturalHeight, IMG_W, IMG_H);
          ctx.drawImage(cover, sx, sy, sw, sh, IMG_X, IMG_Y, IMG_W, IMG_H);
        } catch {
          // CORS fallback — green gradient placeholder
          const g = ctx.createLinearGradient(IMG_X, IMG_Y, IMG_X + IMG_W, IMG_Y + IMG_H);
          g.addColorStop(0, '#bbf7d0'); g.addColorStop(1, '#34d399');
          ctx.fillStyle = g;
          ctx.fillRect(IMG_X, IMG_Y, IMG_W, IMG_H);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.font = 'bold 28px system-ui, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Gambar tidak tersedia (CORS)', IMG_X + IMG_W / 2, IMG_Y + IMG_H / 2);
        }
      } else {
        const g = ctx.createLinearGradient(IMG_X, IMG_Y, IMG_X + IMG_W, IMG_Y + IMG_H);
        g.addColorStop(0, '#bbf7d0'); g.addColorStop(1, '#34d399');
        ctx.fillStyle = g; ctx.fillRect(IMG_X, IMG_Y, IMG_W, IMG_H);
      }
      ctx.restore();

      // 3. Title (bold, max 2 lines)
      ctx.font          = 'bold 40px system-ui, -apple-system, Arial, sans-serif';
      ctx.fillStyle     = '#0f172a';
      ctx.textBaseline  = 'top';
      ctx.textAlign     = 'left';
      const titleLines  = wrapText(ctx, data.title, TITLE_X, TITLE_Y, TITLE_MAX_W, TITLE_LH, 2);

      // 4. Excerpt (max 3 lines, dynamic Y after title)
      const excerptY = TITLE_Y + titleLines * TITLE_LH + 12;
      const excerpt  = stripHtml(data.content);
      ctx.font       = '22px system-ui, -apple-system, Arial, sans-serif';
      ctx.fillStyle  = '#334155';
      wrapText(ctx, excerpt, EXRP_X, excerptY, EXRP_MAX_W, EXRP_LH, 3);

      // 5. Date label (right-aligned, sits on yellow/olive tab drawn by template)
      const dateStr    = formatDate(data.publishedAt || data.createdAt);
      ctx.font         = 'bold 22px system-ui, -apple-system, Arial, sans-serif';
      ctx.fillStyle    = '#1a1a1a';
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(dateStr, W - 18, 746);

      // 6. QR Code (white rounded rect background + QR image)
      const qrDataUrl = await QRCode.toDataURL(data.articleUrl, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000ff', light: '#ffffffff' },
      });
      const qrImg = await loadImage(qrDataUrl);

      ctx.save();
      ctx.fillStyle = '#ffffff';
      roundedRectPath(ctx, QR_X, QR_Y, QR_SIZE, QR_SIZE, 16);
      ctx.fill();
      ctx.drawImage(qrImg, QR_X + 10, QR_Y + 10, QR_SIZE - 20, QR_SIZE - 20);
      ctx.restore();

      setGenerating(false);
    } catch (err: any) {
      console.error('[FlyerGenerator]', err);
      setError('Gagal membuat flyer. ' + (err?.message ?? ''));
      setGenerating(false);
    }
  }, [data]);

  useEffect(() => { generate(); }, [generate]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href    = url;
        a.download = `flyer-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch {
      alert('Gagal download. Coba refresh halaman dan buat flyer ulang.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary-start" />
            Buat Flyer Otomatis
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="overflow-y-auto flex-grow p-4 min-h-[200px]">
          {generating && !error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-start" />
              <p className="text-sm font-medium">Membuat flyer...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={generate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`w-full h-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700 ${generating || error ? 'hidden' : 'block'}`}
          />
        </div>

        {/* Info */}
        {!generating && !error && (
          <div className="px-5 py-2 flex-shrink-0">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              QR Code mengarah ke halaman artikel ini
            </p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
          <Button
            onClick={handleDownload}
            disabled={generating || !!error}
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
