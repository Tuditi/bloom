import { Converter } from '@iota/util.js'
import { closePopup, openPopup, PopupId } from '../../../../../../desktop/lib/auxiliary/popup'
import { JsonRpcResponse } from '@walletconnect/jsonrpc-types'

export function handlePersonalSign(
    id: number,
    params: unknown,
    responseCallback: (response: JsonRpcResponse) => void
): void {
    if (!params || !Array.isArray(params)) {
        responseCallback({ id, error: { code: 5000, message: 'Error' }, jsonrpc: '2.0' })
        return
    }

    const hexMessage = params[0]
    // to access the address for which we want to do the action = params[1]

    if (typeof hexMessage !== 'string') {
        responseCallback({ id, error: { code: 5000, message: 'Error' }, jsonrpc: '2.0' })
        return
    }

    const message = Converter.hexToUtf8(hexMessage)
    // sign the message
    // const signedMessage = await wallet.signMessage(message)

    const signedMessage = 'hello this is signed'
    const response = { id, result: signedMessage, jsonrpc: '2.0' }

    openPopup({
        id: PopupId.Confirmation,
        props: {
            title: 'Personal Sign',
            description: 'Do you wanna sign the following message: ' + message,
            onConfirm: () => {
                responseCallback(response)
                closePopup()
            },
            onCancel: () => {
                responseCallback({ id, error: { code: 5000, message: 'User rejected' }, jsonrpc: '2.0' })
                closePopup()
            },
        },
    })
}