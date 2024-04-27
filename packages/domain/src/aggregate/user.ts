export type UserId = string

export class User {
    constructor(
        public readonly id: UserId,
        public readonly email: string,
        public name: string,
        public identities: string[] = [],
    ) {
        this.id = id
        this.email = email
        this.name = name
        this.identities = identities
    }

    changeName(name: string) {
        this.name = name
    }

    addIdentity(identity: string) {
        this.identities.push(identity)
    }

    hasIdentity(identity: string) {
        return this.identities.includes(identity)
    }
}
