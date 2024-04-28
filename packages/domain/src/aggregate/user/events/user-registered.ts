import { UserId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type UserRegisterSchema = {
    id: UserId
    name: string
    email: string
    identities: string[]
}

export class UserRegistered extends DomainEvent {
    constructor(public readonly data: UserRegisterSchema) {
        super('user-registered', new Date())
    }
}
