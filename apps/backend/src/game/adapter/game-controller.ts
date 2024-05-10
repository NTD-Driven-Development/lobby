import { autoInjectable, inject } from 'tsyringe'
import { RegisterGameUseCase } from '~/game/usecases/register-game-usecase'
import { UpdateGameInfoUseCase } from '~/game/usecases/update-game-info-usecase'
import { RegisterGameEventSchema, UpdateGameInfoEventSchema } from '@packages/domain'

@autoInjectable()
export class GameController {
    constructor(
        @inject(RegisterGameUseCase)
        private registerGameUseCase: RegisterGameUseCase,
        @inject(UpdateGameInfoUseCase)
        private updateGameInfoUseCase: UpdateGameInfoUseCase,
    ) {
        this.registerGameUseCase = registerGameUseCase
        this.updateGameInfoUseCase = updateGameInfoUseCase
    }

    public async registerGame(event: RegisterGameEventSchema) {
        console.log('register-game', event)
        await this.registerGameUseCase.execute(event.data)
    }

    public async updateGameInfo(event: UpdateGameInfoEventSchema) {
        console.log('update-game-info', event)
        await this.updateGameInfoUseCase.execute(event.data)
    }
}
