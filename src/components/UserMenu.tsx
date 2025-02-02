'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { LoadingSpinner } from './LoadingSpinner'

interface Profile {
  username: string
  created_at: string
  avatar_url?: string
  updated_at: string
}

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user || loading) return <LoadingSpinner />

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#252525] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-medium">
          {profile?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="text-gray-300">{profile?.username}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed w-64 rounded-xl bg-[#1A1A1A] border border-[#333333] shadow-xl"
                style={{
                    position: 'fixed',
                    top: '50px', // Adjusted to match your screenshot positioning
                    right: '16px',
                    zIndex: 99999,
                    backgroundColor: 'rgba(26, 26, 26, 0.95)', // Slightly transparent background
                    backdropFilter: 'blur(8px)',
                }}
                >
                {/* Profile Header */}
                <div className="p-4 border-b border-[#333333]">
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xl font-medium">
                        <span className="mt-0.5">{profile?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{profile?.username}</h3>
                        <p className="text-sm text-gray-400">
                        Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                        </p>
                    </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    <Link 
                    href="/profile"
                    className="flex items-center gap-2 p-2 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                    >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-[15px]">My Profile</span>
                    </Link>
                    <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 p-2 text-gray-300 hover:bg-[#252525] rounded-lg transition-colors mt-1"
                    >
                    <LogoutIcon className="w-4 h-4" />
                    <span className="text-[15px]">Sign Out</span>
                    </button>
                </div>
                </motion.div>
        )}
      </AnimatePresence>
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

const LogoutIcon = ({ className }: { className?: string }) => (
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
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
    />
  </svg>
)