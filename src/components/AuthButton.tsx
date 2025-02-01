'use client'
import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { LoadingDots } from './LoadingSpinner'
import { motion } from 'framer-motion'

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


export default function AuthButton() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        if (session?.user) {
          const displayName = getDisplayName(session.user)
          
          const { error } = await supabase
            .from('profiles')
            .upsert({ 
              id: session.user.id,
              username: displayName,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })

          if (error) console.error('Profile update error:', error)
          
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
        if (mounted) setLoading(false)
      }
    }

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && user === undefined) {
        setUser(null)
        setLoading(false)
      }
    }, 3000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

    setupAuth()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])



  const getDisplayName = (user: User): string => {
    return user.user_metadata?.custom_claims?.global_name || 
           user.user_metadata?.user_name || 
           user.user_metadata?.full_name || 
           user.user_metadata?.name ||
           user.email?.split('@')[0] ||
           'Anonymous User'
  }



  if (loading && user === undefined) {
    return <LoadingDots />
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-300">
          {user.displayName}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.reload() // Force reload to clear any cached states
          }}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#252525] 
                   transition-colors border border-[#333333] hover:border-[#FF6B00]"
        >
          Sign Out
        </motion.button>
      </div>
    )
  }

  if (!user) {
    return null // The Auth UI will be handled by page.tsx
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-[#1A1A1A] backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-[#333333]/50">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Welcome to Social Voting</h1>
          <p className="text-gray-400 text-sm">Share and discover the best community messages</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                    brand: '#FF6B00',
                    brandAccent: '#FF8534',
                    defaultButtonBackground: '#2A2A2A',
                    defaultButtonBackgroundHover: '#333333',
                    inputBackground: '#1A1A1A',
                    inputBorder: '#333333',
                    inputBorderFocus: '#FF6B00',
                    inputBorderHover: '#404040',
                    inputText: 'white',
                    inputPlaceholder: '#666666',
                }
              }
            },
              style: {
                container: { width: '100%' },
                button: {
                  height: '44px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }
              },
              input: {
                height: '44px',
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#FF6B00',
                },
                '&:focus': {
                  boxShadow: '0 0 0 2px rgba(255, 107, 0, 0.2)',
                }
              },
              label: {
                fontSize: '14px',
                color: '#e5e7eb',
                marginBottom: '6px',
              },
              divider: {
                background: 'rgba(255, 255, 255, 0.1)',
              },
              anchor: {
                position: 'relative',
                color: '#FF6B00',
                fontSize: '14px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                padding: '2px 4px',
                margin: '-2px -4px',
                borderRadius: '4px',
                '&:hover': {
                  color: '#FF8534',
                  background: 'rgba(255, 107, 0, 0.1)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              },
              message: {
                fontSize: '14px',
                a: {
                  color: '#FF6B00',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#FF8534',
                    textDecoration: 'none',
                    background: 'rgba(255, 107, 0, 0.1)',
                    borderRadius: '4px',
                  }
                }
              }
            },
          }}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Sign in with Socials',
                social_provider_text: 'Continue with',
                link_text: 'Don\'t have an account? Sign up',
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign in',
                social_provider_text: 'Continue with',
                link_text: 'Already have an account? Sign in',
              }
            }
          }}
          
          providers={['discord', 'github', 'google']}
          redirectTo={window.location.origin}
          providerScopes={{
            google: 'email profile',
          }}
        />

        {/* Custom hover styles */}
        <style jsx global>{`
          .supabase-auth-ui_ui-anchor {
            position: relative;
            transition: all 0.2s ease !important;
          }
          
          .supabase-auth-ui_ui-anchor:hover {
            color: #FF8534 !important;
            background: rgba(255, 107, 0, 0.1) !important;
            border-radius: 4px !important;
            padding: 2px 4px !important;
            margin: -2px -4px !important;
          }

          .supabase-auth-ui_ui-anchor:active {
            transform: translateY(1px) !important;
          }

          /* Custom provider button styles */
          .supabase-auth-ui_ui-button[data-provider="google"] {
            background: #fff !important;
            color: #1A1A1A !important;
            border: 1px solid #e2e8f0 !important;
          }

          .supabase-auth-ui_ui-button[data-provider="google"]:hover {
            background: #f8fafc !important;
            border-color: #FF6B00 !important;
          }
        `}</style>
      </div>
    </div>
</div>
  )
}