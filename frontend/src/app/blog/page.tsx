"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { Badge, Skeleton, SectionTag } from '@/components/ui';
import { formatDate, truncate } from '@/lib/utils';

// ── Public header (reusable)
const PubHeader = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
        </div>
        <span className="text-lg font-black">Synkly<span className="text-blue-600"> ERP</span></span>
      </Link>
      <nav className="hidden md:flex items-center gap-1">
        {['Home','Product','Pricing','Blog','Contact'].map(l => (
          <Link key={l} href={l==='Home'?'/':'/'+l.toLowerCase()}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all">{l}</Link>
        ))}
      </nav>
      <Link href="/auth/register">
        <button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">Get Started</button>
      </Link>
    </div>
  </header>
);

const PubFooter = () => (
  <footer className="bg-slate-900 text-white/50 py-12 mt-16">
    <div className="container mx-auto px-6 text-center">
      <div className="flex items-center justify-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
        </div>
        <span className="text-base font-black text-white">Synkly<span className="text-blue-400"> ERP</span></span>
      </div>
      <p className="text-sm">© {new Date().getFullYear()} Synkly ERP. All rights reserved.</p>
    </div>
  </footer>
);

// ── Blog listing page
export default function BlogPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: catsData } = useQuery({ queryKey: ['blog-cats'], queryFn: () => blogApi.categories() });
  const categories = catsData?.data?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['public-blog', page, category, search],
    queryFn: () => blogApi.list({ page, limit: 9, category: category || undefined, search: search || undefined }),
  });
  const posts = data?.data?.data || [];
  const total = data?.data?.count || 0;
  const pages_count = data?.data?.pages || 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <PubHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 py-16 text-center">
        <div className="container mx-auto px-6">
          <SectionTag>📝 Insights</SectionTag>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mt-2 mb-4">
            From the <span style={{background:'linear-gradient(135deg,#60a5fa,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Synkly Blog</span>
          </h1>
          <p className="text-lg text-white/55 max-w-lg mx-auto">Deep dives, guides, and industry insights from our team of ERP experts.</p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 shadow-sm"
              placeholder="Search articles…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setCategory(''); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!category ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
              All
            </button>
            {categories.map((c: string) => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${category===c ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => <Skeleton key={i} className="h-60 rounded-xl" />)}
          </div>
        ) : posts.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p: any) => (
                <Link key={p._id} href={`/blog/${p.slug}`}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-250">
                  {p.coverImage && (
                    <div className="h-44 overflow-hidden bg-slate-100">
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  {!p.coverImage && (
                    <div className="h-44 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-5xl">📝</div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="blue">{p.category}</Badge>
                      <span className="text-xs text-slate-400">{p.readingTime} min read</span>
                    </div>
                    <h2 className="font-black text-base leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{p.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{p.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {p.author?.firstName?.[0] || '?'}{p.author?.lastName?.[0] || ''}
                        </div>
                        <span className="text-xs text-slate-500">{p.author?.firstName} {p.author?.lastName}</span>
                      </div>
                      <span className="text-xs text-slate-400">{p.publishedAt ? formatDate(p.publishedAt) : ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pages_count > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
                {[...Array(pages_count)].map((_,i) => (
                  <button key={i} onClick={() => setPage(i+1)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${page===i+1?'bg-blue-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {i+1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages_count,p+1))} disabled={page===pages_count}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">📝</div>
            <h3 className="text-xl font-bold mb-2">No posts found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
      <PubFooter />
    </div>
  );
}

// Export PubHeader and PubFooter for reuse
export { PubHeader, PubFooter };
