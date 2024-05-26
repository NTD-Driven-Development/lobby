/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Game, GameId, GameStatus } from '@packages/domain'
import { GameRepository } from './game-repository'
import { GameData } from '~/data/entity'
import { injectable } from 'tsyringe'
import { Repository } from 'typeorm'
import { AppDataSource } from '~/data/data-source'

@injectable()
export class GameRepositoryImpl implements GameRepository {
    private repo: Repository<GameData>
    public constructor() {
        this.repo = AppDataSource.getRepository(GameData)
    }

    public async existsByUniqueName(uniqueName: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    public async findById(id: GameId): Promise<Game> {
        return toDomain(
            await this.repo.findOneOrFail({
                where: { id: id },
            }),
        )
    }
    public async findGameRegistrations(): Promise<Game[]> {
        return (await this.repo.find()).map(toDomain)
    }
    public async getNumberOfTotalGameRegistrations(): Promise<number> {
        throw new Error('Method not implemented.')
    }
    public async save(aggregate: Game): Promise<void> {
        await this.repo.save({
            ...toData(aggregate),
            version: aggregate.getVersion() + 1,
        })
    }
    public async delete(aggregate: Game): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

function toData(aggregate: Game) {
    const data = new GameData()
    data.id = aggregate.id
    data.name = aggregate.name as string
    data.description = aggregate.description as string
    data.rule = aggregate.rule as string
    data.minPlayers = aggregate.minPlayers as number
    data.maxPlayers = aggregate.maxPlayers as number
    data.imageUrl = aggregate.imageUrl as string
    data.frontendUrl = aggregate.frontendUrl as string
    data.backendUrl = aggregate.backendUrl as string
    data.version = aggregate.getVersion()
    data.status = aggregate.status
    data.createdAt = aggregate.createdAt
    return data
}

function toDomain(data: GameData) {
    return new Game(
        String(data.id),
        data.name,
        data.description,
        data.rule,
        data.minPlayers,
        data.maxPlayers,
        data.imageUrl,
        data.frontendUrl,
        data.backendUrl,
        data.version,
        data.status as GameStatus,
        data.createdAt,
    )
}
