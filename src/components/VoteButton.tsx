'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface VoteButtonProps {
  pageId: string
  initialVoteCount: number
  onVoteChange: (newCount: number) => void
}

export default function VoteButton({ pageId, initialVoteCount, onVoteChange }: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [voteCount, setVoteCount] = useState(initialVoteCount)

  useEffect(() => {
    checkUserVote()
  }, [pageId])

  const checkUserVote = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: vote } = await supabase
        .from('votes')
        .select('id')
        .eq('page_id', pageId)
        .eq('user_id', session.user.id)
        .single()

      setHasVoted(!!vote)
    } catch (error) {
      console.error('Error checking vote:', error)
    }
  }

  const handleVote = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please sign in to vote')
        return
      }

      // Optimistic update
      const newCount = hasVoted ? voteCount - 1 : voteCount + 1
      setVoteCount(newCount)
      onVoteChange(newCount)
      setHasVoted(!hasVoted)

      if (hasVoted) {
        // Remove vote
        const { error } = await supabase.rpc('remove_vote', {
          page_id: pageId,
          user_id: session.user.id
        })
        if (error) throw error
      } else {
        // Add vote
        const { error } = await supabase.rpc('add_vote', {
          page_id: pageId,
          user_id: session.user.id
        })
        if (error) throw error
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Revert optimistic update
      setVoteCount(voteCount)
      setHasVoted(!hasVoted)
      onVoteChange(voteCount)
      alert('Failed to vote. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleVote}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 
                ${hasVoted 
                  ? 'bg-[#FF6B00] text-white' 
                  : 'bg-[#333333] hover:bg-[#FF6B00]/20'}`}
    >
      <UpvoteIcon className={`w-5 h-5 ${hasVoted ? 'text-white' : 'text-[#FF6B00]'}`} />
    </motion.button>
  )
}

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