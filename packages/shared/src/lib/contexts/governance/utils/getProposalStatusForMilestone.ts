import { EventStatus } from '@iota/sdk/out/types'

export function getProposalStatusForMilestone(
    milestone: number | undefined,
    milestones: Record<EventStatus, number> | undefined
): EventStatus | undefined {
    if (!milestone || !milestones) {
        return undefined
    } else if (milestone >= milestones[EventStatus.Ended]) {
        return EventStatus.Ended
    } else if (milestone >= milestones[EventStatus.Holding]) {
        return EventStatus.Holding
    } else if (milestone >= milestones[EventStatus.Commencing]) {
        return EventStatus.Commencing
    } else if (milestone >= milestones[EventStatus.Upcoming]) {
        return EventStatus.Upcoming
    }
}
