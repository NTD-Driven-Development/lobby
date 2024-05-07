import { Game, RegisterGameCommandSchema, UseCase } from '@packages/domain'
import { GameRepository } from '../repository/game-repository'
import { EventBus } from '~/eventbus/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { WebSocketEventBus } from '~/eventbus/websocket-eventbus'
import { GameRepositoryImpl } from '../repository/game-repository-impl'

export type RegisterGameInput = RegisterGameCommandSchema

@autoInjectable()
export class RegisterGameUseCase implements UseCase<RegisterGameInput, void> {
    constructor(
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {
        this.gameRepository = gameRepository
        this.eventBus = eventBus
    }

    async execute(input: RegisterGameInput): Promise<void> {
        const game = new Game('test')
        game.register(input)
        await this.gameRepository.save(game)
        const events = game.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
