'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner} from '@/components/LoadingSpinner'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function Home() {
  const [pages, setPages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchPages()
      } else {
        setLoading(false)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchPages()
        }
      })

      return () => subscription.unsubscribe()
    }

    setupAuth()
  }, [])

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('vote_count', { ascending: false })
      
      if (!error && data) {
        setPages(data)
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial loading state
  if (!user && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#888888]"
        >
          Loading
        </motion.p>
      </div>
    )
  }

  // Not authenticated
  // In page.tsx, update the not authenticated return:
  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-[#1A1A1A] backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-[#333333]/50">
            <div className="mb-8 text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">Welcome to Social Voting</h1>
              <p className="text-gray-400 text-sm">Share and discover the best community messages</p>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#FF6B00',
                      brandAccent: '#FF8534',
                      defaultButtonBackground: '#2A2A2A',
                      defaultButtonBackgroundHover: '#333333',
                      inputBackground: '#1A1A1A',
                      inputBorder: '#333333',
                      inputBorderFocus: '#FF6B00',
                      inputBorderHover: '#404040',
                      inputText: 'white',
                      inputPlaceholder: '#666666',
                    }
                  }
                },
                style: {
                  container: { width: '100%' },
                  button: {
                    height: '44px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  },
                  input: {
                    height: '44px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#FF6B00' },
                    '&:focus': {
                      boxShadow: '0 0 0 2px rgba(255, 107, 0, 0.2)',
                    }
                  },
                  label: {
                    fontSize: '14px',
                    color: '#e5e7eb',
                    marginBottom: '6px',
                  },
                  divider: {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                  anchor: {
                    color: '#FF6B00',
                    fontSize: '14px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }
                },
              }}
              providers={['github', 'google']}
              redirectTo={window.location.origin}
              providerScopes={{
                google: 'email profile',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-white"
            >
              Leaderboard
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              className="text-[#888888] mt-1"
            >
              Discover and upvote the best community messages
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/create"
              className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl
                       hover:bg-[#FF8534] transition-all duration-200
                       shadow-lg shadow-[#FF6B00]/20 font-medium"
            >
              Share Message
            </Link>
          </motion.div>
        </motion.div>

        {/* Content Section */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1A1A1A]/90 rounded-xl p-6 border border-[#333333] relative overflow-hidden"
              >
                <div className="h-6 bg-[#333333] rounded w-3/4 mb-4" />
                <div className="h-4 bg-[#333333] rounded w-1/4" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffffff08] to-transparent"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-4"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {pages.map((page, index) => (
              <motion.div
                key={page.page_id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                className="group bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-6 border border-[#333333]
                         hover:border-[#FF6B00]/30 transition-all duration-200"
              >
                <div className="flex items-start gap-6">
                  {/* Rank Number */}
                  <motion.div 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-3xl font-bold text-[#FF6B00]">
                      #{index + 1}
                    </span>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#FF6B00] transition-colors">
                      {page.message}
                    </h3>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="flex items-center gap-2 text-[#888888]">
                        <UserIcon className="w-4 h-4" />
                        {page.creator_username}
                      </span>
                      <span className="flex items-center gap-2 text-[#888888]">
                        <UpvoteIcon className="w-4 h-4" />
                        {page.vote_count} votes
                      </span>
                    </div>
                  </div>

                  {/* Upvote Button */}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full bg-[#333333] hover:bg-[#FF6B00]/20 
                             transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <UpvoteIcon className="w-5 h-5 text-[#FF6B00]" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Icons
const UserIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
    />
  </svg>
)

const UpvoteIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 15l7-7 7 7" 
    />
  </svg>
)