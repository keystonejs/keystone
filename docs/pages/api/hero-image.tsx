import React from 'react';
import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

const HeroImage = ({
  title,
  description,
  type,
}: {
  title: string;
  description?: string;
  type?: string;
}) => {
  let titleFontSize = 96;
  if (title.length > 20) {
    titleFontSize = 80;
  } else if (title.length > 30) {
    titleFontSize = 72;
  } else if (title.length > 100) {
    titleFontSize = 60;
  }

  const shortenedDescription =
    typeof description === 'string' && description?.length > 110
      ? description?.substring(0, 110) + '...'
      : description || '';
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'white',
        backgroundImage: 'linear-gradient(135deg, #1476FF, #00ABDA)',
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '40px 80px',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {type ? (
            <div
              style={{
                fontSize: 32,
                paddingBottom: 8,
                alignSelf: 'flex-start',
              }}
            >
              {type}
            </div>
          ) : null}
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 900,
              paddingTop: 16,
              paddingBottom: 64,
              borderTop: type ? '1px solid white' : '1px solid transparent',
            }}
          >
            {title}
          </div>
          {shortenedDescription ? (
            <div style={{ fontSize: 40, fontWeight: 400, lineHeight: 1.4, letterSpacing: -1 }}>
              {shortenedDescription}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const interRegular = fetch(new URL('../../public/font/Inter-Regular.ttf', import.meta.url)).then(
  res => res.arrayBuffer()
);
const interSemiBold = fetch(new URL('../../public/font/Inter-SemiBold.ttf', import.meta.url)).then(
  res => res.arrayBuffer()
);
const interBold = fetch(new URL('../../public/font/Inter-Bold.ttf', import.meta.url)).then(res =>
  res.arrayBuffer()
);
const interBlack = fetch(new URL('../../public/font/Inter-Black.ttf', import.meta.url)).then(res =>
  res.arrayBuffer()
);

// vercel API route that generates the OG image
export default async function handler(req: NextRequest) {
  const interRegularData = await interRegular;
  const interSemiBoldData = await interSemiBold;
  const interBoldData = await interBold;
  const interBlackData = await interBlack;

  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.has('title') ? searchParams.get('title') || '' : '';
    const description = searchParams.get('description') || undefined;
    const type = searchParams.get('type') || undefined;

    if (title?.length > 100 || (typeof description === 'string' && description?.length > 300)) {
      return new Response(
        JSON.stringify({
          code: 'INVALID_PARAMS',
          message: 'Param title/description too long',
        }),
        { status: 400 }
      );
    }

    return new ImageResponse(<HeroImage title={title} description={description} type={type} />, {
      width: 1200,
      height: 630,
      emoji: 'twemoji',
      fonts: [
        {
          name: 'Inter',
          data: interRegularData,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Inter',
          data: interSemiBoldData,
          style: 'normal',
          weight: 600,
        },
        {
          name: 'Inter',
          data: interBoldData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: interBlackData,
          style: 'normal',
          weight: 900,
        },
      ],
    });
  } catch (e: any) {
    return new Response(`Failed to generate hero image`, {
      status: 500,
    });
  }
}
