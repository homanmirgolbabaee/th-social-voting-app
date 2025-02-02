'use client'

import React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import VoteButton from '@/components/VoteButton'
import Link from 'next/link'
import { toast } from 'sonner'

interface PageContent {
  id: string
  message: string
  creator_id: string
  vote_count: number
  title: string
  created_at: string
  creator_username?: string
}


function PageContent({ id }: { id: string }) {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rank, setRank] = useState<number | null>(null)

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()

      if (pageError) throw pageError

      if (!pageData) {
        throw new Error('Page not found')
      }

      // Fetch the creator's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', pageData.creator_id)
        .single()

      if (profileError) throw profileError

      // Fetch all pages to determine rank
      const { data: allPages, error: rankError } = await supabase
        .from('pages')
        .select('id, vote_count')
        .order('vote_count', { ascending: false })

      if (rankError) throw rankError

      const pageRank = allPages?.findIndex(p => p.id === id) ?? -1

      setPage({
        ...pageData,
        creator_username: profileData?.username || 'Anonymous'
      })
      setRank(pageRank + 1)
    } catch (error) {
      console.error('Error fetching page:', error)
      setError(error instanceof Error ? error.message : 'Failed to load page')
    } finally {
      setLoading(false)
    }
  }, [id])


  useEffect(() => {
    fetchPage()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`page:${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pages', filter: `id=eq.${id}` },
        () => fetchPage() // Removed unused payload parameter
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [id, fetchPage]) 

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch (err) {  // Changed error to err to avoid name conflict
      toast.error('Failed to copy link')
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }


  if (error || !page) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto mt-8 text-center"
      >
        <div className="bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-8 border border-[#333333]">
          <p className="text-red-400 mb-4">{error || 'Page not found'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#FF6B00] text-white rounded-xl
                   hover:bg-[#FF8534] transition-all duration-200"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    )
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-8 border border-[#333333]">
        <AnimatePresence mode="wait">

        {/* Navigation and Rank Badge Row */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[#888888] hover:text-[#FF6B00] transition-colors"
          >
            <BackIcon className="w-4 h-4" />
            <span>Back to Explore</span>
          </Link>   

          {rank !== null && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-6"
            >
              <span className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full text-sm">
                Rank #{rank}
              </span>
            </motion.div>
          )}

    
        </div>
        </AnimatePresence>

        <div className="flex items-start justify-between">
          <div className="flex-1 pointer-events-auto">
            
            <h1 className="text-2xl font-bold text-white mb-4">{page.message}</h1>
            <div className="flex items-center gap-4 text-[#888888]">
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {page.creator_username}
              </span>
              <span className="flex items-center gap-2">
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
                if (page) {
                  setPage({ ...page, vote_count: newCount })
                }
              }}
            />
        </div>
      </div>
        <div className="mt-8 pt-6 border-t border-[#333333]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="w-full px-4 py-3 bg-[#333333] text-white rounded-lg
                     hover:bg-[#404040] transition-all duration-200
                     flex items-center justify-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share this message
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      }
    >
      <PageContent id={id} />
    </Suspense>
  )
}

// Your existing Icon components remain the same...


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

  const ShareIcon = ({ className }: { className?: string }) => (
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
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
  
  const BackIcon = ({ className }: { className?: string }) => (
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
      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
    />
  </svg>
)