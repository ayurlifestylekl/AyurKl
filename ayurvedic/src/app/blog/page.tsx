import type { Metadata } from 'next'

import BlogIndex from '@/components/blog/BlogIndex'
import { sanityClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import { POSTS_INDEX_QUERY } from '@/sanity/queries'
import type { PostListItem } from '@/types/blog'

export const metadata: Metadata = {
  title: 'The Journal — Notes from a Kerala Vaidya',
  description:
    'Stories, daily rituals, seasonal protocols and field notes from Vaidya AKHIL HS at Kerala Ayurvedic Lifestyle in Brickfields, Kuala Lumpur.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'The Journal — Kerala Ayurvedic Lifestyle',
    description:
      'Authentic Ayurveda writing from a practising Kerala Vaidya. Read stories, rituals and seasonal protocols.',
    url: 'https://keralaayurvedic.com/blog',
    type: 'website',
  },
}

export const revalidate = 3600

async function loadPosts(): Promise<PostListItem[]> {
  if (!isSanityConfigured) return []
  try {
    const posts = await sanityClient.fetch<PostListItem[]>(POSTS_INDEX_QUERY)
    return posts ?? []
  } catch (err) {
    console.error('[blog] Sanity fetch failed:', err)
    return []
  }
}

export default async function BlogPage() {
  const posts = await loadPosts()
  return <BlogIndex posts={posts} />
}
