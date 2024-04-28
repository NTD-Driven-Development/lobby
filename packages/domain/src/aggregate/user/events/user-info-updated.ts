import { UserId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type UpdateUserSchema = {
    id: UserId
    name: string
    identities: string[]
}

export class UserInfoUpdated extends DomainEvent {
    constructor(public readonly data: UpdateUserSchema) {
        super('user-info-updated', new Date())
    }
}
