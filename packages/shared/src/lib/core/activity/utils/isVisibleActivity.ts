import { BASE_TOKEN_ID, convertToRawAmount } from '@core/token'
import { dateIsAfterOtherDate, dateIsBeforeOtherDate, datesOnSameDay } from '@core/utils'
import {
    BooleanFilterOption,
    DateFilterOption,
    DateUnit,
    InternalExternalOption,
    NumberFilterOption,
    StatusFilterOption,
} from '@core/utils/enums/filters'
import { get } from 'svelte/store'
import { StardustActivityAsyncStatus, StardustActivityType, InclusionState } from '../enums'
import { activityFilter } from '../stores'
import { StardustActivity, ActivityFilter } from '../types'
import { getPersistedToken } from '@core/token/stores'

// Filters activities based on activity properties. If none of the conditionals are valid, then activity is shown.
export function isVisibleActivity(activity: StardustActivity): boolean {
    const filter = get(activityFilter)

    if (!isVisibleWithActiveValuelessFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveHiddenFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveRejectedFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveTokenFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveAmountFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveDateFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveStatusFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveTypeFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithActiveDirectionFilter(activity, filter)) {
        return false
    }
    if (!isVisibleWithInternalExternalFilter(activity, filter)) {
        return false
    }
    return true
}

function isVisibleWithActiveHiddenFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (
        (!filter.showHidden.active || filter.showHidden.selected === BooleanFilterOption.No) &&
        activity.isTokenHidden
    ) {
        return false
    }
    return true
}

function isVisibleWithActiveValuelessFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (
        (!filter.showValueless.active || filter.showValueless.selected === BooleanFilterOption.No) &&
        (!filter.showHidden.active || filter.showHidden.selected === BooleanFilterOption.No) &&
        !activity.containsValue
    ) {
        return false
    }
    return true
}

function isVisibleWithActiveRejectedFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (
        (!filter.showRejected.active || filter.showRejected.selected === BooleanFilterOption.No) &&
        activity.asyncData?.isRejected
    ) {
        return false
    }
    return true
}

function isVisibleWithActiveTokenFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (filter.token.active && filter.token.selected) {
        if (activity.type !== StardustActivityType.Basic && activity.type !== StardustActivityType.Foundry) {
            return false
        }
        const tokenId = activity.tokenTransfer?.tokenId ?? activity.baseTokenTransfer?.tokenId ?? BASE_TOKEN_ID
        if (filter.token.selected && tokenId !== filter.token.selected) {
            return false
        }
    }
    return true
}

function isVisibleWithActiveAmountFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (
        filter.amount.active &&
        (activity.type === StardustActivityType.Basic || activity.type === StardustActivityType.Foundry)
    ) {
        const { tokenId, rawAmount } = activity.tokenTransfer ?? activity.baseTokenTransfer
        const token = getPersistedToken(tokenId)

        if (!token || !token.metadata) {
            return false
        }

        if (
            filter.amount.selected === NumberFilterOption.Equal &&
            filter.amount.subunit.type === 'single' &&
            filter.amount.subunit.amount
        ) {
            const amount = convertToRawAmount(String(filter.amount.subunit.amount), token.metadata)
            const isEqual = amount && rawAmount === amount
            if (!isEqual) {
                return false
            }
        }
        if (
            filter.amount.selected === NumberFilterOption.Range &&
            filter.amount.subunit.type === 'range' &&
            filter.amount.subunit.start &&
            filter.amount.subunit.end
        ) {
            const startAmount = convertToRawAmount(String(filter.amount.subunit.start), token.metadata)
            const endAmount = convertToRawAmount(String(filter.amount.subunit.end), token.metadata)
            const isInRange = startAmount && endAmount && rawAmount <= endAmount && rawAmount >= startAmount
            if (!isInRange) {
                return false
            }
        }
        if (
            filter.amount.selected === NumberFilterOption.Greater &&
            filter.amount.subunit.type === 'single' &&
            filter.amount.subunit.amount
        ) {
            const amount = convertToRawAmount(String(filter.amount.subunit.amount), token.metadata)
            const isGreater = amount && rawAmount >= amount
            if (!isGreater) {
                return false
            }
        }
        if (
            filter.amount.selected === NumberFilterOption.Less &&
            filter.amount.subunit.type === 'single' &&
            filter.amount.subunit.amount
        ) {
            const amount = convertToRawAmount(String(filter.amount.subunit.amount), token.metadata)
            const isLess = amount && rawAmount <= amount
            if (!isLess) {
                return false
            }
        }
    }
    return true
}

function isVisibleWithActiveDateFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (filter.date.active) {
        if (
            filter.date.selected === DateFilterOption.Equals &&
            filter.date.subunit.type === 'single' &&
            filter.date.subunit.value
        ) {
            const filterDate = new Date(filter.date.subunit.value)
            if (!datesOnSameDay(activity.time, filterDate)) {
                return false
            }
        }
        if (
            filter.date.selected === DateFilterOption.Before &&
            filter.date.subunit.type === 'single' &&
            filter.date.subunit.value
        ) {
            const filterDate = new Date(filter.date.subunit.value)
            if (!dateIsBeforeOtherDate(activity.time, filterDate)) {
                return false
            }
        }
        if (
            filter.date.selected === DateFilterOption.After &&
            filter.date.subunit.type === 'single' &&
            filter.date.subunit.value
        ) {
            const filterDate = new Date(filter.date.subunit.value)
            if (!dateIsAfterOtherDate(activity.time, filterDate)) {
                return false
            }
        }
        if (
            filter.date.selected === DateFilterOption.AfterOrEquals &&
            filter.date.subunit.type === 'single' &&
            filter.date.subunit.value
        ) {
            const filterDate = new Date(filter.date.subunit.value)
            if (!(dateIsAfterOtherDate(activity.time, filterDate) || datesOnSameDay(activity.time, filterDate))) {
                return false
            }
        }
        if (
            filter.date.selected === DateFilterOption.Range &&
            filter.date.subunit.type === 'range' &&
            filter.date.subunit.start &&
            filter.date.subunit.end
        ) {
            const startFilterDate = new Date(filter.date.subunit.start)
            const endFilterDate = new Date(filter.date.subunit.end)

            const isInRange =
                dateIsAfterOtherDate(activity.time, startFilterDate) &&
                dateIsBeforeOtherDate(activity.time, endFilterDate)
            const isOnBoundries =
                datesOnSameDay(activity.time, startFilterDate) || datesOnSameDay(activity.time, endFilterDate)
            if (!(isInRange || isOnBoundries)) {
                return false
            }
        }
        if (filter.date.selected === DateFilterOption.Last && filter.date.subunit.type === 'unit') {
            const startFilterDate = new Date()
            const endFilterDate = new Date()
            switch (filter.date.subunit.unit) {
                case DateUnit.Days:
                    startFilterDate.setDate(startFilterDate.getDate() - Number(filter.date.subunit.amount))
                    break
                case DateUnit.Months:
                    startFilterDate.setMonth(startFilterDate.getMonth() - Number(filter.date.subunit.amount))
                    break
                case DateUnit.Years:
                    startFilterDate.setFullYear(startFilterDate.getFullYear() - Number(filter.date.subunit.amount))
                    break
            }

            const isInRange =
                dateIsAfterOtherDate(activity.time, startFilterDate) &&
                dateIsBeforeOtherDate(activity.time, endFilterDate)
            const isOnBoundries =
                datesOnSameDay(activity.time, startFilterDate) || datesOnSameDay(activity.time, endFilterDate)
            if (!(isInRange || isOnBoundries)) {
                return false
            }
        }
    }
    return true
}

function isVisibleWithActiveStatusFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (filter.status.active && filter.status.selected) {
        if (
            filter.status.selected === StatusFilterOption.Confirmed &&
            activity.inclusionState !== InclusionState.Confirmed
        ) {
            return false
        }
        if (
            filter.status.selected === StatusFilterOption.Pending &&
            activity.inclusionState !== InclusionState.Pending
        ) {
            return false
        }
        if (
            filter.status.selected === StatusFilterOption.Timelocked &&
            activity.asyncData?.asyncStatus !== StardustActivityAsyncStatus.Timelocked
        ) {
            return false
        }
        if (
            filter.status.selected === StatusFilterOption.Claimed &&
            activity.type === StardustActivityType.Basic &&
            activity.asyncData?.asyncStatus !== StardustActivityAsyncStatus.Claimed
        ) {
            return false
        }
        if (
            filter.status.selected === StatusFilterOption.Unclaimed &&
            activity.type === StardustActivityType.Basic &&
            (!activity.asyncData?.asyncStatus ||
                activity.asyncData?.asyncStatus === StardustActivityAsyncStatus.Claimed)
        ) {
            return false
        }
    }
    return true
}

function isVisibleWithActiveTypeFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (filter.type.active && filter.type.selected) {
        if (filter.type.selected !== activity.type) {
            return false
        }
    }
    return true
}

function isVisibleWithActiveDirectionFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (filter.direction.active && filter.direction.selected) {
        if (filter.direction.selected !== activity.direction) {
            return false
        }
    }
    return true
}

function isVisibleWithInternalExternalFilter(activity: StardustActivity, filter: ActivityFilter): boolean {
    if (filter.internalExternal.active && filter.internalExternal.selected) {
        if (filter.internalExternal.selected === InternalExternalOption.Internal && !activity.isInternal) {
            return false
        }
        if (filter.internalExternal.selected === InternalExternalOption.External && activity.isInternal) {
            return false
        }
    }
    return true
}
