import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlobalHeader } from '../components/GlobalHeader';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_LABELS = { sauny: 'Sauny', balie: 'Balie', lifestyle: 'Lifestyle', b2b: 'B2B' };

export default function BlogArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/blog/articles/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setArticle)
      .catch(() => navigate('/blog'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#8C8C8C]">Wczytywanie...</div>;
  if (!article) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const readTime = Math.max(3, Math.ceil((article.content || '').split(' ').length / 200)) + ' min';

  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="blog-article-page">
      <Helmet
        title={`${article.title} | WM Group Blog`}
        meta={[{ name: 'description', content: article.meta_description || article.excerpt }]}
      />

      <GlobalHeader />

      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-white/50 hover:text-[#C6A87C] text-sm mb-8 transition-colors" data-testid="blog-back">
              <ArrowLeft size={16} /> Powrót do bloga
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-[#C6A87C] font-medium uppercase tracking-wider">{CATEGORY_LABELS[article.category] || article.category}</span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1 text-xs text-white/40"><Clock size={12} /> {readTime} czytania</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4" data-testid="article-title">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(article.created_at)}</span>
              <span>{article.author}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cover image */}
      {(article.cover_image || article.image_url) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
          <img src={article.cover_image || article.image_url} alt={article.title} className="w-full aspect-[2/1] object-cover shadow-xl" />
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14"
      >
        <article className="prose prose-lg max-w-none
          prose-headings:text-[#1A1A1A] prose-headings:font-bold
          prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-[#C6A87C] prose-h2:pl-4
          prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#4A4A4A] prose-p:leading-relaxed prose-p:mb-4
          prose-li:text-[#4A4A4A] prose-li:leading-relaxed
          prose-strong:text-[#1A1A1A]
          prose-table:text-sm
          prose-th:bg-[#1A1A1A] prose-th:text-white prose-th:font-medium prose-th:px-4 prose-th:py-2
          prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-black/5
          prose-a:text-[#C6A87C] prose-a:no-underline hover:prose-a:underline
        " data-testid="article-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
        </article>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-black/5">
            <Tag size={16} className="text-[#8C8C8C] mt-0.5" />
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-[#F2F2F0] text-[#595959] text-xs font-medium">{tag}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-[#1A1A1A] text-white text-center">
          <h3 className="text-xl font-bold mb-2">Masz pytania? Skontaktuj się z nami</h3>
          <p className="text-white/50 text-sm mb-5">Nasi doradcy pomogą Ci wybrać idealną saunę lub balię dla Twojego ogrodu.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/sauny#kontakt')} className="px-6 py-2.5 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060] transition-colors" data-testid="cta-sauny">
              Sauny ogrodowe
            </button>
            <button onClick={() => navigate('/balie#kontakt-balie')} className="px-6 py-2.5 border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors" data-testid="cta-balie">
              Balie drewniane
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
