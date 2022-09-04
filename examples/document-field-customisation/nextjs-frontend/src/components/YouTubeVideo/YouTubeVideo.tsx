import React from 'react';
import styles from './YouTubeVideo.module.css';

type YouTubeVideoProps = {
  url: string;
  altText: string;
};

export function YouTubeVideo({ url, altText = 'Embedded YouTube video' }: YouTubeVideoProps) {
  const embedId = getYouTubeEmbedId(url);

  return (
    <div className={styles.youtubeVideo}>
      <div className={styles.iframePosition}>
        <iframe
          width="100%"
          height="480"
          src={`https://www.youtube.com/embed/${embedId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={altText}
        />
      </div>
    </div>
  );
}

function getYouTubeEmbedId(url: string) {
  let embedId = '';
  const parsedUrl = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (parsedUrl[2] !== undefined) {
    const parsedId = parsedUrl[2].split(/[^0-9a-z_\-]/i);
    embedId = parsedId[0];
  } else {
    embedId = url;
  }
  return embedId;
}
