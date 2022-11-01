let baseUrl = 'http:/localhost:8000';
if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
  baseUrl = 'https://keystonejs.com';
} else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
  baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
}

export const getOgAbsoluteUrl = ({
  title,
  description,
  type,
}: {
  title: string;
  description?: string;
  type?: string;
}) => {
  const ogUrl = new URL(`${baseUrl}/api/hero-image`);

  ogUrl.searchParams.append('title', title);
  if (typeof description === 'string') {
    ogUrl.searchParams.append('description', description);
  }
  if (typeof type === 'string') {
    ogUrl.searchParams.append('type', type);
  }

  return ogUrl.href;
};
