import { GameId, GameStatus } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { GetGamesQuerySchema } from '../query'

export type GamesResultSchema = {
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
}[]

export class GetGamesResult extends DomainEvent {
    constructor(public readonly data: GamesResultSchema) {
        super('get-games-result', new Date())
    }
}

export type GetGamesResultEventSchema = GetGamesResult

export type GetGamesEventSchema = {
    type: 'get-games'
    data: GetGamesQuerySchema
}
