import { ResponseTypes } from './typings/bridge'
import type { MessageResponse } from './typings/bridge'
import type { Account } from './typings/account'

type Validators = IdValidator |
    ActionValidator |
    PayloadTypeValidator |
    AccountValidator |
    AccountListValidator;

export enum ErrorTypes {
    UnknownId = 'UnknownId',
    InvalidType = 'InvalidType',
    EmptyResponse = 'EmptyResponse',
}

type ErrorObject = {
    type: ErrorTypes
    error: string
}

type ValidationResponse = {
    isValid: boolean
    error: ErrorObject
}

class Validator {
    nextValidator: Validators

    /**
     * Creates validaton response
     *
     * @method createResponse
     *
     * @param {boolean} isValid
     * @param {ErrorObject} error
     *
     * @returns {ValidationResponse}
     */
    createResponse(isValid: boolean, error?: ErrorObject): ValidationResponse {
        return {
            isValid,
            error,
        }
    }

    /**
     * Checks if response is valid
     *
     * @method isValid
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        if (this.nextValidator != null) {
            return this.nextValidator.isValid(response)
        }

        return this.createResponse(true)
    }

    /**
     * Sets next validator
     *
     * @method setNextValidator
     *
     * @param {Validators} validator
     *
     * @returns {ValidationResponse}
     */
    setNextValidator(validator: Validators): void {
        this.nextValidator = validator
    }
}

/**
 * Validation for (channel) id
 */
class IdValidator extends Validator {
    ids: string[]

    /**
     * @param {string[]} ids
     *
     * @returns {IdValidator}
     */
    constructor(ids: string[]) {
        super()

        this.ids = ids
        return this
    }

    /**
     * Checks if response is valid
     *
     * @method isValid
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const id = response.id

        if ('string' !== typeof id) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of id received.',
            })
        }

        if (!this.ids.includes(id)) {
            return super.createResponse(false, {
                type: ErrorTypes.UnknownId,
                error: 'Unknown id.',
            })
        }

        return super.isValid(response)
    }
}

/**
 * Validation for action
 */
class ActionValidator extends Validator {
    /**
     * Checks if response is valid
     *
     * @method isValid
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const action = response.action

        if ('string' !== typeof action) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of action received.',
            })
        }

        return super.isValid(response)
    }
}

/**
 * Validation for account identifier
 */
class PayloadTypeValidator extends Validator {
    type: string

    constructor(type: string) {
        super()
        this.type = type
    }

    /**
     * Checks if response is valid
     *
     * @method isValid
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const payload = response.payload

        if (typeof payload !== this.type) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of payload received.',
            })
        }

        return super.isValid(response)
    }
}

class AccountListValidator extends Validator {
    /**
     * Checks if response is valid
     * 
     * @method isValid
     * 
     * @param {MessageResponse} response
     * 
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const payload = response.payload as Account[];

        if (!Array.isArray(payload)) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of accounts received.'
            });
        }

        for (const account of payload) {
            const validationResponse = new AccountValidator().isValid({
                id: response.id,
                action: response.action,
                type: response.type,
                payload: account as any
            })
            if (!validationResponse.isValid) {
                return validationResponse
            }
        }

        return super.isValid(response);
    }
}

/**
 * Validation for account
 */
class AccountValidator extends Validator {
    /**
     * Checks if response is valid
     *
     * @method isValid
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const payload = response.payload as Account

        if ('string' !== typeof payload.id) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of id received.'
            });
        } else if ('string' !== typeof payload.alias) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of alias received.',
            })
        } else if ('string' !== typeof payload.createdAt) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of createdAt received.',
            })
        } else if (!Array.isArray(payload.messages)) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of messages received.',
            })
        } else if (!Array.isArray(payload.addresses)) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of addresses received.',
            })
        }

        return super.isValid(response)
    }
}

/**
 * Validation for type of response object
 * Type should be the very first thing that gets validated
 */
class TypeValidator extends Validator {
    /**
     * Checks if response is valid
     *
     * @method isValid
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    isValid(response: MessageResponse): ValidationResponse {
        const hasValidType =
            'object' === typeof response && null !== response && !Array.isArray(response) && 'function' !== typeof response

        if (!hasValidType) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Invalid type of message received.',
            })
        }

        const responseValues = Object.values(response)

        if (!responseValues.length) {
            return super.createResponse(false, {
                type: ErrorTypes.EmptyResponse,
                error: 'Empty message received.',
            })
        }

        if (responseValues.some((value) => 'function' === typeof value)) {
            return super.createResponse(false, {
                type: ErrorTypes.InvalidType,
                error: 'Properties with invalid types received.',
            })
        }

        return super.isValid(response)
    }
}

class ValidatorChainBuilder {
    first: Validators
    last: Validators

    /**
     * Adds a new validation to the validation chain
     *
     * @method add
     *
     * @param {Validators} validator
     *
     * @returns {ValidatorChainBuilder}
     */
    add(validator: Validators): ValidatorChainBuilder {
        if (!this.first) {
            this.first = validator
            this.last = validator
        } else {
            this.last.setNextValidator(validator)
            this.last = validator
        }

        return this
    }

