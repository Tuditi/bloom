import { get, writable } from 'svelte/store'

import { profiles } from '@core/profile/stores'

import { Router } from '../classes'
import { AppRoute, LoginRoute } from '../enums'
import { IRouterEvent } from '../interfaces'
import { loginRoute } from '../subrouters'

export const appRoute = writable<AppRoute>(null)
export const appRouter = writable<AppRouter>(null)

export class AppRouter extends Router<AppRoute> {
    constructor() {
        super(AppRoute.Onboarding, appRoute)
        this.init()
    }

    public init(): void {
        this.routeStore.set(get(profiles).length > 0 ? AppRoute.Login : AppRoute.Onboarding)
    }

    public reset(): void {
        this.history = []
        this.init()
    }

    public next(event?: IRouterEvent): void {
        const params = event || {}
        let nextRoute: AppRoute

        const currentRoute = get(this.routeStore)
        switch (currentRoute) {
            case AppRoute.Login: {
                if (params.shouldAddProfile) {
                    nextRoute = AppRoute.Onboarding
                } else {
                    nextRoute = AppRoute.Dashboard
                }
                break
            }
            case AppRoute.Dashboard: {
                if (params.reset) {
                    nextRoute = AppRoute.Login
                }
                break
            }
            case AppRoute.Onboarding: {
                if (params.shouldAddProfile) {
                    nextRoute = AppRoute.Onboarding
                } else {
                    loginRoute.set(LoginRoute.LoadProfile)
                    nextRoute = AppRoute.Login
                }
                break
            }
        }

        this.setNext(nextRoute)
    }

    public forceNextRoute(route: AppRoute): void {
        this.setNext(route)
    }
}
