import React from 'react'
import '../styles/globals.css'

export default function Layout ({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>Keystone + Next.js</title>
        <meta
          name="description"
          content="Example to use Keystone APIs in a Next.js server environment."
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="container">
          <div
            style={{
              padding: '0 2rem',
            }}
          >
            <main style={{ display: 'flex', justifyContent: 'center' }}>{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
