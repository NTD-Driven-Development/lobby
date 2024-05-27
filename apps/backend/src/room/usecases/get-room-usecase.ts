import { GetRoomQuerySchema, GetRoomResult, UseCase } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepositoryImpl } from '../repository/room-repository-impl'
import { RoomRepository } from '../repository/room-repository'
import { GameRepository } from '~/game/repository/game-repository'
import { GameRepositoryImpl } from '~/game/repository/game-repository-impl'

export type GetRoomInput = GetRoomQuerySchema
export type GetRoomOutput = GetRoomResult

@autoInjectable()
export class GetRoomUseCase implements UseCase<GetRoomInput, GetRoomOutput> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
    ) {}

    async execute(input: GetRoomInput): Promise<GetRoomOutput> {
        const result = await this.roomRepository.findById(input.roomId)
        const game = await this.gameRepository.findById(result.game.id)
        return new GetRoomResult({
            id: result.id,
            name: result.name,
            minPlayers: result.minPlayers,
            maxPlayers: result.maxPlayers,
            game: {
                id: game.id,
                name: game.name,
                description: game.description,
                rule: game.rule,
                minPlayers: game.minPlayers,
                maxPlayers: game.maxPlayers,
                imageUrl: game.imageUrl,
            },
            host: result.host,
            players: result.players,
            isClosed: result.isClosed,
            isLocked: result.isLocked(),
            status: result.status,
            gameUrl: result.gameUrl,
            createdAt: result.createdAt,
        })
    }
}
