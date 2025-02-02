// In AuthButton.tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingDots } from './LoadingSpinner'
import { motion } from 'framer-motion'

export default function AuthButton() {
  const { user, isLoading, signOut } = useAuth()

  if (isLoading) {
    return <LoadingDots />
  }

  if (user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4"
      >
        <span className="text-gray-300">
          {user.displayName}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={signOut}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#252525] 
                   transition-colors border border-[#333333] hover:border-[#FF6B00]"
        >
          Sign Out
        </motion.button>
      </motion.div>
    )
  }

  return null
}