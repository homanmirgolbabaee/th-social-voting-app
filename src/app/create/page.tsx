'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function CreatePage() {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('You must be logged in to create a message')
        }

        const { data, error: insertError } = await supabase
          .from('pages')
          .insert([{
            message: message.trim(),
            creator_id: session.user.id,
            vote_count: 0,
            title: message.trim().substring(0, 50),
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (insertError) {
          console.error('Insert error:', insertError)
          throw new Error(insertError.message)
        }

        if (data) {
          router.push('/')
        }
      } catch (err) {
        console.error('Error creating page:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Share Message</h1>
          <p className="text-[#888888] mt-1">
            Share your message with the community
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl p-6 border border-[#333333]">
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="message" 
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-white 
                           placeholder-[#666666] focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]
                           transition-colors"
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl 
                           hover:bg-[#FF8534] transition-all duration-200
                           shadow-lg shadow-[#FF6B00]/20 font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Share Message'
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    )
}