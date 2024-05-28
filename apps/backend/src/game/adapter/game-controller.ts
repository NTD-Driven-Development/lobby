import { autoInjectable, inject } from 'tsyringe'
import { RegisterGameUseCase, UpdateGameInfoUseCase, GetGamesUseCase } from '~/game/usecases'
import { GetGamesEventSchema, RegisterGameEventSchema, UpdateGameInfoEventSchema } from '@packages/domain'
import { Server } from '@packages/socket'
import { Socket } from 'socket.io'
import { SocketThrow } from '~/decorators'

@autoInjectable()
export class GameController {
    constructor(
        @inject(Socket)
        private socket: Server,
        @inject(RegisterGameUseCase)
        private registerGameUseCase: RegisterGameUseCase,
        @inject(UpdateGameInfoUseCase)
        private updateGameInfoUseCase: UpdateGameInfoUseCase,
        @inject(GetGamesUseCase)
        private getGamesUseCase: GetGamesUseCase,
    ) {}

    @SocketThrow
    public async registerGame(event: RegisterGameEventSchema) {
        await this.registerGameUseCase.execute(event.data)
    }

    @SocketThrow
    public async updateGameInfo(event: UpdateGameInfoEventSchema) {
        await this.updateGameInfoUseCase.execute(event.data)
    }

    @SocketThrow
    public async getGames(event: GetGamesEventSchema) {
        return await this.getGamesUseCase.execute(event.data)
    }
}
