"use client";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { Badge, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.get(slug),
    enabled: !!slug,
  });
  const post = data?.data?.data;

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-black mb-2">Post not found</h2>
          <p className="text-slate-500 mb-6">This article doesn't exist or has been removed.</p>
          <Link href="/blog"><button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold">← Back to Blog</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
          <Link href="/blog"><button className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">← Back to Blog</button></Link>
        </div>
      </header>

      {isLoading ? (
        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-3">
            {[...Array(8)].map((_,i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        </div>
      ) : post ? (
        <article className="container mx-auto px-6 py-12 max-w-3xl">
          {/* Category + reading time */}
          <div className="flex items-center gap-3 mb-5">
            <Badge variant="blue">{post.category}</Badge>
            <span className="text-sm text-slate-400">{post.readingTime} min read</span>
            {post.tags?.map((t: string) => <Badge key={t} variant="gray" className="text-xs">{t}</Badge>)}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-5">{post.title}</h1>

          {/* Author + date */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200 mb-8">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
            </div>
            <div>
              <div className="font-bold text-sm">{post.author?.firstName} {post.author?.lastName}</div>
              <div className="text-xs text-slate-400">
                {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'} · {post.views || 0} views
              </div>
            </div>
          </div>

          {/* Cover image */}
          {post.coverImage && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200">
              <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover" />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
              <p className="text-blue-800 font-medium leading-relaxed">{post.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <div className="mt-14 bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-black text-white mb-2">Ready to transform your operations?</h3>
            <p className="text-white/55 text-sm mb-5">Start your 14-day free trial — no credit card required.</p>
            <Link href="/auth/register">
              <button className="px-7 py-3 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-100 transition-colors">
                Get Started Free →
              </button>
            </Link>
          </div>

          {/* Back */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2">
              ← Back to all articles
            </Link>
          </div>
        </article>
      ) : null}
    </div>
  );
}
