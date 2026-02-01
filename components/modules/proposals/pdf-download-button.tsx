'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface PDFDownloadButtonProps {
    data: any
    fileName: string
}

export function PDFDownloadButton({ data, fileName }: PDFDownloadButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('PDF download failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleDownload} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Hazırlanıyor..." : "PDF İndir"}
        </Button>
    );
}
