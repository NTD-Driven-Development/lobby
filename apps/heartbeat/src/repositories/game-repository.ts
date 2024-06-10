import { Game } from '@packages/domain'

export interface GameRepository {
    findAll(): Promise<Game[]>
    save(game: Game): Promise<void>
}
