"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TagInputProps {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
}

export function TagInput({ value = [], onChange, placeholder = "Etiket ekle..." }: TagInputProps) {
    const [inputValue, setInputValue] = React.useState("")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag()
        }
    }

    const addTag = () => {
        const tag = inputValue.trim()
        if (tag && !value.includes(tag)) {
            onChange([...value, tag])
            setInputValue("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {value.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-2 py-1 text-sm font-normal">
                        {tag}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => removeTag(tag)}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Kaldır</span>
                        </Button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    Ekle
                </Button>
            </div>
        </div>
    )
}
