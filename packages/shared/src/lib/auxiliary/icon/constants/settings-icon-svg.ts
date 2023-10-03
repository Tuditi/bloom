import {
    AdvancedSettingsRoute,
    CollectiblesSettingsRoute,
    GeneralSettingsRoute,
    HelpAndInfoRoute,
    ProfileSettingsRoute,
    SecuritySettingsRoute,
} from '@core/router'

import { Icon } from '../enums'

export const SETTINGS_ICON_SVG = {
    [GeneralSettingsRoute.Theme]: Icon.Theme,
    [GeneralSettingsRoute.Language]: Icon.Language,
    [GeneralSettingsRoute.Notifications]: Icon.Bell,
    [GeneralSettingsRoute.DeepLinks]: Icon.Link,
    [GeneralSettingsRoute.CrashReporting]: Icon.Doc,
    [ProfileSettingsRoute.ChangeProfileName]: Icon.Profile,
    [ProfileSettingsRoute.Currency]: Icon.Currency,
    [ProfileSettingsRoute.DeleteProfile]: Icon.Delete,
    [CollectiblesSettingsRoute.MaxMediaSize]: Icon.File,
    [CollectiblesSettingsRoute.MaxMediaDownloadTime]: Icon.Timer,
    [CollectiblesSettingsRoute.RefreshNftMedia]: Icon.Refresh,
    [SecuritySettingsRoute.ExportStronghold]: Icon.Export,
    [SecuritySettingsRoute.StrongholdPasswordTimeout]: Icon.Timelock,
    [SecuritySettingsRoute.AppLock]: Icon.Logout,
    [SecuritySettingsRoute.ChangePassword]: Icon.Lock2,
    [SecuritySettingsRoute.ChangePincode]: Icon.Lock,
    [AdvancedSettingsRoute.WalletFinder]: Icon.Reset,
    [AdvancedSettingsRoute.HiddenAccounts]: Icon.View,
    [AdvancedSettingsRoute.DeveloperToggle]: Icon.Dev,
    [HelpAndInfoRoute.Diagnostics]: Icon.Tools,
    [HelpAndInfoRoute.ErrorLog]: Icon.Warning,
    [HelpAndInfoRoute.Documentation]: Icon.Doc,
    [HelpAndInfoRoute.Faq]: Icon.Speech,
    [HelpAndInfoRoute.Discord]: Icon.Discord,
    [HelpAndInfoRoute.ReportAnIssue]: Icon.Help,
}
