// In AuthButton.tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingDots } from './LoadingSpinner'
import { motion } from 'framer-motion'
import UserMenu from './UserMenu'

export default function AuthButton() {
  const { user, isLoading } = useAuth() // Remove signOut since it's in UserMenu now

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
        <UserMenu />
      </motion.div>
    )
  }

  return null
}