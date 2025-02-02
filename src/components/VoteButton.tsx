'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface VoteButtonProps {
  pageId: string
  initialVoteCount: number
  onVoteChange: (newCount: number) => void
  showCount?: boolean
}

export default function VoteButton({
  pageId,
  initialVoteCount,
  onVoteChange,
  showCount = true
}: VoteButtonProps) {
  const { user } = useAuth()
  const [isVoted, setIsVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to fetch accurate vote count with debounce
  const fetchAccurateVoteCount = useCallback(async () => {
    try {
      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('page_id', pageId)

      const newCount = count || 0
      
      // Only update if count has changed
      if (newCount !== voteCount) {
        setVoteCount(newCount)
        onVoteChange(newCount)

        // Update page vote count if it's different
        const { data: pageData } = await supabase
          .from('pages')
          .select('vote_count')
          .eq('id', pageId)
          .single()

        if (pageData && pageData.vote_count !== newCount) {
          await supabase
            .from('pages')
            .update({ vote_count: newCount })
            .eq('id', pageId)
        }
      }
    } catch (error) {
      console.error('Error fetching vote count:', error)
    }
  }, [pageId, onVoteChange, voteCount])

  // Function to check user's vote status with retry
  const checkVoteStatus = useCallback(async () => {
    if (!user?.id) {
      setIsVoted(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('page_id')
        .eq('page_id', pageId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      setIsVoted(!!data)
    } catch (error) {
      console.error('Error checking vote status:', error)
      setIsVoted(false)
    }
  }, [user?.id, pageId])

  // Initialize component state
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (!isMounted) return

      try {
        await checkVoteStatus()
        await fetchAccurateVoteCount()
        setIsInitialized(true)
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [checkVoteStatus, fetchAccurateVoteCount])

  // Subscribe to real-time vote changes with debounce
  useEffect(() => {
    if (!pageId) return

    let debounceTimer: NodeJS.Timeout

    const channel = supabase
      .channel(`page-votes:${pageId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes',
          filter: `page_id=eq.${pageId}`
        }, 
        () => {
          // Debounce the update calls
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            fetchAccurateVoteCount()
            if (user?.id) {
              checkVoteStatus()
            }
          }, 500) // Wait 500ms before updating
        }
      )
      .subscribe()

    return () => {
      clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [pageId, user?.id, fetchAccurateVoteCount, checkVoteStatus])

  // Handle user session changes
  useEffect(() => {
    if (isInitialized && user?.id) {
      checkVoteStatus()
    }
  }, [user?.id, checkVoteStatus, isInitialized])

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user?.id) {
      toast.error('Please sign in to vote')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    const previousVoteStatus = isVoted
    const previousCount = voteCount

    try {
      if (!isVoted) {
        // Add vote
        const { error: voteError } = await supabase
          .from('votes')
          .insert({
            page_id: pageId,
            user_id: user.id
          })

        if (voteError) throw voteError
        setIsVoted(true)
        
      } else {
        // Remove vote
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('page_id', pageId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
        setIsVoted(false)
      }

      // Update vote count once
      await fetchAccurateVoteCount()
      toast.success(isVoted ? 'Vote removed' : 'Vote added')

    } catch (error) {
      console.error('Vote error:', error)
      toast.error('Failed to update vote')
      
      // Revert optimistic updates
      setIsVoted(previousVoteStatus)
      setVoteCount(previousCount)
      onVoteChange(previousCount)
      
    } finally {
      setIsLoading(false)
    }
  }

  // Rest of the component remains the same...
  if (!isInitialized) {
    return (
      <div className="p-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-[#333333] border-t-[#FF6B00] rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleVote}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-lg flex items-center gap-2
        ${isVoted 
          ? 'bg-[#FF6B00] text-white hover:bg-[#FF8534]' 
          : 'bg-[#2A2A2A] hover:bg-[#333333] text-white border border-[#333333] hover:border-[#FF6B00]'
        }
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[64px] justify-center
      `}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
        />
      ) : (
        <>
          <motion.div
            initial={false}
            animate={{ scale: isVoted ? 1.1 : 1 }}
            className="relative"
          >
            <svg
              viewBox="0 0 24 24"
              fill={isVoted ? "currentColor" : "none"}
              stroke="currentColor"
              className={`w-5 h-5 ${isVoted ? 'text-white' : 'text-[#FF6B00]'}`}
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.div>
          {showCount && (
            <span className="font-medium">
              {voteCount}
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}