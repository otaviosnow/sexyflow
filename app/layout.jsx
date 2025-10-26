import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SexyFlow - Crie Páginas Futurísticas',
  description: 'Editor visual drag & drop, hospedagem inclusa, analytics avançados. Tudo que você precisa para dominar o digital.',
  metadataBase: new URL('https://sexyflow.com.br'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
