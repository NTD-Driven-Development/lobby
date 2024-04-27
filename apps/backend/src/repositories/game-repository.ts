import { Game, GameId } from '@packages/domain'

export interface GameRepository {
    existsByUniqueName(uniqueName: string): boolean
    findById(id: GameId): Game
    findGameRegistrations(): Game[]
    getNumberOfTotalGameRegistrations(): number
    registerGame(data: Game): Game
    updateGame(data: Game): Game
    deleteAll(): void
}
