<script lang="ts">
    import { Table } from '@bloomwalletio/ui'
    import { StardustFoundryActivity } from '@core/activity'
    import { openUrlInBrowser } from '@core/app'
    import { localize } from '@core/i18n'
    import { ExplorerEndpoint } from '@core/network/enums'
    import { getDefaultExplorerUrl } from '@core/network/utils'

    export let activity: StardustFoundryActivity

    function onAliasClick(aliasAddress: string) {
        const explorerUrl = getDefaultExplorerUrl(activity?.sourceNetworkId, ExplorerEndpoint.Address)
        openUrlInBrowser(`${explorerUrl}/${aliasAddress}`)
    }

    function onTokenClick(tokenId: string) {
        const explorerUrl = getDefaultExplorerUrl(activity?.sourceNetworkId, ExplorerEndpoint.Foundry)
        openUrlInBrowser(`${explorerUrl}/${tokenId}`)
    }
</script>

<Table
    items={[
        {
            key: localize('popups.nativeToken.property.aliasAddress'),
            value: activity.aliasAddress,
            truncate: { firstCharCount: 10, endCharCount: 10 },
            onClick: () => onAliasClick(activity.aliasAddress),
        },
        {
            key: localize('popups.nativeToken.property.tokenId'),
            value: activity.tokenTransfer?.tokenId,
            truncate: { firstCharCount: 10, endCharCount: 10 },
            onClick: () => onTokenClick(activity.tokenTransfer?.tokenId ?? ''),
        },
        {
            key: localize('popups.nativeToken.property.maximumSupply'),
            value: String(activity.maximumSupply),
        },
        {
            key: localize('popups.nativeToken.property.mintedTokens'),
            value: String(activity.mintedTokens),
        },
        {
            key: localize('popups.nativeToken.property.meltedTokens'),
            value: String(activity.meltedTokens),
        },
    ]}
/>
