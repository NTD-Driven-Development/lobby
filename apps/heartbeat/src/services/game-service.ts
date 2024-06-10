import { GameStatus } from '@packages/domain'
import axios from 'axios'
import { autoInjectable, inject } from 'tsyringe'
import { GameRepository } from '~/repositories/game-repository'
import { GameRepositoryImpl } from '~/repositories/game-repository-impl'

@autoInjectable()
export class GameService {
    public constructor(
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
    ) {
        this.gameRepository = gameRepository
    }

    public async discoveryGameServices(): Promise<void> {
        const games = await this.gameRepository.findAll()
        if (games.length === 0) {
            console.log('No game found')
            return
        }
        for await (const game of games) {
            console.log(`Game: ${game.name} is ${game.status}`)
            axios
                .get(`${game.backendUrl}/api/health`)
                .then(async () => {
                    if (game.status === GameStatus.ONLINE) return
                    console.log(`Game: ${game.name} server is healthy`)
                    game.changeStatus(GameStatus.ONLINE)
                    await this.gameRepository.save(game)
                })
                .catch(async () => {
                    if (game.status === GameStatus.OFFLINE) return
                    console.error(`Game: ${game.name} server is unhealthy`)
                    game.changeStatus(GameStatus.OFFLINE)
                    await this.gameRepository.save(game)
                })
        }
    }
}
