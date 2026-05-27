'use client'
import { useState, useLayoutEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile ?? false
}