import { GameId } from '../aggregate'
import { DomainEvent } from './domain-event'

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
    createdAt: Date
}

export class GameRegistered extends DomainEvent<RegisterGameSchema> {
    constructor(public readonly data: RegisterGameSchema) {
        super('game-registered', data)
    }
}
