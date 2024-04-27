import { Game, Player, RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type CreateRoomSchema = {
    id: RoomId
    name: string
    game: Game
    host: Player
    currentPlayers: Player[]
    minPlayers: number
    maxPlayers: number
    isLocked: boolean
}

export class RoomCreated extends DomainEvent<CreateRoomSchema> {
    constructor(public readonly data: CreateRoomSchema) {
        super('room-created', data)
    }
}
