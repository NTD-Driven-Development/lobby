import { Game, Player, RoomId, RoomStatus } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomCreatedSchema = {
    id: RoomId
    name: string
    game: Game
    host: Player
    currentPlayers: Player[]
    minPlayers: number
    maxPlayers: number
    password: string | null
    createdAt: Date
    status: RoomStatus
    isClosed: boolean
    gameUrl: string | null
}

export class RoomCreated extends DomainEvent {
    constructor(public readonly data: RoomCreatedSchema) {
        super('room-created', new Date())
    }
}
