import { ImageResponse } from '@vercel/og'
import { type NextRequest } from 'next/server'
import { siteBaseUrl } from '../../../lib/og-util'

const bgImgUrl = `url(${siteBaseUrl}/assets/blog/blog-cover-bg.png)`

const HeroImage = ({ title, type }: { title: string, type?: string }) => {
  const clippedTitle = title.length > 100 ? title.substring(0, 100) + '...' : title
  let titleFontSize = 96
  if (clippedTitle.length > 35) {
    titleFontSize = 80
  } else if (clippedTitle.length > 60) {
    titleFontSize = 72
  } else if (title.length > 80) {
    titleFontSize = 60
  }

  return (
    <div
      id="wrap-everything-and-bg"
      style={{
        display: 'flex',
        backgroundColor: 'white',
        backgroundImage: bgImgUrl,
        height: '100%',
        width: '100%',
      }}
    >
      <div
        id="wrap-first-and-second-rows"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div
          id="first-row"
          style={{
            display: 'flex',
            padding: '80px 80px 0',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <svg
            id="white-logo"
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
          {type ? (
            <div
              id="type-label"
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
              {type}
            </div>
          ) : null}
        </div>
        <div
          id="second-row"
          style={{
            flex: 1,
            padding: '80px 80px 80px',
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
    </div>
  )
}

const interSemiBold = fetch(
  new URL('../../../public/assets/blog/font/Inter-SemiBold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())
const interExtraBold = fetch(
  new URL('../../../public/assets/blog/font/Inter-ExtraBold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export async function GET (req: NextRequest) {
  const interSemiBoldData = await interSemiBold
  const interExtraBoldData = await interExtraBold

  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.has('title') ? searchParams.get('title') || '' : ''
    const type = searchParams.get('type') || undefined

    if (title?.length > 100) {
      return new Response(
        JSON.stringify({
          code: 'INVALID_PARAMS',
          message: 'Param title too long',
        }),
        { status: 400 }
      )
    }

    return new ImageResponse(<HeroImage title={title} type={type} />, {
      width: 1200,
      height: 630,
      emoji: 'twemoji',
      fonts: [
        {
          name: 'Inter',
          data: interSemiBoldData,
          style: 'normal',
          weight: 600,
        },
        {
          name: 'Inter',
          data: interExtraBoldData,
          style: 'normal',
          weight: 800,
        },
      ],
    })
  } catch (e: any) {
    return new Response(`Failed to generate hero image`, {
      status: 500,
    })
  }
}

export const runtime = 'edge'
