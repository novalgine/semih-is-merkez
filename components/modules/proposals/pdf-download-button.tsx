'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import dynamic from "next/dynamic"
import { ProposalDocument } from "./proposal-document"

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false }
)

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
