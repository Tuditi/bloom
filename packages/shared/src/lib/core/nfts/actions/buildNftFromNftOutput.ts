import { getIssuerFromNftOutput, getMetadataFromNftOutput, getNftId } from '@core/activity/utils/outputs'
import { activeProfileId } from '@core/profile/stores'
import { ADDRESS_TYPE_NFT } from '@core/wallet/constants'
import { IWrappedOutput } from '@core/wallet/interfaces'
import { getBech32AddressFromAddressTypes } from '@core/wallet/utils'
import type { INftOutput } from '@iota/types'
import { get } from 'svelte/store'
import { DEFAULT_NFT_NAME } from '../constants'
import { INft } from '../interfaces'
import { composeUrlFromNftUri, getSpendableStatusFromUnspentNftOutput, parseNftMetadata } from '../utils'

export function buildNftFromNftOutput(
    wrappedOutput: IWrappedOutput,
    accountAddress: string,
    calculateStatus: boolean = true
): INft {
    const nftOutput = wrappedOutput.output as INftOutput

    let isSpendable = false
    let timeLockTime = undefined

    if (calculateStatus) {
        const status = getSpendableStatusFromUnspentNftOutput(accountAddress, nftOutput)
        isSpendable = status.isSpendable
        timeLockTime = status.timeLockTime
    }

    const id = getNftId(nftOutput.nftId, wrappedOutput.outputId)
    const address = getBech32AddressFromAddressTypes({ type: ADDRESS_TYPE_NFT, nftId: id })
    const issuer = getIssuerFromNftOutput(nftOutput)
    const metadata = getMetadataFromNftOutput(nftOutput)
    const parsedMetadata = parseNftMetadata(metadata)
    const composedUrl = composeUrlFromNftUri(parsedMetadata?.uri)
    const filePath = `${get(activeProfileId)}/nfts/${id}`
    const storageDeposit = Number(nftOutput.amount)

    return {
        id,
        address,
        name: parsedMetadata?.name ?? DEFAULT_NFT_NAME,
        issuer,
        isSpendable,
        timelockTime: timeLockTime ? Number(timeLockTime) : undefined,
        metadata,
        parsedMetadata,
        latestOutputId: wrappedOutput.outputId,
        composedUrl,
        downloadUrl: composedUrl,
        filePath,
        storageDeposit,
        downloadMetadata: {
            error: undefined,
            warning: undefined,
            isLoaded: false,
        },
    }
}