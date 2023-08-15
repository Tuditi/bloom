import { IAccountState } from '@core/account'
import { ADDRESS_TYPE_ALIAS, EMPTY_HEX_ID } from '@core/wallet/constants'
import { ActivityType } from '../enums'
import { IActivityGenerationParameters } from '@core/activity/types'
import { AliasActivity } from '../types'
import { IAliasOutput } from '@iota/types'
import {
    getAmountFromOutput,
    getAsyncDataFromOutput,
    getGovernorAddressFromAliasOutput,
    getMetadataFromOutput,
    getSendingInformation,
    getStateControllerAddressFromAliasOutput,
    getStorageDepositFromOutput,
    getTagFromOutput,
} from './helper'
import { convertHexAddressToBech32, hashOutputId } from '@core/wallet/utils'

export function generateSingleAliasActivity(
    account: IAccountState,
    { action, processedTransaction, wrappedOutput }: IActivityGenerationParameters
): AliasActivity {
    const { transactionId, claimingData, direction, time, inclusionState } = processedTransaction

    const output = wrappedOutput.output as IAliasOutput
    const outputId = wrappedOutput.outputId
    const id = outputId || transactionId

    const _storageDeposit = getStorageDepositFromOutput(output)
    const storageDeposit = getAmountFromOutput(output) + _storageDeposit
    const governorAddress = getGovernorAddressFromAliasOutput(output)
    const stateControllerAddress = getStateControllerAddressFromAliasOutput(output)
    const aliasId = getAliasId(output, outputId)

    const isHidden = false
    const isAssetHidden = false
    const containsValue = true

    const metadata = getMetadataFromOutput(output)
    const tag = getTagFromOutput(output)
    const asyncData = getAsyncDataFromOutput(output, outputId, claimingData, account)
    const sendingInfo = getSendingInformation(processedTransaction, output, account)

    return {
        type: ActivityType.Alias,
        id,
        outputId,
        transactionId,
        direction,
        action,
        aliasId,
        storageDeposit,
        governorAddress,
        stateControllerAddress,
        isHidden,
        isAssetHidden,
        time,
        metadata,
        tag,
        chainId: undefined,
        inclusionState,
        containsValue,
        asyncData,
        ...sendingInfo,
    }
}

function getAliasId(output: IAliasOutput, outputId: string): string {
    const isNewAlias = output.aliasId === EMPTY_HEX_ID
    const aliasId = isNewAlias ? hashOutputId(outputId) : output.aliasId
    return convertHexAddressToBech32(ADDRESS_TYPE_ALIAS, aliasId)
}