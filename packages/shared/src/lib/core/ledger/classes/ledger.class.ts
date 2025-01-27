import { buildBip32PathFromBip44 } from '@core/account/utils/buildBip32PathFromBip44'
import { Platform } from '@core/app/classes'
import { IPlatformEventMap } from '@core/app/interfaces'
import { localize } from '@core/i18n'
import { IEvmAddress, IEvmSignature } from '@core/layer-2/interfaces'
import {
    calculateMaxGasFeeFromTransactionData,
    getAmountFromEvmTransactionValue,
    prepareEvmTransaction,
} from '@core/layer-2/utils'
import { Converter, MILLISECONDS_PER_SECOND, sleep } from '@core/utils'
import { TypedTxData } from '@ethereumjs/tx'
import type { Bip44 } from '@iota/sdk/out/types'
import {
    ProfileAuthPopupId,
    closeProfileAuthPopup,
    openProfileAuthPopup,
} from '../../../../../../desktop/lib/auxiliary/popup'
import { DEFAULT_LEDGER_API_REQUEST_OPTIONS } from '../constants'
import { LedgerApiMethod, LedgerAppName } from '../enums'
import { ILedgerApiBridge } from '../interfaces'
import { LedgerApiRequestResponse } from '../types'
import {
    ILedgerApiRequestOptions,
    ILedgerEthereumAppSettings,
    isBlindSigningRequiredForEvmTransaction,
} from '@core/ledger'
import { EvmChainId } from '@core/network/enums'
import { toRpcSig } from '@ethereumjs/util'
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util'

declare global {
    interface Window {
        __LEDGER__: ILedgerApiBridge
    }
}

const ledgerApiBridge: ILedgerApiBridge = window['__LEDGER__']

export class Ledger {
    static async getEthereumAppSettings(): Promise<ILedgerEthereumAppSettings | undefined> {
        try {
            return await this.callLedgerApiAsync<ILedgerEthereumAppSettings>(
                () => ledgerApiBridge.makeRequest(LedgerApiMethod.GetEthereumAppSettings),
                'ethereum-app-settings',
                {
                    timeout: 0.5 * MILLISECONDS_PER_SECOND,
                }
            )
        } catch (err) {
            return undefined
        }
    }

    static async isBlindSigningEnabledForEvm(): Promise<boolean> {
        return Boolean((await this.getEthereumAppSettings())?.blindSigningEnabled)
    }

    static async generateEvmAddress(accountIndex: number, coinType: number, verify?: boolean): Promise<string> {
        const bip32Path = buildBip32PathFromBip44({
            coinType,
            account: accountIndex,
        })
        const response = await this.callLedgerApiAsync<IEvmAddress>(
            () => ledgerApiBridge.makeRequest(LedgerApiMethod.GenerateEvmAddress, bip32Path, verify ?? false),
            'evm-address'
        )
        return response.evmAddress
    }

    static async signEvmTransaction(
        transactionData: TypedTxData,
        chainId: EvmChainId,
        bip44: Bip44
    ): Promise<string | undefined> {
        const unsignedTransactionMessageHex = prepareEvmTransaction(transactionData, chainId)
        const bip32Path = buildBip32PathFromBip44(bip44)
        const maxGasFee = calculateMaxGasFeeFromTransactionData(transactionData)

        const mustEnableBlindSigning =
            isBlindSigningRequiredForEvmTransaction(transactionData) && !(await this.isBlindSigningEnabledForEvm())
        if (mustEnableBlindSigning) {
            await this.userEnablesBlindSigning()
        }

        openProfileAuthPopup({
            id: ProfileAuthPopupId.VerifyLedgerTransaction,
            hideClose: true,
            preventClose: true,
            props: {
                isEvmTransaction: true,
                toAmount: getAmountFromEvmTransactionValue(transactionData.value?.toString() ?? '0'),
                toAddress: transactionData.to,
                chainId,
                maxGasFee,
            },
        })
        const transactionSignature = await this.callLedgerApiAsync<IEvmSignature>(
            () =>
                ledgerApiBridge.makeRequest(
                    LedgerApiMethod.SignEvmTransaction,
                    unsignedTransactionMessageHex,
                    bip32Path
                ),
            'evm-signed-transaction'
        )
        closeProfileAuthPopup({ forceClose: true })

        if (transactionSignature) {
            const { r, v, s } = transactionSignature
            if (r && v && s) {
                return prepareEvmTransaction(transactionData, chainId, { r, v, s })
            } else {
                throw new Error(localize('error.ledger.rejected'))
            }
        }
    }

