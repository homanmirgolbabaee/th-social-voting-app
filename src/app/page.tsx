'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import VoteButton from '@/components/VoteButton'

interface User {
  id: string
  email?: string
}

interface Page {
  id: string
  message: string
  vote_count: number
  creator_id: string
  creator_username?: string
  title: string
  created_at: string
}

function HomePage() {
  const [pages, setPages] = useState<Page[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  // Auth effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Auth error:', error)
        setUser(null)
      } finally {
        setInitialLoad(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Data fetching effect
  useEffect(() => {
    let mounted = true

    const fetchPages = async () => {
      try {
        setLoading(true)
        const { data, error: pagesError } = await supabase
          .from('pages')
          .select('*')
          .order('vote_count', { ascending: false })

        if (pagesError) throw pagesError
        if (!mounted) return

        if (!data) {
          setPages([])
          return
        }

        const creatorIds = [...new Set(data.map(page => page.creator_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', creatorIds)

        const usernameMap: Record<string, string> = (profiles || []).reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile.username
        }), {})

        const pagesWithUsernames = data.map(page => ({
          ...page,
          creator_username: usernameMap[page.creator_id] || 'Anonymous'
        }))

        if (mounted) {
          setPages(pagesWithUsernames)
        }
      } catch (err) {
        console.error('Error fetching pages:', err)
        if (mounted) {
          setError('Failed to load pages')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchPages()

    // Set up realtime subscription
    const subscription = supabase
      .channel('public:pages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pages' },
        fetchPages
      )
      .subscribe()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
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
              providers={['discord', 'github', 'google']}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Leaderboard
          </h2>
          <p className="text-[#888888] mt-1">
            Discover and upvote the best community messages
          </p>
        </div>
        
        <Link
          href="/create"
          className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl
                   hover:bg-[#FF8534] transition-all duration-200
                   shadow-lg shadow-[#FF6B00]/20 font-medium"
        >
          Share Message
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1A1A1A]/90 rounded-xl p-6 border border-[#333333] relative overflow-hidden"
            >
              <div className="h-6 bg-[#333333] rounded w-3/4 mb-4" />
              <div className="h-4 bg-[#333333] rounded w-1/4" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffffff08] to-transparent" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
        {pages.map((page, index) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-6 border border-[#333333]
                        hover:border-[#FF6B00]/30 transition-all duration-200"
          >
            <div className="flex items-start gap-6 pointer-events-none">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-[#FF6B00]">
                  #{index + 1}
                </span>
              </div>

              <div className="flex-1 pointer-events-auto">
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

              <div className="pointer-events-auto">
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
        </div>
      )}
    </div>
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

export default HomePage