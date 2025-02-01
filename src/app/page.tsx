'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import VoteButton from '@/components/VoteButton'

export default function Home() {
  const [pages, setPages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setUser(session?.user ?? null)
          await fetchPages()
        }
      } catch (error) {
        console.error('Auth setup error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        await fetchPages()
      }
    })

    setupAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchPages = async () => {
    try {
      console.log('Fetching pages...')
      const { data, error } = await supabase
        .from('pages')
        .select('id, message, vote_count, creator_id, created_at, title')
        .order('vote_count', { ascending: false })

      if (error) {
        console.error('Pages query error:', error)
        setError('Failed to fetch pages')
        return
      }

      if (!data || data.length === 0) {
        setPages([])
        return
      }

      const creatorIds = [...new Set(data.map(page => page.creator_id))]
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', creatorIds)

      if (profilesError) {
        console.error('Profiles query error:', profilesError)
      }

      const usernameMap = (profiles || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile.username
      }), {})

      const pagesWithUsernames = data.map(page => ({
        ...page,
        creator_username: usernameMap[page.creator_id] || 'Anonymous'
      }))

      setPages(pagesWithUsernames)
    } catch (error) {
      console.error('Error in fetchPages:', error)
      setError('An error occurred while fetching pages')
    } finally {
      setLoading(false)
    }
  }

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
                }
              }}
              providers={['github', 'google']}
              redirectTo={window.location.origin}
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`loading-skeleton-${i}`}
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
                key={`page-${page.id}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                className="group bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-6 border border-[#333333]
                        hover:border-[#FF6B00]/30 transition-all duration-200"
              >
                <div className="flex items-start gap-6">
                  <motion.div 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-3xl font-bold text-[#FF6B00]">
                      #{index + 1}
                    </span>
                  </motion.div>

                  <div className="flex-1">
                    <Link href={`/page/${page.id}`} className="block">
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#FF6B00] transition-colors">
                        {page.message}
                      </h3>
                    </Link>
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

                  <div className="opacity-0 group-hover:opacity-100">
                    <VoteButton
                      pageId={page.id}
                      initialVoteCount={page.vote_count}
                      onVoteChange={(newCount) => {
                        const updatedPages = pages.map(p =>
                          p.id === page.id ? { ...p, vote_count: newCount } : p
                        ).sort((a, b) => b.vote_count - a.vote_count)
                        setPages(updatedPages)
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

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