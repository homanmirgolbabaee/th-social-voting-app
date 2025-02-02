// src/contexts/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
interface User {
  id: string
  email?: string
  user_metadata?: {
    custom_claims?: { global_name?: string }
    user_name?: string
    full_name?: string
    name?: string
  }
  displayName?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  getDisplayName: (user: User) => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const getDisplayName = (user: User): string => {
    return user.user_metadata?.custom_claims?.global_name || 
           user.user_metadata?.user_name || 
           user.user_metadata?.full_name || 
           user.user_metadata?.name ||
           user.email?.split('@')[0] ||
           'Anonymous User'
  }

  useEffect(() => {
    let mounted = true

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          const displayName = getDisplayName(session.user)
          
          await supabase
            .from('profiles')
            .upsert({ 
              id: session.user.id,
              username: displayName,
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'id'
            })
          
          setUser({
            ...session.user,
            displayName
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth setup error:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    setupAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (session?.user) {
        const displayName = getDisplayName(session.user)
        setUser({
          ...session.user,
          displayName
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // If no session, just clear local state and redirect
        setUser(null)
        router.refresh()
        router.replace('/')
        return
      }
  
      // If we have a session, try to sign out
      const { error } = await supabase.auth.signOut()
      
      if (error && error.message !== 'Auth session missing!') {
        throw error
      }
  
      // Clear state and redirect regardless of error
      setUser(null)
      router.refresh()
      router.replace('/')
  
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear state and redirect even if there's an error
      setUser(null)
      router.refresh()
      router.replace('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, getDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}