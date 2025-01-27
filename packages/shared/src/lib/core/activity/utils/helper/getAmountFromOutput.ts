import { Output } from '@iota/sdk/out/types'

export function getAmountFromOutput(output: Output): bigint {
    return BigInt(output?.amount ?? 0)
}
