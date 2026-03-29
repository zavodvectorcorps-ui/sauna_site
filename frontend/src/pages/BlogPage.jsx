import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { GlobalHeader } from '../components/GlobalHeader';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_LABELS = {
  sauny: 'Sauny',
  balie: 'Balie',
  lifestyle: 'Lifestyle',
  b2b: 'B2B',
};

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const url = activeCategory
      ? `${API}/api/blog/articles?category=${activeCategory}`
      : `${API}/api/blog/articles`;
    fetch(url)
      .then(r => r.json())
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    fetch(`${API}/api/blog/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const estimateReadTime = (excerpt) => {
    const words = (excerpt || '').split(' ').length;
    return Math.max(3, Math.ceil(words / 40)) + ' min';
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" data-testid="blog-page">
      <GlobalHeader />
      {/* Hero */}
      <div className="bg-[#1A1A1A] text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[#C6A87C] text-sm tracking-widest uppercase mb-4">Baza wiedzy</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" data-testid="blog-title">
              Blog WM Group
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
              Poradniki, porównania i wszystko, co musisz wiedzieć o saunach ogrodowych i baliach drewnianych.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2.5 text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-[#1A1A1A] text-white shadow-lg'
                : 'bg-white text-[#595959] border border-black/10 hover:border-[#C6A87C]/40'
            }`}
            data-testid="blog-cat-all"
          >
            Wszystkie ({articles.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1A1A1A] text-white shadow-lg'
                  : 'bg-white text-[#595959] border border-black/10 hover:border-[#C6A87C]/40'
              }`}
              data-testid={`blog-cat-${cat.id}`}
            >
              {CATEGORY_LABELS[cat.id] || cat.id} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {loading ? (
          <div className="text-center py-20 text-[#8C8C8C]">Wczytywanie...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-[#8C8C8C]">Brak artykułów w tej kategorii</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article, i) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => navigate(`/blog/${article.slug}`)}
                className="bg-white border border-black/5 cursor-pointer group hover:shadow-lg transition-shadow"
                data-testid={`blog-card-${article.slug}`}
              >
                {article.cover_image && (
                  <div className="aspect-[16/10] overflow-hidden bg-[#F2F2F0]">
                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                {!article.cover_image && (
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-center">
                    <span className="text-[#C6A87C] text-4xl font-bold opacity-20">WM</span>
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-[#C6A87C] font-medium uppercase tracking-wider">
                      {CATEGORY_LABELS[article.category] || article.category}
                    </span>
                    <span className="text-[#D9D9D9]">|</span>
                    <span className="flex items-center gap-1 text-xs text-[#8C8C8C]">
                      <Clock size={12} /> {estimateReadTime(article.excerpt)}
                    </span>
                  </div>
                  <h2 className="text-[#1A1A1A] font-bold text-base sm:text-lg leading-snug mb-2 group-hover:text-[#C6A87C] transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-[#8C8C8C] text-sm leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(article.created_at)}
                    </span>
                    <span className="text-[#C6A87C] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Czytaj <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
