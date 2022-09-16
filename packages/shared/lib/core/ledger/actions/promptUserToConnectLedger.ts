import { get } from 'svelte/store'

import { popupState } from '@lib/popup'

import { LEDGER_STATUS_POLL_INTERVAL } from '../constants'
import { openLedgerNotConnectedPopup } from '../utils'

import { getLedgerDeviceStatus } from './getLedgerDeviceStatus'
import { pollLedgerNanoStatus } from './pollLedgerNanoStatus'

export function promptUserToConnectLedger(
    onConnected: () => void | Promise<void> = () => {},
    onCancel: () => void = () => {},
    overridePopup: boolean = false
): void {
    const _onCancel = () => {
        onCancel()
    }
    const _onConnected = () => {
        void onConnected()
    }

    const _onDisconnected = () => {
        if (!get(popupState).active || overridePopup) {
            openLedgerNotConnectedPopup(
                onCancel,
                () => pollLedgerNanoStatus(LEDGER_STATUS_POLL_INTERVAL),
                overridePopup
            )
        }
    }

    void getLedgerDeviceStatus(_onConnected, _onDisconnected, _onCancel)
}