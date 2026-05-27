'use client'

import { useEffect } from 'react'

export default function PWAUpdater() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    let reloaded = false
    const onControllerChange = () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      reg.update().catch(() => {})
      const interval = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
      return () => clearInterval(interval)
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
