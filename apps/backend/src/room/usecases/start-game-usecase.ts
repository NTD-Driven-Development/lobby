import { UseCase } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'
import { GameRepository, GameRepositoryImpl } from '~/game/repository'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'
import axios from 'axios'

export type StartGameInput = { roomId: string; email: string }

@autoInjectable()
export class StartGameUseCase implements UseCase<StartGameInput, void> {
    constructor(
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: StartGameInput): Promise<void> {
        const room = await this.roomRepository.findById(input.roomId)
        if (room.isStarted()) throw new Error('Game already started')

        const player = await this.userRepository.findByEmail(input.email)
        const game = await this.gameRepository.findById(room.game.id)
        const gameResponse = await axios.post(`${game.backendUrl}/api/startGame`, { headers: { 'Content-Type': 'application/json' } })
        room.startGame({
            playerId: player.id,
            gameUrl: gameResponse.data.gameUrl,
        })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
