import { isLoggedIn } from '@core/profile/stores'
import { IPopupState } from '../interfaces'
import { modifyPopupState } from './modifyPopupState'

export function openPopup(
    {
        id,
        props = null,
        hideClose = false,
        preventClose = false,
        transition = undefined,
        overflow = false,
        confirmClickOutside = false,
        relative = true,
    }: Omit<IPopupState, 'active'>,
    forceClose: boolean = false,
    requiresLogin = true
): void {
    if (requiresLogin) {
        if (!isLoggedIn()) {
            return
        }
    }
    modifyPopupState(
        { active: true, id, hideClose, preventClose, confirmClickOutside, transition, props, overflow, relative },
        forceClose
    )
}
