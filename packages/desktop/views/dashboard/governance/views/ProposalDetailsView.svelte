<script lang="ts">
    import {
        clearParticipationEventStatusPoll,
        pollParticipationEventStatus,
    } from '@contexts/governance/actions/pollParticipationEventStatus'
    import {
        clearSelectedParticipationEventStatus,
        selectedProposal,
        updateParticipationOverviewForEventId,
    } from '@contexts/governance/stores'
    import { onDestroy, onMount } from 'svelte'
    import {
        ProposalAccountVotingPane,
        ProposalDetailsPane,
        ProposalInformationPane,
        ProposalQuestionListPane,
    } from '../components/proposal-details'

    let statusLoaded: boolean = false
    let overviewLoaded: boolean = false

    onMount(() => {
        // Callbacks used, because we don't want to await the resolution of the promises.
        pollParticipationEventStatus($selectedProposal?.id)
            .then(() => (statusLoaded = true))
            .catch()
        updateParticipationOverviewForEventId($selectedProposal?.id)
            .then(() => (overviewLoaded = true))
            .catch()
    })

    onDestroy(() => {
        clearParticipationEventStatusPoll()
        clearSelectedParticipationEventStatus()
    })
</script>

<proposal-details class="w-full h-full flex flex-nowrap p-8 relative flex-1 space-x-4">
    <div class="w-2/5 flex flex-col space-y-4 relative">
        <ProposalDetailsPane proposal={$selectedProposal} />
        <ProposalAccountVotingPane />
        <ProposalInformationPane />
    </div>
    <ProposalQuestionListPane {statusLoaded} {overviewLoaded} />
</proposal-details>
