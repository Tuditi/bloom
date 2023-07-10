import { app, ipcMain, IpcMainInvokeEvent } from 'electron'
import os from 'os'
import { Identify, identify, init, track } from '@amplitude/analytics-node'

import features from '@features/features'

import { getPlatformVersion } from '../utils/diagnostics.utils'
import { getMachineId } from '../utils/os.utils'

export default class AnalyticsManager {
    constructor() {
        this.init()
    }

    private init(): void {
        if (features.analytics.enabled && process.env.AMPLITUDE_API_KEY) {
            init(process.env.AMPLITUDE_API_KEY, { logLevel: 0 })
            this.setInitialIdentify()
            ipcMain.handle('track-event', this.handleTrackEvent.bind(this))
        } else {
            if (features.analytics.enabled && !process.env.AMPLITUDE_API_KEY) {
                console.warn('Analytics is enabled but no API key is set')
            }
            ipcMain.handle('track-event', () => {})
        }
    }

    private handleTrackEvent(_e: IpcMainInvokeEvent, event: string, properties: Record<string, unknown>): void {
        track(event, properties, { device_id: getMachineId() })
    }

    private setInitialIdentify(): void {
        const identifyObj = new Identify()

        identifyObj.set('app_name', app.getName())
        identifyObj.set('app_version', app.getVersion())

        identifyObj.setOnce('platform', os.platform())
        identifyObj.setOnce('platform_architecture', os.arch())
        identifyObj.set('platform_version', getPlatformVersion())

        identify(identifyObj, { device_id: getMachineId() })
    }
}