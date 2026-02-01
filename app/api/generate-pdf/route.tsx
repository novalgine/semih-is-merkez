import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ProposalDocument } from '@/components/modules/proposals/proposal-document';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Render PDF to buffer on the server
        const pdfBuffer = await renderToBuffer(<ProposalDocument data={data} />);

        // Convert Buffer to Blob for NextResponse
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

        // Return PDF as downloadable file
        return new NextResponse(pdfBlob, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Teklif-${data.projectTitle || 'Document'}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
    }
}
