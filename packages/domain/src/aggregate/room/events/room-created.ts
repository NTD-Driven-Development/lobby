import { Game, Player, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type CreateRoomSchema = {
    id: RoomId
    name: string
    game: Game
    host: Player
    currentPlayers: Player[]
    minPlayers: number
    maxPlayers: number
    password: string | null
}

export class RoomCreated extends DomainEvent {
    constructor(public readonly data: CreateRoomSchema) {
        super('room-created', new Date())
    }
}
