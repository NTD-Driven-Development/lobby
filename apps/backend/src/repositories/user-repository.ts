import { User, UserId } from '@packages/domain'

export interface UserRepository {
    existsUserByEmail(email: string): boolean
    createUser(user: User): User
    findById(id: UserId): User
    findAllById(ids: UserId[]): User[]
    findByEmail(email: string): User
    findByIdentity(identity: string): User
    update(user: User): User
    deleteAll(): void
}
