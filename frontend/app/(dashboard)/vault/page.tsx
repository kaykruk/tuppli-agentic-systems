import { getVaultItems } from '../actions'
import { VaultClient } from './vault-client'

export default async function VaultPage() {
    const items = await getVaultItems()

    return <VaultClient items={items} />
}
