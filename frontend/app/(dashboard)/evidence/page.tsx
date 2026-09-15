import { getForensicEvidence } from '../actions'
import { EvidenceClient } from './evidence-client'

export default async function EvidencePage() {
    const evidence = await getForensicEvidence()

    return <EvidenceClient initialEvidence={evidence} />
}
