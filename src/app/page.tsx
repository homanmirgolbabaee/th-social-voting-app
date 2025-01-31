'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [pages, setPages] = useState<any[]>([])
  
  useEffect(() => {
    // Fetch pages with vote counts
    const fetchPages = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('vote_count', { ascending: false })
      
      if (!error && data) {
        setPages(data)
      }
    }

    fetchPages()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchPages)
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <Link
          href="/create"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Page
        </Link>
      </div>

      <div className="space-y-4">
        {pages.map((page) => (
          <div key={page.page_id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{page.message}</h3>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
              <span>By {page.creator_username}</span>
              <span>{page.vote_count} votes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}