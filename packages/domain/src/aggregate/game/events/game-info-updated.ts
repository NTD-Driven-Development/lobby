import { GameId, GameStatus } from '@game/index'
import { DomainEvent } from '~/core/entity/domain-event'

export type GameInfoUpdatedSchema = { id: GameId } & Partial<{
    name: string
    description: string
    rule: string
    minPlayers: number
    maxPlayers: number
    imageUrl: string | null
    frontendUrl: string
    backendUrl: string
    status: GameStatus
}>

export class GameInfoUpdated extends DomainEvent {
    constructor(public readonly data: Partial<GameInfoUpdatedSchema> & { id: GameId }) {
        super('game-info-updated', new Date())
    }
}