    /**
     * Gets first validator in chain
     *
     * @method getFirst
     *
     * @returns {Validators}
     */
    getFirst(): Validators {
        return this.first
    }
}

export default class ValidatorService {
    validators: any
    ids: string[]

    constructor(ids: string[]) {
        this.ids = ids

        this.validators = {
            [ResponseTypes.StrongholdPasswordSet]: this.createBaseValidator().getFirst(),
            [ResponseTypes.RemovedAccount]: this.createBaseValidator().add(new PayloadTypeValidator('object')).getFirst(),
            [ResponseTypes.CreatedAccount]: this.createBaseValidator().add(new AccountValidator()).getFirst(),
            [ResponseTypes.ReadAccounts]: this.createBaseValidator().add(new AccountListValidator()).getFirst(),
            [ResponseTypes.Balance]: this.createBaseValidator().getFirst(),
            [ResponseTypes.BackupRestored]: this.createBaseValidator().getFirst(),
            [ResponseTypes.BackupSuccessful]: this.createBaseValidator().getFirst(),
            [ResponseTypes.GeneratedMnemonic]: this.createBaseValidator().getFirst(),
            [ResponseTypes.StoredMnemonic]: this.createBaseValidator().getFirst(),
            [ResponseTypes.VerifiedMnemonic]: this.createBaseValidator().getFirst(),
            [ResponseTypes.SyncedAccounts]: this.createBaseValidator().getFirst(),
            [ResponseTypes.SentTransfer]: this.createBaseValidator().getFirst(),
            [ResponseTypes.StoragePasswordSet]: this.createBaseValidator().getFirst(),
            [ResponseTypes.StrongholdStatus]: this.createBaseValidator().getFirst(),
            [ResponseTypes.GeneratedAddress]: this.createBaseValidator().add(new PayloadTypeValidator('object')).getFirst(),
            [ResponseTypes.StrongholdStatusChange]: this.createBaseEventValidator().getFirst(),
            [ResponseTypes.LatestAddress]: this.createBaseValidator().getFirst(),
            [ResponseTypes.SyncedAccount]: this.createBaseValidator().getFirst(),
            [ResponseTypes.UnusedAddress]: this.createBaseValidator().getFirst(),
            [ResponseTypes.IsLatestAddressUnused]: this.createBaseValidator().getFirst(),
            [ResponseTypes.AreAllLatestAddressesUnused]: this.createBaseValidator().getFirst(),
            [ResponseTypes.UpdatedAlias]: this.createBaseValidator().getFirst(),
            [ResponseTypes.DeletedStorage]: this.createBaseValidator().getFirst(),
            [ResponseTypes.LockedStronghold]: this.createBaseValidator().getFirst(),
            [ResponseTypes.StrongholdPasswordChanged]: this.createBaseValidator().getFirst(),
            [ResponseTypes.Error]: this.createBaseValidator().getFirst(),
        };
    }

    /**
     * Creates a base validator
     *
     * @method createBaseValidator
     *
     * @returns {ValidatorChainBuilder}
     */
    private createBaseValidator(): ValidatorChainBuilder {
        return new ValidatorChainBuilder().add(new TypeValidator()).add(new IdValidator(this.ids)).add(new ActionValidator())
    }

    /**
     * Creates a base event validator
     *
     * @method createBaseEventValidator
     *
     * @returns {ValidatorChainBuilder}
     */
    private createBaseEventValidator(): ValidatorChainBuilder {
        return new ValidatorChainBuilder().add(new TypeValidator()).add(new IdValidator(this.ids))
    }

    /**
     * Performs validation
     *
     * @method performValidation
     *
     * @param {MessageResponse} response
     *
     * @returns {ValidationResponse}
     */
    performValidation(response: MessageResponse): ValidationResponse {
        return this.validators[response.type].isValid(response)
    }
}
