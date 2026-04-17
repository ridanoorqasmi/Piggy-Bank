"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

/**
 * Minimal, opt-in PWA install affordance.
 *
 * - Captures the `beforeinstallprompt` event instead of letting the browser
 *   suppress its default mini-infobar, so users can actually install.
 * - Hidden by default: only renders when Chrome says the app is installable
 *   AND the app is not already running as a PWA AND the user hasn't dismissed
 *   this session.
 * - Does NOT auto-prompt. Does NOT change routing, layout flow, or logic.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "pwa-install-dismissed"

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    if (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      return
    }

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setHidden(true)
        return
      }
    } catch {}

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setHidden(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (!deferred || hidden) return null

  async function handleInstall() {
    if (!deferred) return
    try {
      await deferred.prompt()
      await deferred.userChoice
    } catch {}
    setDeferred(null)
  }

  function handleDismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {}
    setHidden(true)
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Install Piggy Bank"
    >
      <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-full border border-border bg-card/95 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur">
        <button
          type="button"
          onClick={handleInstall}
          className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="size-3.5" />
          Install app
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
