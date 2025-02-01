import React from 'react';
import { motion } from 'framer-motion';
import VoteButton from './VoteButton';
import { Page } from '@/types/database';
import Link from 'next/link';

interface Props {
  pages: Page[];
  onVoteChange: (pageId: string, newCount: number) => void;
}

const LeaderboardItem = ({ page, rank, onVoteChange }: { 
  page: Page; 
  rank: number;
  onVoteChange: (pageId: string, newCount: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-6 border border-[#333333]
                hover:border-[#FF6B00]/30 transition-all duration-200"
    >
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-[#FF6B00]">
            #{rank}
          </span>
        </div>

        <div className="flex-1">
          <Link href={`/page/${page.id}`} className="block">
            <h3 className="text-xl font-semibold text-white group-hover:text-[#FF6B00] transition-colors">
              {page.title}
            </h3>
            <p className="text-[#888888] mt-2 line-clamp-2">
              {page.message}
            </p>
          </Link>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <VoteButton
            pageId={page.id}
            initialVoteCount={page.vote_count}
            onVoteChange={(newCount) => onVoteChange(page.id, newCount)}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function LeaderboardList({ pages, onVoteChange }: Props) {
  return (
    <motion.div 
      className="grid gap-4"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      initial="hidden"
      animate="show"
    >
      {pages.map((page, index) => (
        <LeaderboardItem 
          key={page.id}
          page={page}
          rank={index + 1}
          onVoteChange={onVoteChange}
        />
      ))}
    </motion.div>
  );
}