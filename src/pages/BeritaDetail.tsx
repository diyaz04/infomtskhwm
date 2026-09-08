import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, Calendar, User, ThumbsUp, MessageCircle, Share2, Check, ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type News, type NewsComment } from '../types';
import { formatDate, getTiktokId } from '../lib/utils';
import { Button } from '../components/Button';
import { clsx } from 'clsx';
import { FlyerGenerator, type FlyerData } from '../components/FlyerGenerator';

export function BeritaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactions state
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFlyer, setShowFlyer] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setNews(data);
        setLikes(data.likes_count || 0);

        // Check local storage if user already liked this
        const likedStatus = localStorage.getItem(`liked_news_${data.id}`);
        if (likedStatus) setHasLiked(true);

        // Fetch comments
        const { data: commentsData } = await supabase
          .from('news_comments')
          .select('*')
          .eq('news_id', data.id)
          .order('created_at', { ascending: false });
        
        if (commentsData) setComments(commentsData);

      } catch (error) {
        console.error('Error fetching news detail:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [slug]);

  const handleLike = async () => {
    if (!news || hasLiked) return;
    
    // Optimistic UI update
    setLikes(prev => prev + 1);
    setHasLiked(true);
    localStorage.setItem(`liked_news_${news.id}`, 'true');

    // Send to Supabase via RPC
    try {
      await supabase.rpc('increment_news_like', { news_id: news.id });
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!news || !newCommentName.trim() || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('news_comments')
        .insert([{
          news_id: news.id,
          author_name: newCommentName,
          content: newCommentText
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setComments([data, ...comments]);
        setNewCommentName('');
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert('Gagal mengirim komentar.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = news?.title || 'Kabar MTs KHWM';

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (err) {
        console.log('Share canceled or failed.', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `Coba baca berita ini: ${news?.title} - ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat detail berita...</div>;
  }

  if (!news) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Berita tidak ditemukan</h2>
        <RouterLink to="/berita">
          <Button>Kembali ke Berita</Button>
        </RouterLink>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-0">
      <div className="mb-6">
        <RouterLink to="/berita" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-start transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Berita
        </RouterLink>
      </div>

      <article>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {news.category && (
            <span className="inline-block text-sm font-semibold text-primary-start bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
              {news.category}
            </span>
          )}
          {news.source === 'instagram' ? (
            news.source_url ? (
              <a href={news.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full hover:shadow-md transition-shadow">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                Instagram
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                Instagram
              </span>
            )
          ) : news.source && news.source !== 'manual' && news.source !== 'Redaksi' ? (
            <span className="inline-block text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Sumber: {news.source}
            </span>
          ) : null}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          {news.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          {news.author_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{news.author_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(news.published_at || news.created_at)}</span>
          </div>
        </div>

        {news.cover_image_url && (
          <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-sm">
            <img src={news.cover_image_url} alt={news.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}

        <div 
          className="prose prose-slate dark:prose-invert max-w-none prose-a:text-primary-start hover:prose-a:text-primary-hoverStart mb-10"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {news.tiktok_url && getTiktokId(news.tiktok_url) && (
          <div className="mb-12 w-full max-w-sm mx-auto">
            <iframe 
              src={`https://www.tiktok.com/embed/v2/${getTiktokId(news.tiktok_url)}`} 
              className="w-full aspect-[9/16] rounded-xl border border-slate-200 shadow-sm"
              allowFullScreen
              allow="encrypted-media;"
            ></iframe>
          </div>
        )}
      </article>

      {/* Interactions (Like & Share) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            disabled={hasLiked}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all",
              hasLiked 
                ? "bg-primary-start text-white shadow-md shadow-primary-start/30 cursor-default"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <ThumbsUp className={clsx("w-5 h-5", hasLiked && "fill-current")} />
            <span>{likes} Suka</span>
          </button>
          
          <div className="flex items-center gap-2 text-slate-500">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{comments.length} Komentar</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500 mr-2">Bagikan:</span>
          
          <button onClick={handleShareWhatsApp} className="p-2.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors" title="Share ke WhatsApp">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          
          <button onClick={handleShare} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Bagikan Link">
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowFlyer(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium"
            title="Buat Flyer"
          >
            <ImageIcon className="w-4 h-4" />
            Flyer
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12 mb-24">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Komentar Pembaca</h3>
        
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Anda *</label>
            <input 
              type="text" 
              required
              value={newCommentName}
              onChange={(e) => setNewCommentName(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-start outline-none"
              placeholder="Masukkan nama"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Komentar *</label>
            <textarea 
              required
              rows={4}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-start outline-none resize-y"
              placeholder="Tulis pendapat Anda..."
            ></textarea>
          </div>
          <Button type="submit" disabled={submittingComment || !newCommentName.trim() || !newCommentText.trim()}>
            {submittingComment ? 'Mengirim...' : 'Kirim Komentar'}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-start to-primary-end rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
                  {comment.author_name.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{comment.author_name}</h4>
                    <span className="text-xs text-slate-500">• {formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Flyer Generator Modal */}
    {showFlyer && news && (
      <FlyerGenerator
        data={{
          title: news.title,
          content: news.content,
          coverImageUrl: news.cover_image_url,
          publishedAt: news.published_at,
          createdAt: news.created_at,
          articleUrl: window.location.href,
        } satisfies FlyerData}
        onClose={() => setShowFlyer(false)}
      />
    )}
    </>
  );
}
