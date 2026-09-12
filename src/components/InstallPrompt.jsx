import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (standalone) {
      setInstalled(true)
      return undefined
    }

    const onPrompt = (event) => {
      event.preventDefault()
      setDeferred(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    const isSafari = /safari/i.test(window.navigator.userAgent) && !/crios|fxios/i.test(window.navigator.userAgent)
    if (isIos && isSafari) setIosHint(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  async function handleInstall() {
    if (!deferred) {
      setIosHint(true)
      return
    }
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handleInstall} className="btn-brutal btn-brutal-sm">
        Pasang di HP
      </button>
      {iosHint && !deferred && (
        <span className="caption-brutal hidden max-w-[12rem] sm:inline">
          iPhone: Share → Add to Home Screen
        </span>
      )}
    </div>
  )
}
