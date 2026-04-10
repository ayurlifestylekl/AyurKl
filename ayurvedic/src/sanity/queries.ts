import { groq } from 'next-sanity'

/**
 * Returns all treatment categories sorted by their explicit `order` field.
 * Falls back to alphabetical for any category missing an order.
 */
export const TREATMENT_CATEGORIES_QUERY = groq`
  *[_type == "treatmentCategory"] | order(order asc, title asc) {
    _id,
    title,
    order
  }
`

/**
 * Returns all treatments with category info flattened in for easy filtering
 * on the client without a second round-trip.
 */
export const TREATMENTS_QUERY = groq`
  *[_type == "treatment"] | order(category->order asc, title asc) {
    _id,
    title,
    duration,
    description,
    requiresConsultation,
    "categoryId":    category->_id,
    "categoryTitle": category->title,
    "categoryOrder": category->order
  }
`

/* ──────────────────────────────────────────────────────────────────────
 * Journal (blog) queries
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Listing page projection — lightweight, no body.
 * Sorted newest-first.
 */
export const POSTS_INDEX_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug":         slug.current,
    excerpt,
    publishedAt,
    "heroImageUrl": heroImage.asset->url,
    "authorName":   author->name,
    tags
  }
`

/**
 * Single-post projection used by /blog/[slug] — full body + author.
 * Returns null if no post matches the slug.
 */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug":         slug.current,
    excerpt,
    publishedAt,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    body,
    tags,
    readingTimeMinutes,
    author->{
      _id,
      name,
      "slug":     slug.current,
      role,
      bio,
      "imageUrl": image.asset->url
    }
  }
`

/**
 * Just the slugs — used by `generateStaticParams` so Next.js can pre-render
 * every post at build time.
 */
export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`

/**
 * Three most-recent posts excluding the one currently being read.
 * Used by the "Continue reading" footer on the detail page.
 */
export const RELATED_POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && _id != $currentId]
    | order(publishedAt desc)[0...3] {
    _id,
    title,
    "slug":         slug.current,
    excerpt,
    publishedAt,
    "heroImageUrl": heroImage.asset->url,
    "authorName":   author->name,
    tags
  }
`
