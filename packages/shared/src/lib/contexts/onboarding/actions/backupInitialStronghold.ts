import { get } from 'svelte/store'

import { Platform } from '@core/app/classes'
import { InvalidBackupDestinationError } from '@core/profile/errors'
import { backup } from '@core/profile-manager'
import { getDefaultStrongholdName } from '@core/stronghold'

import { onboardingProfile, updateOnboardingProfile } from '../stores'

/**
 * Creates an initial backup for a profile's Stronghold.
 */
export async function backupInitialStronghold(): Promise<void> {
    const strongholdBackupDestination = await Platform.getStrongholdBackupDestination(getDefaultStrongholdName())
    if (strongholdBackupDestination) {
        await backup(strongholdBackupDestination, get(onboardingProfile)?.strongholdPassword)
        updateOnboardingProfile({ lastStrongholdBackupTime: new Date() })
    } else {
        throw new InvalidBackupDestinationError()
    }
}
