import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Salary Box PWA',
  description: 'Employee management and location tracking app',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Salary Box</h1>
              <nav className="flex space-x-4">
                <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </a>
                <a href="/employees" className="text-sm font-medium hover:text-primary transition-colors">
                  Employees
                </a>
                <a href="/locations" className="text-sm font-medium hover:text-primary transition-colors">
                  Locations
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 pb-20">
          {children}
        </main>
      </body>
    </html>
  )
}
