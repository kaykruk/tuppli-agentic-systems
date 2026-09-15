import { getIntelligenceData } from '../actions'
import { IntelligenceClient } from './intelligence-client'

export default async function IntelligencePage() {
    const intel = await getIntelligenceData()

    return <IntelligenceClient initialData={intel} />
}
