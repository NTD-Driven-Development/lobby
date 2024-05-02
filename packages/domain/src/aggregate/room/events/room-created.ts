import { Player, RoomId, RoomStatus } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { CreateRoomCommandSchema } from '../command'

export type RoomCreatedSchema = {
    id: RoomId
    name: string
    game: {
        id: string
        name: string
    }
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

export type RoomCreatedEventSchema = RoomCreated

export type CreateRoomEventSchema = {
    type: 'create-room'
    data: CreateRoomCommandSchema
}
