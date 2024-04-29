import { AbstractRepository, Game, GameId } from '@packages/domain'

export interface GameRepository extends AbstractRepository<Game, GameId> {
    existsByUniqueName(uniqueName: string): Promise<boolean>
    findById(id: GameId): Promise<Game>
    findGameRegistrations(): Promise<Game[]>
    getNumberOfTotalGameRegistrations(): Promise<number>
    save(data: Game): Promise<void>
    delete(data: Game): Promise<void>
}
