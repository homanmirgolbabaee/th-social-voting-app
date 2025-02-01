import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface VoteButtonProps {
  pageId: string;
  initialVoteCount: number;
  onVoteChange?: (newCount: number) => void;
}

const VoteButton = ({ pageId, initialVoteCount, onVoteChange }: VoteButtonProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUserVote();
  }, [pageId]);

  const checkUserVote = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: vote } = await supabase
        .from('votes')
        .select('id')
        .eq('page_id', pageId)
        .eq('user_id', session.user.id)
        .single();

      setHasVoted(!!vote);
    } catch (error) {
      console.error('Error checking vote:', error);
    }
  };

  const handleVote = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please sign in to vote');
        return;
      }

      if (hasVoted) {
        // Remove vote and update count
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .match({ 
            page_id: pageId,
            user_id: session.user.id 
          });

        if (deleteError) throw deleteError;

        const { error: updateError } = await supabase
          .from('pages')
          .update({ vote_count: voteCount - 1 })
          .eq('id', pageId);

        if (updateError) throw updateError;
        
        setVoteCount(prev => prev - 1);
        setHasVoted(false);
        if (onVoteChange) onVoteChange(voteCount - 1);
      } else {
        // Add vote and update count
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            page_id: pageId,
            user_id: session.user.id
          });

        if (insertError) throw insertError;

        const { error: updateError } = await supabase
          .from('pages')
          .update({ vote_count: voteCount + 1 })
          .eq('id', pageId);

        if (updateError) throw updateError;
        
        setVoteCount(prev => prev + 1);
        setHasVoted(true);
        if (onVoteChange) onVoteChange(voteCount + 1);
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleVote}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 
                ${hasVoted 
                  ? 'bg-[#FF6B00] text-white' 
                  : 'bg-[#333333] hover:bg-[#FF6B00]/20'}`}
    >
      <UpvoteIcon className={`w-5 h-5 ${hasVoted ? 'text-white' : 'text-[#FF6B00]'}`} />
    </motion.button>
  );
};

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
);

export default VoteButton;