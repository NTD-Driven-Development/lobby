import { UserId } from '@user/entity'
import { DomainEvent } from '~/core/entity'
import { RegisterUserCommandSchema } from '@user/command'

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

export type UserRegisteredEventSchema = UserRegistered

export type RegisterUserEventSchema = {
    type: 'register-user'
    data: RegisterUserCommandSchema
}
