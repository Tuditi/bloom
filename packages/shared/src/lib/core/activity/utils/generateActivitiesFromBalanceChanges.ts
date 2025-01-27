import { IAccountState } from '@core/account'
import { StardustActivity, INftBalanceChange, ITokenBalanceChange } from '../types'
import { getBalanceChanges } from '../stores'
import { get } from 'svelte/store'
import { NetworkId, network } from '@core/network'
import { generateNftBalanceChangeActivity, generateTokenBalanceChangeActivity } from './evm'

export async function generateActivitiesFromBalanceChanges(account: IAccountState): Promise<StardustActivity[]> {
    const activities: StardustActivity[] = []

    const chains = get(network)?.getChains() ?? []
    for (const chain of chains) {
        const networkId = chain.getConfiguration().id
        const balanceChanges = getBalanceChanges(account.index, networkId)

        const tokenActivites = await generateActivitiesFromTokenBalanceChanges(
            account,
            networkId,
            balanceChanges.tokens
        )
        activities.push(...tokenActivites)
        const nftActivites = generateActivitiesFromNftBalanceChanges(account, networkId, balanceChanges.nfts)
        activities.push(...nftActivites)
    }

    return activities
}

export async function generateActivitiesFromTokenBalanceChanges(
    account: IAccountState,
    networkId: NetworkId,
    tokenBalanceChanges: {
        [tokenId: string]: ITokenBalanceChange[]
    }
): Promise<StardustActivity[]> {
    const activities: StardustActivity[] = []
    const tokenIds = tokenBalanceChanges ? Object.keys(tokenBalanceChanges) : []
    for (const tokenId of tokenIds) {
        for (const balanceChangeForToken of tokenBalanceChanges[tokenId]) {
            if (balanceChangeForToken.hidden) {
                continue
            }
            try {
                const activity = await generateTokenBalanceChangeActivity(
                    networkId,
                    tokenId,
                    balanceChangeForToken,
                    account
                )
                activities.push(activity)
            } catch (error) {
                console.error(error)
            }
        }
    }
    return activities
}

export function generateActivitiesFromNftBalanceChanges(
    account: IAccountState,
    networkId: NetworkId,
    nftBalanceChanges: {
        [nftId: string]: INftBalanceChange[]
    }
): StardustActivity[] {
    const activities: StardustActivity[] = []
    const nftIds = nftBalanceChanges ? Object.keys(nftBalanceChanges) : []
    for (const nftId of nftIds) {
        for (const balanceChangeForNft of nftBalanceChanges[nftId]) {
            if (balanceChangeForNft.hidden) {
                continue
            }
            try {
                const activity = generateNftBalanceChangeActivity(networkId, nftId, balanceChangeForNft, account)
                activities.push(activity)
            } catch (error) {
                console.error(error)
            }
        }
    }
    return activities
}
