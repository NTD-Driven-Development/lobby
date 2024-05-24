import { autoInjectable, inject } from 'tsyringe'
import { RegisterGameUseCase } from '~/game/usecases/register-game-usecase'
import { UpdateGameInfoUseCase } from '~/game/usecases/update-game-info-usecase'
import { GetGamesEventSchema, RegisterGameEventSchema, UpdateGameInfoEventSchema } from '@packages/domain'
import { GetGamesUseCase } from '../usecases/get-games-usecase'

@autoInjectable()
export class GameController {
    constructor(
        @inject(RegisterGameUseCase)
        private registerGameUseCase: RegisterGameUseCase,
        @inject(UpdateGameInfoUseCase)
        private updateGameInfoUseCase: UpdateGameInfoUseCase,
        @inject(GetGamesUseCase)
        private getGamesUseCase: GetGamesUseCase,
    ) {
        this.registerGameUseCase = registerGameUseCase
        this.updateGameInfoUseCase = updateGameInfoUseCase
        this.getGamesUseCase = getGamesUseCase
    }

    public async registerGame(event: RegisterGameEventSchema) {
        await this.registerGameUseCase.execute(event.data)
    }

    public async updateGameInfo(event: UpdateGameInfoEventSchema) {
        await this.updateGameInfoUseCase.execute(event.data)
    }

    public async getGames(event: GetGamesEventSchema) {
        return await this.getGamesUseCase.execute(event.data)
    }
}
