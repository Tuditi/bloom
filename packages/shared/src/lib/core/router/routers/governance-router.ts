import { writable } from 'svelte/store'

import { Router } from '../classes'
import { GovernanceRoute } from '../enums'

export const governanceRouter = writable<GovernanceRouter>(null)
export const governanceRoute = writable<GovernanceRoute>(null)

export class GovernanceRouter extends Router<GovernanceRoute> {
    protected breadcrumb: string | undefined
    constructor() {
        super(GovernanceRoute.Proposals, governanceRoute)
    }

    setBreadcrumb(breadcrumb: string | undefined): void {
        this.breadcrumb = breadcrumb
    }

    getBreadcrumb(): string | undefined {
        return this.breadcrumb
    }
}
