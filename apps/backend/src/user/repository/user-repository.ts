import { AbstractRepository, User, UserId } from '@packages/domain'

export interface UserRepository extends AbstractRepository<User, UserId> {
    existsUserByEmail(email: string): boolean
    findById(id: UserId): Promise<User>
    findAllById(ids: UserId[]): Promise<User[]>
    findByEmail(email: string): Promise<User>
    findByIdentity(identity: string): Promise<User>
    save(user: User): Promise<void>
    delete(user: User): Promise<void>
}
