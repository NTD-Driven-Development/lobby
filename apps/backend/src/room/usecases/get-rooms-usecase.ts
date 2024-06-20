import { GetRoomsQuerySchema, GetRoomsResult, UseCase } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'

export type GetRoomsInput = GetRoomsQuerySchema
export type GetRoomsOutput = GetRoomsResult

@autoInjectable()
export class GetRoomsUseCase implements UseCase<GetRoomsInput, GetRoomsOutput> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
    ) {}

    async execute(input: GetRoomsInput): Promise<GetRoomsOutput> {
        const result = await this.roomRepository.findNotClosed()
        const filteredResult = result.filter(
            (room) =>
                (!input.status || room.status === input.status) &&
                (!input.gameId || room.game.id === input.gameId) &&
                (!input.search || room.name.includes(input.search)),
        )
        return new GetRoomsResult(
            filteredResult.map((room) => ({
                id: room.id,
                name: room.name,
                game: room.game,
                minPlayers: room.minPlayers,
                maxPlayers: room.maxPlayers,
                currentPlayers: room.players.length,
                isLocked: room.isLocked(),
                status: room.status,
            })),
        )
    }
}
