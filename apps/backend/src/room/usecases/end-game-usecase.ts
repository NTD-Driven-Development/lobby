import { UseCase } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'

export type EndGameInput = { gameUrl: string }

@autoInjectable()
export class EndGameUseCase implements UseCase<EndGameInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: EndGameInput): Promise<void> {
        const room = await this.roomRepository.findByGameUrl(input.gameUrl)
        room.endGame()
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
