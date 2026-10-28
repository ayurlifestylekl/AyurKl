/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel Hobby's image-optimization quota ran out (402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED), blanking every uncached photo
    // site-wide. Serve originals directly — Storage photos are pre-resized at
    // upload (max 2400px JPEG). Remove this once on a plan with image quota.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      // Supabase Storage (admin/product/treatment image uploads) — without this,
      // any DB-stored Storage image URL would throw at render and 500 the page.
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;
