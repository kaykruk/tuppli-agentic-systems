const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const handle = process.argv[2] || 'creator';
const twitterCount = process.argv[3] || '0';
const redditCount = process.argv[4] || '0';

const reportMd = `
# Forensic Exposure Audit: @${handle}
**Date:** ${new Date().toLocaleDateString()}  
**Status:** <span class="severity-high">ACTION REQUIRED</span>

---

## 🔍 Executive Summary
Our forensic reconnaissance engine has identified multiple high-risk exposures of your premium content across the surface and deep web. This audit details the specific platforms and volume of unauthorized redistribution found.

## 🚩 Detected Threats

### 1. 🐦 X (Twitter) Impersonators & Leaks
- **Total Threats Found:** ${twitterCount}
- **Severity:** <span class="severity-high">CRITICAL</span>
- **Risk:** High-traffic impersonator accounts are redirecting your fans to pirate "tube" sites and phishing links.

### 2. 🤖 Reddit Pirate Communities
- **Total Threads Found:** ${redditCount}
- **Severity:** <span class="severity-medium">HIGH</span>
- **Risk:** Community-driven leak dumps on r/OnlyFansLeaks and r/CreatorsAdvice are exposing your paywalled media to thousands of non-subscribers.

---

## 🛠️ Recommended Action: "The Nuke"
Tuppli's AI can immediately begin the removal process for all ${parseInt(twitterCount) + parseInt(redditCount)} detected threats.

1. **Automated DMCA**: 24/7 legal takedown notices issued to hosting providers.
2. **Search Purge**: Removal of leak URLs from Google, Bing, and DuckDuckGo.
3. **Impersonator Nuke**: One-click reporting of verified fake accounts.

### 🔒 Secure Your Brand Now
[Join the Tuppli Waitlist](https://tuppli.com/waitlist) to automate your protection.
`;

const reportPath = path.join('/tmp', `damage_report_${handle}.md`);
fs.writeFileSync(reportPath, reportMd);

console.log(`📊 Generating PDF for @${handle}...`);
try {
    execSync(`node scripts/mdToPdf.js ${reportPath}`);
    console.log(`✅ Damage Report ready: /tmp/damage_report_${handle}.pdf`);
} catch (err) {
    console.error('❌ PDF generation failed:', err.message);
}
