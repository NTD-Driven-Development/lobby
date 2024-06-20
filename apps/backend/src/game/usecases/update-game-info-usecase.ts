import { UpdateGameInfoCommandSchema, UseCase } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { GameRepository, GameRepositoryImpl } from '~/game/repository'

export type UpdateGameInfoInput = UpdateGameInfoCommandSchema

@autoInjectable()
export class UpdateGameInfoUseCase implements UseCase<UpdateGameInfoInput, void> {
    constructor(
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {
        this.gameRepository = gameRepository
        this.eventBus = eventBus
    }

    async execute(input: UpdateGameInfoInput): Promise<void> {
        // 查
        const game = await this.gameRepository.findById(input.id)
        // 改
        game.updateInfo(input)
        // 存
        await this.gameRepository.save(game)
        // 推
        const events = game.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
