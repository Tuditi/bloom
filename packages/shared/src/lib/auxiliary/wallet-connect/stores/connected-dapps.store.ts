import { Writable, get, writable } from 'svelte/store'
import { getWalletClient } from './wallet-client.store'
import { IConnectedDapp } from '../interface/connected-dapp.interface'

export const connectedDapps: Writable<IConnectedDapp[]> = writable([])

export function setConnectedDapps(): void {
    const pairings = getWalletClient()?.core.pairing.getPairings()
    const dapps: IConnectedDapp[] =
        pairings?.map((pairing) => ({
            topic: pairing.topic,
            expiry: pairing.expiry,
            relay: pairing.relay,
            active: pairing.active,
            metadata: pairing.peerMetadata,
        })) ?? []
    connectedDapps.set(dapps)
}

export function getConnectedDapps(): IConnectedDapp[] {
    return get(connectedDapps)
}
