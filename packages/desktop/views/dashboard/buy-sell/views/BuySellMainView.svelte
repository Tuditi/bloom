<script lang="ts">
    import { ISettingsState, settingsState } from '@contexts/settings/stores'
    import { selectedAccount, selectedAccountIndex } from '@core/account/stores'
    import { Platform } from '@core/app'
    import { activeProfile } from '@core/profile/stores'
    import { IPopupState, IProfileAuthPopupState, popupState, profileAuthPopup } from '@desktop/auxiliary/popup'
    import { Pane } from '@ui'
    import { onDestroy, tick } from 'svelte'
    import { TransakAccountPanel, TransakConnectionPanel, TransakInfoPanel } from '../components'
    import { isDashboardSideBarExpanded } from '@core/ui'

    $: $isDashboardSideBarExpanded, void updateTransakBounds()

    $: if ($selectedAccountIndex !== undefined) {
        void resetTransak()
    }

    $: void handlePopupState($popupState, $profileAuthPopup, $settingsState)

    async function handlePopupState(
        state: IPopupState,
        profilePopupState: IProfileAuthPopupState,
        settingsState: ISettingsState
    ): Promise<void> {
        if (state.active || profilePopupState.active || settingsState.open) {
            await Platform.hideTransak()
        } else {
            await tick()
            await Platform.showTransak()
        }
    }

    let transakContainer: HTMLDivElement | undefined
    async function updateTransakBounds(): Promise<void> {
        if (!transakContainer) {
            return
        }

        const rect = transakContainer.getBoundingClientRect()
        const transakPaneStyles = getComputedStyle(transakContainer?.children[0])
        const extractDigitsToNumbers = (str: string) => Number(str?.replace(/\D/g, '') ?? 0)
        const borderTop = extractDigitsToNumbers(transakPaneStyles?.borderTopWidth)
        const borderBottom = extractDigitsToNumbers(transakPaneStyles?.borderBottomWidth)
        const borderLeft = extractDigitsToNumbers(transakPaneStyles?.borderLeftWidth)
        const borderRight = extractDigitsToNumbers(transakPaneStyles?.borderRightWidth)

        await Platform.updateTransakBounds({
            x: rect.x + borderLeft,
            y: rect.y + borderTop,
            width: rect.width - borderLeft - borderRight,
            height: rect.height - borderTop - borderBottom,
        })
    }

    async function resetTransak(): Promise<void> {
        await Platform.closeTransak()
        await Platform.openTransak({
            currency: $activeProfile?.settings.marketCurrency,
            address: $selectedAccount.depositAddress,
            service: 'BUY',
        })
        await updateTransakBounds()
    }

    onDestroy(() => {
        void Platform.closeTransak()
    })
</script>

<svelte:window on:resize={updateTransakBounds} />

<div class="flex justify-center gap-4 h-full w-full">
    <div class="account-panel flex flex-col gap-4">
        <TransakConnectionPanel refreshFunction={resetTransak} />
        <TransakAccountPanel />
    </div>
    <div class="transak-panel" bind:this={transakContainer}>
        <Pane
            classes="flex flex-col justify-center items-center w-full h-full px-6 pb-6 pt-4 gap-4 bg-surface dark:bg-surface-dark shadow-lg"
        ></Pane>
    </div>
    <div class="info-panel">
        <TransakInfoPanel />
    </div>
</div>

<style lang="postcss">
    .transak-panel {
        @apply flex-1 min-w-[360px] max-w-[480px] max-h-[786px];
    }

    .account-panel,
    .info-panel {
        @apply max-w-[312px];
    }

    .account-panel {
        @apply shrink-0 w-[312px];
    }
</style>
