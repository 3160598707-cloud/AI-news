'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  justify?: 'center' | 'start' | 'end'
}

export default function BlurText({ text, className = '', delay = 0, justify = 'center' }: BlurTextProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVisible(true), delay * 1000)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  const words = text.split(' ')

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: justify === 'center' ? 'center' : justify === 'end' ? 'flex-end' : 'flex-start',
        rowGap: '0.1em',
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={
            visible
              ? {
                  filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 0.7,
            delay: i * 0.08,
            times: [0, 0.5, 1],
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  )
}
