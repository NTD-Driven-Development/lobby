import { UpdateGameInfoSchema, UseCase } from '@packages/domain'
import { GameRepository } from '../repository/game-repository'
import { EventBus } from '~/eventbus/eventbus'

export type UpdateGameInfoInput = UpdateGameInfoSchema

export class UpdateGameInfoUseCase implements UseCase<UpdateGameInfoInput, void> {
    constructor(
        private gameRepository: GameRepository,
        private eventBus: EventBus,
    ) {
        this.gameRepository = gameRepository
        this.eventBus = eventBus
    }

    async execute(input: UpdateGameInfoInput): Promise<void> {
        const game = await this.gameRepository.findById(input.id)
        game.updateInfo(input)
        await this.gameRepository.save(game)
        const events = game.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
