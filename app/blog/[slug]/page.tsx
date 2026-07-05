import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllSlugs } from '@/lib/blog'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Silly Goose Tales Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#FDF6EE]">
      <article className="max-w-2xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-block text-sm text-[#5a5550] hover:text-[#E8A838] transition-colors mb-8"
        >
          ← Back to blog
        </Link>

        {/* Post header */}
        <header className="mb-8">
          <h1
            className="text-4xl font-bold text-[#2C2A26] mb-4 leading-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[#bbb]">
            <span>{post.author}</span>
            <span>·</span>
            <time>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        {/* Post content */}
        <div
          className="blog-content text-lg leading-relaxed text-[#2C2A26]"
          style={{ fontFamily: 'Georgia, serif' }}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[#e8ddd0]">
          <Link
            href="/blog"
            className="inline-block text-sm text-[#5a5550] hover:text-[#E8A838] transition-colors"
          >
            ← Back to blog
          </Link>
        </footer>
      </article>

      {/* Site footer */}
      <div className="border-t border-[#e8ddd0] py-6 text-center mt-12">
        <p className="text-[#ccc] text-xs mb-2">Silly Goose Tales · No app. No login. Just stories.</p>
        <div className="flex justify-center gap-4 text-xs">
          <Link href="/privacy" className="text-[#bbb] hover:text-[#E8A838] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-[#bbb] hover:text-[#E8A838] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </main>
  )
}
