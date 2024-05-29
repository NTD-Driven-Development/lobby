/* eslint-disable @typescript-eslint/no-explicit-any */
import { AggregateRoot, DomainEvent } from '../../../core'
import { RegisterUserCommandSchema } from '../command'
import { UserInfoUpdated, UserRegistered } from '../events'

export type UserId = string

export class User extends AggregateRoot<UserId> {
    constructor(id: UserId, email?: string, name?: string)
    constructor(domainEvents: DomainEvent[])
    constructor(
        public readonly id: any,
        public email: string = undefined as any,
        public name: string = undefined as any,
    ) {
        super(id)
    }

    public register(payload: RegisterUserCommandSchema) {
        this.apply(
            new UserRegistered({
                id: this.id,
                name: payload.name,
                email: payload.email,
            }),
        )
    }

    public changeName(name: string) {
        if (name == null || name == '') throw new Error('name can not be null or empty')
        this.apply(
            new UserInfoUpdated({
                id: this.id,
                name,
            }),
        )
    }

    protected when(event: DomainEvent): void {
        switch (true) {
            case event instanceof UserRegistered:
                this.email = event.data.email
                this.name = event.data.name
                break
            case event instanceof UserInfoUpdated:
                this.name = event.data.name ?? this.name
                break
            default:
                throw new Error('Invalid user event')
        }
    }
}
