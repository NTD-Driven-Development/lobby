import { AggregateRoot, DomainEvent } from '~/core'
import { UserInfoUpdated, UserRegistered } from '@user/events'

export type UserId = string

export class User extends AggregateRoot<UserId> {
    constructor(
        public readonly id: UserId,
        public email: string,
        public name: string,
        public identities: string[] = [],
    ) {
        if (typeof id === 'object') {
            super(id)
        } else {
            super(id)
            this.apply(new UserRegistered({ id, email, name, identities }))
        }
    }

    public changeName(name: string) {
        this.apply(new UserInfoUpdated({ id: this.id, name, identities: this.identities }))
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
