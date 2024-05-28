import { Room, CreateRoomCommandSchema, UseCase, PlayerStatus, Player } from '@packages/domain'
import { v4 } from 'node-uuid'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'
import { GameRepository, GameRepositoryImpl } from '~/game/repository'

export type CreateRoomInput = Omit<CreateRoomCommandSchema, 'players' | 'host' | 'game'> & { gameId: string; email: string }

@autoInjectable()
export class CreateRoomUseCase implements UseCase<CreateRoomInput, void> {
    constructor(
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: CreateRoomInput): Promise<void> {
        const user = await this.userRepository.findByEmail(input.email)
        if (await this.roomRepository.hasPlayerJoinedRoom(user.id)) {
            throw new Error('Player has already joined a room')
        }
        const game = await this.gameRepository.findById(input.gameId)
        const room = new Room(v4())
        const player: Player = {
            id: user.id,
            name: user.name,
            isReady: true,
            status: PlayerStatus.CONNECTED,
        }
        room.createRoom({
            ...input,
            game: {
                id: game.id,
                name: game.name as string,
                minPlayers: game.minPlayers as number,
                maxPlayers: game.maxPlayers as number,
            },
            host: player,
            players: [player],
        })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
