'use client'
import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className="w-8 h-8 border-2 border-[#333333] border-t-[#FF6B00] rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-[#FF6B00] rounded-full"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: dot * 0.2
          }}
        />
      ))}
    </div>
  )
}