import { UserId } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { UpdateUserInfoCommandSchema } from '../command'

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

export type UserInfoUpdatedEventSchema = UserInfoUpdated

export type UpdateUserInfoEventSchema = {
    type: 'update-user-info'
    data: UpdateUserInfoCommandSchema
}
