/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Game, GameId, GameStatus } from '@packages/domain'
import { GameRepository } from './game-repository'

export class GameRepositoryImpl implements GameRepository {
    public async existsByUniqueName(uniqueName: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    public async findById(id: GameId): Promise<Game> {
        // throw new Error('Method not implemented.')
        return toDomain({
            id: id,
            name: 'test',
            description: 'test',
            rule: 'test',
            minPlayers: 1,
            maxPlayers: 1,
            imageUrl: 'test',
            frontendUrl: 'test',
            backendUrl: 'test',
            status: GameStatus.OFFLINE,
            createdAt: new Date(),
        })
    }
    public async findGameRegistrations(): Promise<Game[]> {
        throw new Error('Method not implemented.')
    }
    public async getNumberOfTotalGameRegistrations(): Promise<number> {
        throw new Error('Method not implemented.')
    }
    public async save(data: Game): Promise<void> {
        // throw new Error('Method not implemented.')
        console.log('GameRepositoryImpl.save')
    }
    public async delete(data: Game): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

function toDomain(data: any) {
    return new Game(
        data.id,
        data.name,
        data.description,
        data.rule,
        data.minPlayers,
        data.maxPlayers,
        data.imageUrl,
        data.frontendUrl,
        data.backendUrl,
        data.status,
        data.createdAt,
    )
}
