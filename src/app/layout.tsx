import './globals.css'
import AuthButton from '@/components/AuthButton'
import GridBackground from '@/components/GridBackground'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] min-h-screen relative overflow-x-hidden">
        <AuthProvider>
          <GridBackground />
          <nav className="bg-[#1A1A1A]/50 backdrop-blur-sm border-b border-[#333333]/50 px-4 py-3">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#FF8534] hover:from-[#FF8534] hover:to-[#FF6B00] transition-all duration-300">
                Social Voting App
              </h1>
              <AuthButton />
            </div>
          </nav>
          <main className="max-w-5xl mx-auto p-4 mt-4">
            {children}
          </main>
          <Toaster 
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                border: '1px solid #333333',
                color: 'white',
                paddingInline: '16px',
                backdropFilter: 'blur(8px)',
              },
              className: 'text-sm font-medium',
              duration: 2000,
              style: {
                background: "rgba(26, 26, 26, 0.9)",
                border: "1px solid #333333",
                backdropFilter: "blur(8px)",
                color: "white",
                minWidth: "300px",
                textAlign: "center"
              }
            }}
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  )
}