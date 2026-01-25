'use client'

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 p-8">
                <div className="text-8xl">📡</div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Çevrimdışısınız</h1>
                    <p className="text-muted-foreground text-lg">
                        İnternet bağlantınızı kontrol edin
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Yeniden Dene
                </button>
            </div>
        </div>
    )
}
