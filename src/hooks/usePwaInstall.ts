import { useEffect, useState } from 'react'

// `beforeinstallprompt` is not in the standard DOM lib types.
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

/**
 * Captures the deferred `beforeinstallprompt` event so the host UI can show a
 * custom Install button at a moment of its choosing (web.dev guidance).
 * `canInstall` is false on browsers without the event (e.g. iOS Safari) and
 * once the app has been installed.
 */
export function usePwaInstall(): { canInstall: boolean; promptInstall: () => Promise<void> } {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    function onInstalled() {
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function promptInstall(): Promise<void> {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null) // the prompt can only be used once
  }

  return { canInstall: deferred !== null, promptInstall }
}
