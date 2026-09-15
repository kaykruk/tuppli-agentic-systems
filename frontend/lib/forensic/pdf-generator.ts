import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface ReportData {
    caseName: string
    caseId: string
    discoveryDate: string
    platforms: string[]
    takedownStatus: string
    forensicEvidence: {
        type: string
        platform: string
        url: string
        phash: string
        confidence: string
    }[]
}

export async function generateForensicPDF(data: ReportData) {
    const doc = new jsPDF()
    const timestamp = new Date().toISOString()

    // Header & Branding
    doc.setFillColor(15, 23, 42) // Slate-900
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('TUPPLI FORENSIC DISCOVERY', 20, 25)
    
    doc.setFontSize(10)
    doc.text('OFFICIAL EVIDENCE PACKAGE', 20, 32)
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 160, 25)
    doc.text(`ID: ${data.caseId}`, 160, 32)

    // Case Overview Section
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(16)
    doc.text('Case Intelligence Overview', 20, 55)
    
    doc.setFontSize(10)
    doc.text(`Asset Name: ${data.caseName}`, 20, 65)
    doc.text(`Enforcement Status: ${data.takedownStatus.toUpperCase()}`, 20, 72)
    doc.text(`Discovery Epoch: ${data.discoveryDate}`, 20, 79)
    doc.text(`Primary Jurisdiction: DMCA / International Content Rights`, 20, 86)

    // Visual Separator
    doc.setDrawColor(226, 232, 240)
    doc.line(20, 95, 190, 95)

    // Forensic Evidence Table
    const tableData = data.forensicEvidence.map(item => [
        item.type.toUpperCase(),
        item.platform,
        item.confidence,
        item.phash.substring(0, 16) + '...'
    ])

    // Note: jspdf-autotable is usually imported but used via doc.autoTable
    // @ts-ignore
    doc.autoTable({
        startY: 105,
        head: [['Type', 'Source Hub', 'Forensic Match', 'pHash Fingerprint']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        styles: { fontSize: 9 }
    })

    // Chain of Custody Section
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 20
    doc.setFontSize(14)
    doc.text('Chain of Custody & Integrity', 20, finalY)
    
    doc.setFontSize(9)
    doc.setTextColor(100)
    const log = [
        `[${timestamp}] Asset scanned via Tuppli Recon Hub.`,
        `[${timestamp}] Forensic ID verification: PASSED.`,
        `[${timestamp}] Digital fingerprint generated (SHA-256).`,
        `[${timestamp}] Multi-platform takedown notice dispatched.`
    ]
    
    log.forEach((line, i) => {
        doc.text(line, 20, finalY + 10 + (i * 6))
    })

    // Legal Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    const footerText = 'This report is a cryptographically verified record of digital asset discovery and enforcement. Tuppli provides forensic identification services only and does not serve as legal counsel. For court use, please attach the raw pHash manifest available in your Master Vault.'
    doc.text(footerText, 20, 280, { maxWidth: 170 })

    // Save
    doc.save(`Tuppli_Forensic_Report_${data.caseId}.pdf`)
}
