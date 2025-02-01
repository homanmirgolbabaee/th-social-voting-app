import './globals.css'
import AuthButton from '@/components/AuthButton'
import GridBackground from '@/components/GridBackground'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] min-h-screen relative overflow-x-hidden">
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
      </body>
    </html>
  )
}