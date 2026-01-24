"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
}

export function AiChat({ customerId, customerName }: { customerId: string, customerName: string }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            content: `Merhaba Semih, ben ${customerName} için asistanınım. Bu müşteriyle ilgili ne bilmek istersin?`
        }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    async function handleSend() {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content, customerId })
            })

            if (!res.ok) {
                let errorMsg = 'Failed to fetch';
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.error || errorMsg;
                    console.error("Server Error Data:", errorData);
                } catch (e) {
                    console.error("Could not parse error JSON");
                }
                throw new Error(errorMsg);
            }

            const data = await res.json()

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: data.response
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (error: any) {
            console.error("Chat Error:", error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: `Hata: ${error.message || "Bir sorun oluştu."}`
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="flex h-[600px] flex-col">
            <CardHeader className="border-b px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Asistan
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <Avatar className="h-8 w-8 border">
                                    {msg.role === 'ai' ? (
                                        <>
                                            <AvatarImage src="/bot-avatar.png" />
                                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                                        </>
                                    ) : (
                                        <>
                                            <AvatarImage src="/user-avatar.png" />
                                            <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" style={{ animationDelay: '0ms' }} />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" style={{ animationDelay: '150ms' }} />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex w-full items-center gap-2"
                >
                    <Input
                        placeholder="Müşteri hakkında bir şey sor..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Gönder</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
