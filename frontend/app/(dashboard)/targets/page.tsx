import { getReconTargets } from '../actions'
import { TargetsClient } from './targets-client'

export default async function TargetsPage() {
    const targets = await getReconTargets()

    return <TargetsClient targets={targets} />
}
