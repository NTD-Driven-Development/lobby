import { UserId } from '../entity'
import { DomainEvent } from '../../../core/entity'

export type UserRegisteredSchema = {
    id: UserId
    name: string
    email: string
}

export class UserRegistered extends DomainEvent {
    constructor(public readonly data: UserRegisteredSchema) {
        super('user-registered', new Date())
    }
}

export type UserRegisteredEventSchema = UserRegistered

export type RegisterUserEventSchema = {
    type: 'register-user'
    data: null
}
