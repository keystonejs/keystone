import { readFile } from 'node:fs/promises'

import { ImageResponse } from 'next/og'

import { reader } from '../../../../../keystatic/reader.ts'

const size = { width: 1200, height: 630 }
export const runtime = 'nodejs'
export const dynamic = 'force-static'

const background = readFile(
  new URL('../../../../../public/assets/blog/blog-cover-bg.png', import.meta.url)
).then(file => `data:image/png;base64,${file.toString('base64')}`)

const interSemiBold = readFile(
  new URL('../../../../../public/assets/blog/font/Inter-SemiBold.ttf', import.meta.url)
).then(file => file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer)

const interExtraBold = readFile(
  new URL('../../../../../public/assets/blog/font/Inter-ExtraBold.ttf', import.meta.url)
).then(file => file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer)

export async function generateStaticParams() {
  const posts = await reader.collections.posts.list()
  return posts.map(post => ({ post }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ post: string }> }) {
  const { post: slug } = await params
  const post = await reader.collections.posts.read(slug)
  const title = post?.title ? `${post.title} - Keystone 6 Blog` : 'Keystone 6 Blog'
  const clippedTitle = title.length > 100 ? title.substring(0, 100) + '...' : title

  let titleFontSize = 96
  if (clippedTitle.length > 80) {
    titleFontSize = 60
  } else if (clippedTitle.length > 60) {
    titleFontSize = 72
  } else if (clippedTitle.length > 35) {
    titleFontSize = 80
  }

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        backgroundColor: 'white',
        backgroundImage: `url(${await background})`,
        height: '100%',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            padding: '80px 80px 0',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15 0C6.71573 0 0 6.71573 0 15V65C0 73.2843 6.71573 80 15 80H65C73.2843 80 80 73.2843 80 65V15C80 6.71573 73.2843 0 65 0H15ZM33.2324 49.2969V61.25H22.4805V18.9746H33.2324V37.1387H33.7891L47.8516 18.9746H59.3945L44.7754 37.6367L60.2441 61.25H47.6172L36.9531 44.5801L33.2324 49.2969Z"
              fill="white"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'white',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 32,
              fontWeight: 600,
              color: '#166BFF',
            }}
          >
            Blog
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: '80px',
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: '#FFF',
              fontSize: titleFontSize,
              lineHeight: '115px',
              fontWeight: 800,
            }}
          >
            {clippedTitle}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Inter', data: await interSemiBold, style: 'normal', weight: 600 },
        { name: 'Inter', data: await interExtraBold, style: 'normal', weight: 800 },
      ],
    }
  )
}
