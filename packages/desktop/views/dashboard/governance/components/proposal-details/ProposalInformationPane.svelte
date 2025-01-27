<script lang="ts">
    import { EventStatus } from '@iota/sdk/out/types'
    import { Table, Text } from '@bloomwalletio/ui'
    import { Pane } from '@ui'
    import { formatDate, localize } from '@core/i18n'
    import { DATE_FORMAT, milestoneToDate, truncateString } from '@core/utils'
    import { networkStatus } from '@core/network/stores'
    import { selectedProposal } from '@contexts/governance/stores'

    interface IProposalDateData {
        propertyKey: 'votingOpens' | 'countingStarts' | 'countingEnds' | 'countingEnded'
        milestone: number
    }

    $: proposalDateData = getNextProposalDateData($selectedProposal?.status)

    function getNextProposalDateData(status: EventStatus): IProposalDateData {
        switch (status) {
            case EventStatus.Upcoming:
                return {
                    propertyKey: 'votingOpens',
                    milestone: $selectedProposal?.milestones?.commencing,
                }
            case EventStatus.Commencing:
                return {
                    propertyKey: 'countingStarts',
                    milestone: $selectedProposal?.milestones?.holding,
                }
            case EventStatus.Holding:
                return {
                    propertyKey: 'countingEnds',
                    milestone: $selectedProposal?.milestones?.ended,
                }
            case EventStatus.Ended:
                return {
                    propertyKey: 'countingEnded',
                    milestone: $selectedProposal?.milestones?.ended,
                }
            default:
                return undefined
        }
    }
</script>

<Pane classes="h-fit shrink-0 space-y-6 p-6">
    <Text type="body2">{localize('views.governance.details.proposalInformation.title')}</Text>
    <Table
        items={[
            {
                key: localize(`views.governance.details.proposalInformation.${proposalDateData?.propertyKey}`),
                value: proposalDateData?.propertyKey
                    ? formatDate(
                          milestoneToDate($networkStatus.currentMilestone, proposalDateData.milestone),
                          DATE_FORMAT
                      )
                    : undefined,
            },
            {
                key: localize('views.governance.details.proposalInformation.eventId'),
                value: truncateString($selectedProposal?.id, 9, 9),
                copyable: true,
            },
            {
                key: localize('views.governance.details.proposalInformation.nodeUrl'),
                value: $selectedProposal?.nodeUrl,
                copyable: true,
            },
        ]}
    />
</Pane>
