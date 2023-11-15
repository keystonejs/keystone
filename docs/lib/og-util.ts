let baseUrl = 'http:/localhost:8000'
if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
  baseUrl = 'https://keystonejs.com'
} else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
  baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
}

export const getOgAbsoluteUrl = ({ title, type }: { title: string, type?: string }) => {
  const ogUrl = new URL(`${baseUrl}/api/hero-image`)

  ogUrl.searchParams.append('title', title)
  if (typeof type === 'string') {
    ogUrl.searchParams.append('type', type)
  }

  return ogUrl.href
}

export const siteBaseUrl = baseUrl
