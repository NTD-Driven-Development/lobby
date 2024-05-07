import { GameId, GameStatus } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { RegisterGameCommandSchema } from '../command'

export type GameRegisteredSchema = {
    id: GameId
    name: string
    description: string
    rule: string
    minPlayers: number
    maxPlayers: number
    imageUrl: string | null
    frontendUrl: string
    backendUrl: string
    status: GameStatus
}

export class GameRegistered extends DomainEvent {
    constructor(public readonly data: GameRegisteredSchema) {
        super('game-registered', new Date())
    }
}

export type GameRegisteredEventSchema = GameRegistered

export type RegisterGameEventSchema = {
    type: 'register-game-info'
    data: RegisterGameCommandSchema
}
