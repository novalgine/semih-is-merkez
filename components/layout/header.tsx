'use client'

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    Home,
    Users,
    FileText,
    Video,
    BookOpen,
    Menu,
    Search,
    CircleUser,
    Loader2,
    Package,
    Wallet
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { globalSearch, SearchResult } from "@/app/actions/search"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const debouncedQuery = useDebounce(query, 300)
    const router = useRouter()
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const data = await globalSearch(debouncedQuery)
                setResults(data)
                setShowResults(true)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        search()
    }, [debouncedQuery])

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSelect = (url: string) => {
        router.push(url)
        setShowResults(false)
        setQuery("")
    }

    const [sheetOpen, setSheetOpen] = useState(false)

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <nav className="grid gap-2 text-lg font-medium">
                        <Link
                            href="#"
                            className="flex items-center gap-2 text-lg font-semibold"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Video className="h-6 w-6" />
                            <span className="sr-only">SEMİH İŞ MERKEZİ</span>
                        </Link>
                        <Link
                            href="/"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Home className="h-5 w-5" />
                            Dashboard
                        </Link>
                        <Link
                            href="/customers"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Users className="h-5 w-5" />
                            Müşteriler
                        </Link>
                        <Link
                            href="/proposals"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <FileText className="h-5 w-5" />
                            Teklifler
                        </Link>
                        <Link
                            href="/shoots"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Video className="h-5 w-5" />
                            Çekimler
                        </Link>
                        <Link
                            href="/daily"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <BookOpen className="h-5 w-5" />
                            Günlük
                        </Link>
                        <Link
                            href="/services"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Package className="h-5 w-5" />
                            Hizmetler
                        </Link>
                        <Link
                            href="/finance"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Wallet className="h-5 w-5" />
                            Finans
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1 relative" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Müşteri, çekim veya teklif ara..."
                        className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            if (e.target.value.length >= 2) setShowResults(true)
                        }}
                        onFocus={() => {
                            if (query.length >= 2) setShowResults(true)
                        }}
                    />
                    {isLoading && (
                        <div className="absolute right-2 top-2.5 md:left-[calc(66.6%-2rem)] lg:left-[calc(33.3%-2rem)]">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && results.length > 0 && (
                    <div className="absolute top-full left-0 w-full md:w-2/3 lg:w-1/3 mt-1 bg-popover text-popover-foreground rounded-md border shadow-md z-50 overflow-hidden">
                        <div className="p-1">
                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result.url)}
                                    className="w-full flex items-center gap-2 p-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-left"
                                >
                                    {result.type === 'customer' && <Users className="h-4 w-4 text-blue-500" />}
                                    {result.type === 'shoot' && <Video className="h-4 w-4 text-purple-500" />}
                                    {result.type === 'proposal' && <FileText className="h-4 w-4 text-orange-500" />}
                                    <div className="flex flex-col">
                                        <span className="font-medium">{result.title}</span>
                                        {result.subtitle && <span className="text-xs text-muted-foreground">{result.subtitle}</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
                    <div className="absolute top-full left-0 w-full md:w-2/3 lg:w-1/3 mt-1 bg-popover text-popover-foreground rounded-md border shadow-md z-50 p-4 text-center text-sm text-muted-foreground">
                        Sonuç bulunamadı.
                    </div>
                )}
            </div>
            <ThemeToggle />
            <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
            </Button>
        </header>
    )
}
