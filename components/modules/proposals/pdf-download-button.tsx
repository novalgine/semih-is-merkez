'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { PDFDownloadLink } from "@/components/ui/pdf-shim"
import { ProposalDocument } from "./proposal-document"

interface PDFDownloadButtonProps {
    data: any
    fileName: string
}

export function PDFDownloadButton({ data, fileName }: PDFDownloadButtonProps) {
    return (
        <PDFDownloadLink document={<ProposalDocument data={data} />} fileName={fileName}>
            {/* @ts-ignore */}
            {({ loading }) => (
                <Button disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Hazırlanıyor..." : "PDF İndir"}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
