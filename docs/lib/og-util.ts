let baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:8000'
if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
  baseUrl = 'https://keystonejs.com'
} else if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_VERCEL_URL) {
  baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
}

export const siteBaseUrl = baseUrl
