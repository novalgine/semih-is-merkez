'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setShowPrompt(false)
        }
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-card border rounded-lg p-4 shadow-lg z-50 md:max-w-md md:left-auto md:right-4 animate-in slide-in-from-bottom-5">
            <button
                onClick={() => setShowPrompt(false)}
                className="absolute top-2 right-2 p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Kapat"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">Ana Ekrana Ekle</h3>
                    <p className="text-sm text-muted-foreground">
                        Fennix OS'u telefonunuza yükleyin ve offline kullanın!
                    </p>
                    <Button onClick={handleInstall} className="w-full mt-2" size="sm">
                        Yükle
                    </Button>
                </div>
            </div>
        </div>
    )
}
