import { get } from 'svelte/store'
import { TrackedParticipationOverview } from '@iota/sdk/out/types'
import { selectedAccountIndex } from '@core/account/stores'
import { getParticipationsForProposal } from './getParticipationsForProposal'

export function isVotingForProposal(proposalId: string, accountIndex = get(selectedAccountIndex)): boolean {
    const participations = getParticipationsForProposal(proposalId, accountIndex) ?? {}
    const participationOutputs: TrackedParticipationOverview[] = Object.values(participations)
    return participationOutputs.some((output) => output?.endMilestoneIndex === 0)
}
