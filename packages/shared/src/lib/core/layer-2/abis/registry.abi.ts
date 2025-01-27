import { Abi } from '../types'

export const REGISTRY_ABI: Abi = [
    {
        constant: false,
        inputs: [{ name: '_new', type: 'address' }],
        name: 'setOwner',
        outputs: [],
        payable: false,
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSignatures',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'owner',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        type: 'function',
    },
    { constant: false, inputs: [], name: 'drain', outputs: [], payable: false, type: 'function' },
    {
        constant: true,
        inputs: [{ name: '', type: 'bytes4' }],
        name: 'entries',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_method', type: 'string' }],
        name: 'register',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        type: 'function',
    },
    { inputs: [], type: 'constructor' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'creator', type: 'address' },
            { indexed: true, name: 'signature', type: 'bytes4' },
            { indexed: false, name: 'method', type: 'string' },
        ],
        name: 'Registered',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'old', type: 'address' },
            { indexed: true, name: 'current', type: 'address' },
        ],
        name: 'NewOwner',
        type: 'event',
    },
]
