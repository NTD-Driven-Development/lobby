/* eslint-disable @typescript-eslint/no-explicit-any */
import { AggregateRoot, DomainEvent } from '../../../core'
import { UserInfoUpdated, UserRegistered } from '../events'

export type UserId = string

export class User extends AggregateRoot<UserId> {
    constructor(id: UserId, email: string, name: string, identities: string[])
    constructor(domainEvents: DomainEvent[])
    constructor(
        public readonly id: any,
        public email: string = undefined as any,
        public name: string = undefined as any,
        public identities: string[] = [],
    ) {
        super(id)
    }

    public register(payload: { email: string; name: string; identities: string[] }) {
        this.apply(new UserRegistered({ id: this.id, ...payload }))
    }

    public changeName(name: string) {
        this.apply(new UserInfoUpdated({ id: this.id, name }))
    }

    public addIdentity(identity: string) {
        if (!this.hasIdentity(identity)) {
            return
        }
        this.apply(
            new UserInfoUpdated({
                id: this.id,
                name: this.name,
                identities: [...this.identities, identity],
            }),
        )
    }

    private hasIdentity(identity: string) {
        return this.identities.includes(identity)
    }

    protected when(event: DomainEvent): void {
        switch (true) {
            case event instanceof UserRegistered:
                this.email = event.data.email
                this.name = event.data.name
                this.identities = event.data.identities
                break
            case event instanceof UserInfoUpdated:
                this.name = event.data.name ?? this.name
                this.identities = event.data.identities ?? this.identities
                break
            default:
                throw new Error('Invalid user event')
        }
    }
}
