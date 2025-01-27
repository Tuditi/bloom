import { isLedgerProfile } from '@core/profile'
import { IBaseToken } from '@core/token/interfaces'
import { derived, get, Readable, writable } from 'svelte/store'
import { IOnboardingProfile, IShimmerClaimingAccount } from '../interfaces'

export const onboardingProfile = writable<Partial<IOnboardingProfile>>(null)

export const isOnboardingLedgerProfile: Readable<boolean> = derived(onboardingProfile, ($onboardingProfile) =>
    isLedgerProfile($onboardingProfile?.type)
)

export function updateOnboardingProfile(payload: Partial<IOnboardingProfile>): void {
    return onboardingProfile.update((state) => ({ ...state, ...payload }))
}

export function updateShimmerClaimingAccount(shimmerClaimingAccount: IShimmerClaimingAccount): void {
    let shimmerClaimingAccounts = get(onboardingProfile)?.shimmerClaimingAccounts ?? []
    const claimingAccountIndex = shimmerClaimingAccount?.getMetadata()?.index
    const isNewShimmerClaimingAccount = !shimmerClaimingAccounts.some(
        (_shimmerClaimingAccount) => _shimmerClaimingAccount?.getMetadata()?.index === claimingAccountIndex
    )
    shimmerClaimingAccounts = isNewShimmerClaimingAccount
        ? [...shimmerClaimingAccounts, shimmerClaimingAccount]
        : shimmerClaimingAccounts?.map((_shimmerClaimingAccount) =>
              _shimmerClaimingAccount?.getMetadata()?.index === claimingAccountIndex
                  ? shimmerClaimingAccount
                  : _shimmerClaimingAccount
          )
    updateOnboardingProfile({ shimmerClaimingAccounts })
}

export function getOnboardingBaseToken(): IBaseToken {
    return get(onboardingProfile)?.network?.baseToken
}
