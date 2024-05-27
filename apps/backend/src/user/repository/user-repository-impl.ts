import { injectable } from 'tsyringe'
import { UserRepository } from './user-repository'
import { User } from '@packages/domain'
import { UserData } from '~/data/entity'
import { AppDataSource } from '~/data/data-source'
import { Repository } from 'typeorm'

@injectable()
export class UserRepositoryImpl implements UserRepository {
    private repo: Repository<UserData>
    public constructor() {
        this.repo = AppDataSource.getRepository(UserData)
    }
    public async existsUserByEmail(email: string): Promise<boolean> {
        return (await this.repo.count({ where: { email } })) > 0
    }
    findById(id: string): Promise<User> {
        throw new Error('Method not implemented.')
    }
    findAll(ids: string[]): Promise<User[]> {
        throw new Error('Method not implemented.')
    }
    public async findByEmail(email: string): Promise<User> {
        return toDomain(await this.repo.findOneOrFail({ where: { email } }))
    }
    public async save(user: User): Promise<void> {
        await this.repo.save(toData(user))
    }
    delete(user: User): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

function toDomain(data: UserData) {
    return new User(data.id, data.email, data.name)
}

function toData(aggregate: User) {
    const data = new UserData()
    data.id = aggregate.id
    data.email = aggregate.email
    data.name = aggregate.name
    return data
}
