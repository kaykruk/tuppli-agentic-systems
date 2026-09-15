const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateAuditPDF(targetName) {
    console.log(`--- Generating Professional Audit PDF for: ${targetName} ---`);
    
    // Auto-replace the name in the original template
    const htmlPath = path.resolve(__dirname, 'audit_template.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Simple mock customization
    htmlContent = htmlContent.replace(/Anna Kochanius/g, targetName);
    htmlContent = htmlContent.replace(/AnnaK_Vault/g, `${targetName.replace(/\s+/g, '')}_Vault`);
    htmlContent = htmlContent.replace(/AK_Leaks_HQ/g, `@${targetName.replace(/\s+/g, '')}Leaks`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfFilename = `${targetName.replace(/\s+/g, '_')}_Protection_Audit.pdf`;
    const pdfPath = path.resolve(__dirname, '..', pdfFilename);
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    await browser.close();
    console.log(`✅ PDF Audit Generated: ${pdfPath}`);
}

const targetName = process.argv[2] || "Target Creator";
generateAuditPDF(targetName);
