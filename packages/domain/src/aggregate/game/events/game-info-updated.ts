import { GameId, GameStatus } from '../..'
import { DomainEvent } from '../../../core/entity/domain-event'

export type UpdateGameInfoSchema = {
    id: GameId
    name: string
    description: string
    rule: string
    minPlayers: number
    maxPlayers: number
    imageUrl: string
    frontendUrl: string
    backendUrl: string
    status: GameStatus
}

export class GameInfoUpdated extends DomainEvent {
    constructor(public readonly data: Partial<UpdateGameInfoSchema> & { id: GameId }) {
        super('game-info-updated', new Date())
    }
}