    static async signMessage(rawMessage: string, bip44: Bip44): Promise<string | undefined> {
        openProfileAuthPopup({
            id: ProfileAuthPopupId.VerifyLedgerTransaction,
            hideClose: true,
            preventClose: true,
            props: {
                rawMessage,
            },
        })

        const messageHex = Converter.utf8ToHex(rawMessage, false)
        const bip32Path = buildBip32PathFromBip44(bip44)

        const transactionSignature = await this.callLedgerApiAsync<IEvmSignature>(
            () => ledgerApiBridge.makeRequest(LedgerApiMethod.SignMessage, messageHex, bip32Path),
            'signed-message'
        )
        closeProfileAuthPopup({ forceClose: true })

        const { r, v, s } = transactionSignature
        if (r && v && s) {
            const vBig = BigInt(v)
            const rBuffer = Buffer.from(r, 'hex')
            const sBuffer = Buffer.from(s, 'hex')
            return toRpcSig(vBig, rBuffer, sBuffer)
        } else {
            throw new Error(localize('error.ledger.rejected'))
        }
    }

    static async signEip712Message(
        jsonString: string,
        bip44: Bip44,
        version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
    ): Promise<string | undefined> {
        const rawMessage = JSON.parse(jsonString)
        openProfileAuthPopup({
            id: ProfileAuthPopupId.VerifyLedgerTransaction,
            hideClose: true,
            preventClose: true,
            props: {
                rawMessage,
            },
        })

        const bip32Path = buildBip32PathFromBip44(bip44)

        const sanitizedData = TypedDataUtils.sanitizeData(rawMessage)

        const hashedDomain = '0x' + TypedDataUtils.eip712DomainHash(rawMessage, version).toString('hex')
        const hashedMessage =
            '0x' +
            TypedDataUtils.hashStruct(
                sanitizedData.primaryType as string,
                sanitizedData.message,
                sanitizedData.types,
                version
            ).toString('hex')
        const transactionSignature = await this.callLedgerApiAsync<IEvmSignature>(
            () => ledgerApiBridge.makeRequest(LedgerApiMethod.SignEIP712, hashedDomain, hashedMessage, bip32Path),
            'signed-eip712'
        )
        closeProfileAuthPopup({ forceClose: true })

        const { r, v, s } = transactionSignature
        if (r && v && s) {
            const vBig = BigInt(v)
            const rBuffer = Buffer.from(r, 'hex')
            const sBuffer = Buffer.from(s, 'hex')
            return toRpcSig(vBig, rBuffer, sBuffer)
        } else {
            throw new Error(localize('error.ledger.rejected'))
        }
    }

    private static async callLedgerApiAsync<R extends LedgerApiRequestResponse>(
        callback: () => void,
        responseEvent: keyof IPlatformEventMap,
        requestOptions: Partial<ILedgerApiRequestOptions> = {}
    ): Promise<R> {
        // TODO: Do we need to stop / start polling here? Get's slightly complicated in that
        // the Ethereum app settings polling uses this function.

        const { timeout, pollingInterval } = { ...DEFAULT_LEDGER_API_REQUEST_OPTIONS, ...requestOptions }
        const iterationCount = timeout / pollingInterval

        callback()

        let returnValue: R | undefined = undefined

        Platform.onEvent(responseEvent, (value) => {
            returnValue = <R>value
        })

        for (let count = 0; count < iterationCount; count++) {
            if (returnValue) {
                Platform.removeListenersForEvent(responseEvent)
                return returnValue
            }
            await sleep(pollingInterval)
        }

        Platform.removeListenersForEvent(responseEvent)
        return Promise.reject(localize('error.ledger.timeout'))
    }

    private static userEnablesBlindSigning(): Promise<void> {
        return new Promise((resolve, reject) => {
            let isDisabled = true
            openProfileAuthPopup({
                id: ProfileAuthPopupId.EnableLedgerBlindSigning,
                props: {
                    appName: LedgerAppName.Ethereum,
                    onEnabled: () => {
                        isDisabled = false
                        resolve()
                    },
                    onClose: () => {
                        if (isDisabled) {
                            reject(localize('popups.enableLedgerBlindSigning.info'))
                        }
                    },
                },
            })
        })
    }
}
