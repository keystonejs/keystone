type YouTubeEmbedProps = {
  url: string
  label: string
}

export function YouTubeEmbed ({ url, label }: YouTubeEmbedProps) {
  return (
    <div
      style={{
        position: 'relative',
        paddingBottom: '56.25%',
        height: '0',
      }}
    >
      <iframe
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
        }}
        width="560"
        height="315"
        src={url}
        title={label}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
