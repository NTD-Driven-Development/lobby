import { GameId, GameStatus } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RegisterGameSchema = {
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

export class GameRegistered extends DomainEvent {
    constructor(public readonly data: RegisterGameSchema) {
        super('game-registered', new Date())
    }
}
