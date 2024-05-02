import { UserId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type UserRegisteredSchema = {
    id: UserId
    name: string
    email: string
    identities: string[]
}

export class UserRegistered extends DomainEvent {
    constructor(public readonly data: UserRegisteredSchema) {
        super('user-registered', new Date())
    }
}
