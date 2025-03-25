/* eslint-disable @typescript-eslint/no-explicit-any */
import http from 'http'
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
        const agent = axios.create({
            httpAgent: new http.Agent({ keepAlive: false }),
        })
        for await (const game of games) {
            console.log(`Game: ${game.name}-${game.backendUrl} is ${game.status}`)
            agent
                .get(`${game.backendUrl}/api/health`)
                .then(() => {
                    if (game.status === GameStatus.ONLINE) return
                    console.log(`Game: ${game.name} server is healthy`)
                    game.changeStatus(GameStatus.ONLINE)
                    this.gameRepository.save(game)
                })
                .catch((error: any) => {
                    if (game.status === GameStatus.OFFLINE) return
                    console.error(`Game: ${game.name} server is unhealthy`)
                    console.log(error?.message)
                    game.changeStatus(GameStatus.OFFLINE)
                    this.gameRepository.save(game)
                })
        }
    }
}
