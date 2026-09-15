# Privacy Policy

**Last Updated:** February 12, 2026

## 1. Introduction

Tuppli Inc. ("we," "us") takes the privacy and security of your data seriously. This policy details how we collect, process, and secure information in our capacity as both a Data Controller (for your account info) and Data Processor (for your operational intelligence data).

## 2. Roles & Responsibilities (GDPR/CCPA)

- **You (The User):** You are the **Data Controller** for the intelligence data, target profiles, and forensic evidence you upload or generate. You are responsible for having a lawful basis (such as legitimate interest or consent) to collect data on third parties.
- **Tuppli:** We act as the **Data Processor** for your operational data, processing it only on your instructions (i.e., when you run a scan). We act as a **Data Controller** only for your account registration and billing data.

## 3. Data Collection

### 3.1 Data We Control (Account Data)
- **Identity:** Name, email, phone number, government ID (hashed/verified via third-party KYC).
- **Financial:** Payment history (processed by LemonSqueezy; we do not store full card numbers).
- **Device:** IP address, browser fingerprint, login timestamps.

### 3.2 Data We Process (Operational Data)
- **Targets:** Social media handles, URLs, and public profile data of individuals you monitor.
- **Evidence:** Images/Videos uploaded to the Vault (encrypted at rest).
- **Metadata:** Exif data, file hashes, timestamps.
- **Intelligence:** Dark web scan results, AI-generated threat summaries.

## 4. Purpose & Lawful Basis

| Purpose | Lawful Basis |
|---------|--------------|
| Service Delivery | Contract (Terms of Service) |
| Fraud Prevention | Legitimate Interest |
| Billing & Tax | Legal Obligation |
| Security Assessment | Legitimate Interest (Yours & Ours) |
| Traitor Tracing | Contract / Legitimate Interest |

## 5. Data Sharing & Sub-processors

We do not sell data. We share data only with strict sub-processors bound by DPA:

| Provider | Purpose | Location |
|----------|---------|----------|
| **Supabase** | Database & Storage | USA (AWS East) |
| **LemonSqueezy** | Payments & Tax | USA |
| **Google Gemini** | AI Analysis (Zero-Retention Policy) | Global |
| **DigiCert / TSA** | Timestamping (Hash only) | USA |

*We may disclose data to law enforcement ONLY if compelled by a valid warrant, subpoena, or court order.*

## 6. Data Retention

- **Active Accounts:** Data retained indefinitely to provide service.
- **Deleted Accounts:** 
  - **Operational Data:** Deleted within 30 days of account termination.
  - **Billing Records:** Retained for 7 years (tax law).
  - **Legal Holds:** If evidence is marked as part of an active legal case (`case_id` present), it is exempted from deletion until the hold is released.

## 7. International Transfers

Data is stored primarily in the United States. For EU/UK users, we rely on Standard Contractual Clauses (SCCs) and the Data Privacy Framework (DPF) adequacy decision for transfers to US processors.

## 8. Your Rights

You have the right to:
- **Export:** Download all your data via the `Export Data` feature (JSON format).
- **Erasure:** Delete your account via the `Danger Zone`. This is irreversible (subject to legal holds).
- **Rectification:** Correct account details.
- **Object:** Stop processing of operational data (by stopping scans).

To exercise these rights, use the settings dashboard. For unresolved issues: privacy@tuppli.com.

## 9. Security Measures

- **Encryption:** AES-256 (At-rest) and TLS 1.3 (Transit).
- **Isolation:** Row-Level Security (RLS) ensures forceful tenant isolation in the database.
- **Access:** Staff have no access to your Vault media without your explicit permission or a root-level system emergency.
- **Audit:** Immutable chain-of-custody logs for all evidence handling.

## 10. Cookies & Tracking

We use only essential cookies for authentication (`sb-access-token`) and security (CSRF tokens). We do not use third-party advertising cookies.
