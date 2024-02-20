import { IFeatureFlag } from './feature-flag.interface'

export interface IDeveloperFeatures extends IFeatureFlag {
    faucet: IFeatureFlag
    mintNft: IFeatureFlag
    mintNftCollection: IFeatureFlag
    mintNativeTokens: IFeatureFlag
    alias: IFeatureFlag
    refreshTokens: IFeatureFlag
    deeplink: IFeatureFlag
}
