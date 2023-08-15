import { getPersistedToken } from '@core/token/stores'
import { SubjectType } from '@core/wallet/enums'
import { derived, Readable, writable, Writable } from 'svelte/store'
import { selectedAccount } from '../../account/stores/selected-account.store'
import { DEFAULT_ACTIVITY_FILTER } from '../constants'
import { ActivityType } from '../enums'
import { ActivityFilter } from '../types'
import { Activity } from '../types/activity.type'
import { isVisibleActivity } from '../utils/isVisibleActivity'
import { getFormattedAmountFromActivity } from '../utils/outputs'
import { allAccountActivities } from './all-account-activities.store'
import { isValidIrc30Token } from '@core/token/utils'

export const selectedAccountActivities: Readable<Activity[]> = derived(
    [selectedAccount, allAccountActivities],
    ([$selectedAccount, $allAccountActivities]) => {
        if ($selectedAccount) {
            return $allAccountActivities[$selectedAccount?.index] ?? []
        } else {
            return []
        }
    }
)

export const activityFilter: Writable<ActivityFilter> = writable(DEFAULT_ACTIVITY_FILTER)

export const activitySearchTerm: Writable<string> = writable('')

export const queriedActivities: Readable<Activity[]> = derived(
    [selectedAccountActivities, activitySearchTerm, activityFilter],
    ([$selectedAccountActivities, $activitySearchTerm]) => {
        let activityList = $selectedAccountActivities.filter((_activity) => {
            const containsAssets = _activity.type === ActivityType.Basic || _activity.type === ActivityType.Foundry
            if (!_activity.isHidden && !containsAssets) {
                return true
            }

            const token =
                _activity.type === ActivityType.Basic || _activity.type === ActivityType.Foundry
                    ? getPersistedToken(_activity.tokenId)
                    : undefined
            const hasValidAsset = token?.metadata && isValidIrc30Token(token.metadata)
            return !_activity.isHidden && hasValidAsset
        })

        activityList = activityList.filter((activity) => isVisibleActivity(activity))

        if ($activitySearchTerm) {
            activityList = activityList.filter((activity) => {
                const fieldsToSearch = getFieldsToSearchFromActivity(activity)
                return fieldsToSearch.find((field) =>
                    field?.toLowerCase()?.includes($activitySearchTerm?.toLowerCase())
                )
            })
        }

        return activityList.sort((activity1, activity2) => activity2.time.getTime() - activity1.time.getTime())
    }
)

function getFieldsToSearchFromActivity(activity: Activity): string[] {
    const fieldsToSearch: string[] = []

    if (activity?.transactionId) {
        fieldsToSearch.push(activity.transactionId)
    }

    if ((activity.type === ActivityType.Basic || activity.type === ActivityType.Foundry) && activity.tokenId) {
        fieldsToSearch.push(activity.tokenId)

        const assetName = getPersistedToken(activity.tokenId)?.metadata?.name
        if (assetName) {
            fieldsToSearch.push(assetName)
        }
    }

    if ((activity.type === ActivityType.Basic || activity.type === ActivityType.Foundry) && activity.rawAmount) {
        fieldsToSearch.push(activity.rawAmount?.toString())
        fieldsToSearch.push(getFormattedAmountFromActivity(activity, false)?.toLowerCase())
    }

    if (activity.subject) {
        fieldsToSearch.push(activity.subject.address)
    }
    if (activity.subject?.type === SubjectType.Account) {
        fieldsToSearch.push(activity.subject.account?.name)
    } else if (activity.subject?.type === SubjectType.Contact) {
        fieldsToSearch.push(activity.subject.contact.name)
    }

    if (activity?.asyncData?.claimingTransactionId) {
        fieldsToSearch.push(activity.asyncData.claimingTransactionId)
    }

    if (activity?.metadata) {
        fieldsToSearch.push(activity.metadata)
    }

    if (activity?.tag) {
        fieldsToSearch.push(activity.tag)
    }

    if (activity.outputId) {
        fieldsToSearch.push(activity.outputId)
    }

    return fieldsToSearch
}