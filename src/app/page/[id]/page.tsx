'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import VoteButton from '@/components/VoteButton'
import Link from 'next/link'

export default function Page({ params }: { params: { id: string } }) {
    const [page, setPage] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rank, setRank] = useState<number | null>(null)

  useEffect(() => {
    fetchPage()
  }, [params.id])

  const fetchPage = async () => {
    try {
      // Fetch the specific page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', params.id)
        .single()

      if (pageError) throw pageError

      if (pageData) {
        // Fetch the creator's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', pageData.creator_id)
          .single()

        // Fetch all pages to determine rank
        const { data: allPages } = await supabase
          .from('pages')
          .select('id, vote_count')
          .order('vote_count', { ascending: false })

        const pageRank = allPages?.findIndex(p => p.id === params.id) ?? -1

        setPage({
          ...pageData,
          creator_username: profileData?.username || 'Anonymous'
        })
        setRank(pageRank + 1)
      }
    } catch (err) {
      console.error('Error fetching page:', err)
      setError('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => alert('Failed to copy link'))
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
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-red-400">{error || 'Page not found'}</p>
        <Link href="/" className="text-[#FF6B00] hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-8 border border-[#333333]">
        {/* Rank Badge */}
        {rank !== null && (
          <div className="mb-6">
            <span className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full text-sm">
              Rank #{rank}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
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
          
          <VoteButton 
            pageId={page.id} 
            initialVoteCount={page.vote_count}
            onVoteChange={(newCount) => setPage(prev => ({ ...prev, vote_count: newCount }))}
          />
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