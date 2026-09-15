import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingData } from '@/app/(dashboard)/actions'

interface StepProfileSetupProps {
    data: OnboardingData
    onUpdate: (data: Partial<OnboardingData>) => void
    onNext: () => void
    onBack: () => void
}

export default function StepProfileSetup({ data, onUpdate, onNext, onBack }: StepProfileSetupProps) {
    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Set Up Your Profile</h2>
                <p className="text-gray-400">Tell us a bit about yourself.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        value={data.username}
                        onChange={(e) => onUpdate({ username: e.target.value })}
                        placeholder="Your creator handle"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        value={data.bio}
                        onChange={(e) => onUpdate({ bio: e.target.value })}
                        placeholder="Short description..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                        id="twitter"
                        value={data.socials?.twitter || ''}
                        onChange={(e) => onUpdate({ socials: { ...data.socials, twitter: e.target.value } })}
                        placeholder="@handle"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!data.username}>Continue</Button>
            </div>
        </div>
    )
}
