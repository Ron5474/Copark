export const metadata = {
  title: 'CoPark Enforcement',
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
