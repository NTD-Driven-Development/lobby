import { GameId } from '../aggregate'
import { DomainEvent } from './domain-event'

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
    createdAt: Date
}

export class GameInfoUpdated extends DomainEvent<UpdateGameInfoSchema> {
    constructor(public readonly data: UpdateGameInfoSchema) {
        super('game-info-updated', data)
    }
}
