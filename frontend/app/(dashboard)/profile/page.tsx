import { getProfile, getAuthorizedAccounts } from './actions'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
    const [profile, accounts] = await Promise.all([
        getProfile(),
        getAuthorizedAccounts()
    ])

    if (!profile) {
        return <div>Loading...</div>
    }

    return <ProfileClient profile={profile} accounts={accounts} />
}
