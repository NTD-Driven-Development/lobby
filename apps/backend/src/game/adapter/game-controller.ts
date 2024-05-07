import { singleton } from 'tsyringe'
import { RegisterGameUseCase } from '../usecases/register-game-usecase'
import { UpdateGameInfoUseCase } from '../usecases/update-game-info-usecase'
import { RegisterGameEventSchema, UpdateGameInfoEventSchema } from '@packages/domain'

@singleton()
export class GameController {
    constructor(
        private registerGameUseCase: RegisterGameUseCase,
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
