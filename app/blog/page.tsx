import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-[#FDF6EE]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block text-[#E8A838] text-sm font-semibold tracking-[0.2em] uppercase mb-4 hover:text-[#d4952d] transition-colors"
          >
            ← Silly Goose Tales
          </Link>
          <h1
            className="text-4xl font-bold text-[#2C2A26] mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The Gander's Blog
          </h1>
          <p className="text-base text-[#5a5550]">
            Bedtime stories, parenting thoughts, and gentle wisdom from Gus Gander
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#5a5550] italic">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl border border-[#e8ddd0] p-6 shadow-sm hover:shadow-md hover:border-[#E8A838] transition-all"
              >
                <div className="flex items-baseline justify-between mb-2 gap-4">
                  <h2
                    className="text-2xl font-bold text-[#2C2A26]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {post.title}
                  </h2>
                  <time className="text-xs text-[#bbb] whitespace-nowrap">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <p className="text-[#5a5550] leading-relaxed mb-3">
                  {post.description}
                </p>
                <p className="text-sm text-[#E8A838] font-medium">
                  Read more →
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-[#e8ddd0]">
          <Link
            href="/"
            className="text-sm text-[#5a5550] hover:text-[#E8A838] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
