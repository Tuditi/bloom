import { get } from 'svelte/store'
import { getActiveProfile } from '@core/profile/stores'
import { NftStandard } from '../enums'
import { IPersistedErc721Nft } from '../interfaces'
import { persistedNfts } from '../stores'

export function getPersistedErc721Nfts(ownerAddress: string): IPersistedErc721Nft[] {
    const activeProfileId = getActiveProfile()?.id
    if (activeProfileId) {
        const profileNfts = Object.values(get(persistedNfts)[activeProfileId] ?? {})
        return profileNfts.filter(({ ownerAddress: _ownerAddress, standard }) => {
            return _ownerAddress === ownerAddress && standard === NftStandard.Erc721
        }) as IPersistedErc721Nft[]
    } else {
        throw new Error('Unable to get active profile')
    }
}