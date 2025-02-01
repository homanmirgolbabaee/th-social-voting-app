'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { LoadingDots } from './LoadingSpinner'
import { motion } from 'framer-motion'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <LoadingDots />
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-300">{user.email}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#252525] 
                   transition-colors border border-[#333333] hover:border-[#FF6B00]"
        >
          Sign Out
        </motion.button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#1E1E1E] backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-[#333333]/50">
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
              container: {
                width: '100%'
              },
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
                margin: '-2px -4px', // Offset padding to maintain layout
                borderRadius: '4px',
                '&:hover': {
                  color: '#FF8534',
                  background: 'rgba(255, 107, 0, 0.1)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              },
              // Style the links at the bottom specifically
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
                button_label: 'Continue with email',
                social_provider_text: 'Continue with GitHub',
                link_text: 'Don\'t have an account? Sign up',
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                button_label: 'Continue with email',
                social_provider_text: 'Continue with GitHub',
                link_text: 'Already have an account? Sign in',
              }
            }
          }}
          providers={['github']}
          redirectTo={window.location.origin}
        />

        {/* Add custom styles for the bottom links */}
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
        `}</style>
      </div>
    </div>
  )
}