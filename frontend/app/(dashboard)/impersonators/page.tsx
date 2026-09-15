import { getImpersonatorAlerts } from '../actions'
import { ImpersonatorsClient } from './impersonators-client'

export default async function ImpersonatorsPage() {
    const alerts = await getImpersonatorAlerts()

    return <ImpersonatorsClient alerts={alerts} />
}
