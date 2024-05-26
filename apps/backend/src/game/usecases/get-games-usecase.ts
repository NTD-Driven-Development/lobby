import { GetGamesQuerySchema, GetGamesResult, UseCase } from '@packages/domain'
import { GameRepository } from '~/game/repository/game-repository'
import { autoInjectable, inject } from 'tsyringe'
import { GameRepositoryImpl } from '~/game/repository/game-repository-impl'

export type GetGameInput = GetGamesQuerySchema
export type GetGameOutput = GetGamesResult

@autoInjectable()
export class GetGamesUseCase implements UseCase<GetGameInput, GetGameOutput> {
    constructor(
        @inject(GameRepositoryImpl)
        private gameRepository: GameRepository,
    ) {
        this.gameRepository = gameRepository
    }

    async execute(input: GetGameInput): Promise<GetGameOutput> {
        const result = await this.gameRepository.findGameRegistrations()
        const filteredResult = result.filter((game) => !input.status || game.status === input.status)
        return new GetGamesResult(
            filteredResult.map((game) => ({
                id: game.id,
                name: game.name as string,
                description: game.description as string,
                rule: game.rule as string,
                minPlayers: game.minPlayers as number,
                maxPlayers: game.maxPlayers as number,
                imageUrl: game.imageUrl as string | null,
                frontendUrl: game.frontendUrl as string,
                backendUrl: game.backendUrl as string,
                status: game.status,
            })),
        )
    }
}
