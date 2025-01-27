import { get } from 'svelte/store'

import { localize } from '@core/i18n/i18n'
import { resetMintTokenDetails, resetMintNftDetails } from '@core/wallet/stores'
import { IError } from '@core/error/interfaces'
import { handleError, handleGenericError } from '@core/error/handlers'
import { showNotification } from '@auxiliary/notification'
import {
    closeProfileAuthPopup,
    openProfileAuthPopup,
    profileAuthPopup,
    ProfileAuthPopupId,
} from '../../../../../../desktop/lib/auxiliary/popup'

import { LEDGER_ERROR_LOCALES } from '../constants'
import { LedgerAppName, LedgerError } from '../enums'
import { deriveLedgerError } from '../helpers'
import { checkOrConnectLedgerAsync, ledgerPreparedOutput, resetLedgerPreparedOutput } from '@core/ledger'
import { sendOutput } from '@core/wallet'
import { activeProfile } from '@core/profile/stores'
import { SupportedNetworkId } from '@core/network/enums'

export function handleLedgerError(error: IError, resetConfirmationPropsOnDenial = true): void {
    const ledgerError = deriveLedgerError(error?.error)
    if (!ledgerError || !(ledgerError in LEDGER_ERROR_LOCALES)) {
        handleGenericError(error)
        return
    }

    const popupType = get(profileAuthPopup)?.id

    const wasDeniedByUser = ledgerError === LedgerError.DeniedByUser

    /**
     * NOTE: We may wish to reset the confirmation props to avoid
     * re-opening the popup if the user manually rejected the prompt
     * on the device.
     */
    if (wasDeniedByUser && resetConfirmationPropsOnDenial) {
        resetMintTokenDetails()
        resetMintNftDetails()
    }

    closeProfileAuthPopup({ forceClose: true })

    /**
     * NOTE: Because the device has a warning prompt about blind signing when trying it
     * while it's disabled, the user has to manually reject it on the device. This results in
     * an error, however it is bad UX to display it to the user when they meant to do it.
     */
    const hadToEnableBlindSinging = popupType === ProfileAuthPopupId.EnableLedgerBlindSigning && wasDeniedByUser
    if (hadToEnableBlindSinging) {
        const appName =
            get(activeProfile)?.network?.id === SupportedNetworkId.Iota ? LedgerAppName.Iota : LedgerAppName.Shimmer
        openProfileAuthPopup({
            id: ProfileAuthPopupId.EnableLedgerBlindSigning,
            props: {
                appName,
                onEnabled: async () => {
                    try {
                        await checkOrConnectLedgerAsync()
                        if (get(ledgerPreparedOutput)) {
                            await sendOutput(get(ledgerPreparedOutput))
                            resetLedgerPreparedOutput()
                        }
                    } catch (err) {
                        handleError(err)
                    }
                },
            },
        })
    } else {
        showNotification({
            variant: wasDeniedByUser ? 'warning' : 'error',
            text: localize(LEDGER_ERROR_LOCALES[ledgerError]),
        })
    }
}
