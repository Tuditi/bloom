import { Subject } from '@core/wallet/types'
import { ActivityAsyncStatus, ActivityDirection, InclusionState, ActivityAction } from '../enums'
import { Layer2Metadata } from '@core/layer-2'
import { NetworkId } from '@core/network'

export type BaseActivity = {
    id: string
    outputId?: string
    transactionId?: string
    time: Date
    inclusionState: InclusionState
    isHidden?: boolean
    containsValue: boolean
    isAssetHidden: boolean
    direction: ActivityDirection
    action: ActivityAction
    isInternal: boolean
    storageDeposit: number
    rawBaseCoinAmount?: number
    subject: Subject | undefined
    metadata?: string
    tag?: string
    networkId: NetworkId
    asyncData?: AsyncData
    destinationNetwork?: string
    parsedLayer2Metadata?: Layer2Metadata
}

export type AsyncData = {
    asyncStatus: ActivityAsyncStatus
    timelockDate: Date
    expirationDate: Date
    isRejected: boolean
    isClaiming: boolean
    claimingTransactionId: string
    claimedDate: Date
}
