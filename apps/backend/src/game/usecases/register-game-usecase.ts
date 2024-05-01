import { Game, GameStatus, UseCase } from '@packages/domain'
import { GameRepository } from '../repository/game-repository'
import { EventBus } from '~/eventbus/eventbus'

export type RegisterGameInput = {
    name: string
    description: string
    rule: string
    minPlayers: number
    maxPlayers: number
    imageUrl: string
    frontendUrl: string
    backendUrl: string
}

export class RegisterGameUseCase implements UseCase<RegisterGameInput, void> {
    constructor(
        private gameRepository: GameRepository,
        private eventBus: EventBus,
    ) {
        this.gameRepository = gameRepository
        this.eventBus = eventBus
    }

    async execute(input: RegisterGameInput): Promise<void> {
        const game = new Game(
            'test',
            input.name,
            input.description,
            input.rule,
            input.minPlayers,
            input.maxPlayers,
            input.imageUrl,
            input.frontendUrl,
            input.backendUrl,
            GameStatus.OFFLINE,
            new Date(),
        )
        const events = game.getDomainEvents()
        await this.gameRepository.save(game)
        this.eventBus.broadcast(events)
    }
}
