import { UserId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type UserInfoUpdatedSchema = {
    id: UserId
    name: string
    identities: string[]
}

export class UserInfoUpdated extends DomainEvent {
    constructor(public readonly data: UserInfoUpdatedSchema) {
        super('user-info-updated', new Date())
    }
}
