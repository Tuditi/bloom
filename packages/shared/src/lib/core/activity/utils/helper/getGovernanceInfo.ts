import { isParticipationOutput } from '@contexts/governance/utils'
import { IParticipation, IWrappedOutput } from '@core/wallet/interfaces'
import { Output } from '@core/wallet/types'
import { getAmountFromOutput } from './getAmountFromOutput'
import { getMetadataFromOutput } from './getMetadataFromOutput'
import { StardustGovernanceAction } from '@core/activity/enums'
import { parseGovernanceMetadata } from '@core/wallet/utils'
import { BigIntAbs } from '@core/utils'

interface IGovernanceInfo {
    governanceAction: StardustGovernanceAction
    votingPower: bigint
    votingPowerDifference?: bigint
    participation?: IParticipation
}

export function getGovernanceInfo(output: Output, inputs: IWrappedOutput[], metadata: string): IGovernanceInfo {
    /**
     * NOTE: If the output is NOT a participation output, then it doesn't have any voting power.
     * This is possible if the user manually set it to zero, which automatically removes the
     * participation metadata and tag.
     */
    const currentVotingPower = isParticipationOutput(output) ? getAmountFromOutput(output) : BigInt(0)
    const participations = parseGovernanceMetadata(metadata)

    const governanceInput = inputs?.find((input) => isParticipationOutput(input.output))
    if (governanceInput) {
        const oldVotingPower = getAmountFromOutput(governanceInput.output)
        if (currentVotingPower !== oldVotingPower) {
            return {
                governanceAction:
                    currentVotingPower - oldVotingPower > 0
                        ? StardustGovernanceAction.IncreaseVotingPower
                        : StardustGovernanceAction.DecreaseVotingPower,
                votingPower: currentVotingPower,
                votingPowerDifference: BigIntAbs(currentVotingPower - oldVotingPower),
            }
        }

        const oldMetadata = getMetadataFromOutput(governanceInput.output)
        const oldParticipations = parseGovernanceMetadata(oldMetadata)

        const addedParticipation = getParticipationDifference(oldParticipations, participations)
        const removedParticipation = getParticipationDifference(participations, oldParticipations)

        if (addedParticipation) {
            return {
                governanceAction: StardustGovernanceAction.StartVoting,
                votingPower: currentVotingPower,
                participation: addedParticipation,
            }
        } else if (removedParticipation) {
            return {
                governanceAction: StardustGovernanceAction.StopVoting,
                votingPower: currentVotingPower,
                participation: removedParticipation,
            }
        }

        const changedParticipation = getChangedParticipation(oldParticipations, participations)
        if (changedParticipation) {
            return {
                governanceAction: StardustGovernanceAction.ChangedVote,
                votingPower: currentVotingPower,
                participation: changedParticipation,
            }
        } else {
            return {
                governanceAction: StardustGovernanceAction.Revote,
                votingPower: currentVotingPower,
            }
        }
    } else {
        // There is no governance input when the user first adds voting power
        return {
            governanceAction: StardustGovernanceAction.IncreaseVotingPower,
            votingPower: currentVotingPower,
            votingPowerDifference: currentVotingPower,
        }
    }
}

function getParticipationDifference(
    oldParticipations: IParticipation[],
    newParticipations: IParticipation[]
): IParticipation {
    const participationDifference = newParticipations.find(
        (newParticipation) =>
            !oldParticipations.some((oldParticipation) => newParticipation.eventId === oldParticipation.eventId)
    )
    return participationDifference
}

function getChangedParticipation(
    oldParticipations: IParticipation[],
    newParticipations: IParticipation[]
): IParticipation {
    return newParticipations.find((newParticipation) =>
        oldParticipations.some(
            (oldParticipation) =>
                oldParticipation.eventId === newParticipation.eventId &&
                JSON.stringify(newParticipation.answers) !== JSON.stringify(oldParticipation.answers)
        )
    )
}
