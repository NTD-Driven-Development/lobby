import { Player, RoomId, RoomStatus } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { GetRoomQuerySchema } from '../query'

export type GetRoomResultSchema = {
    id: RoomId
    name: string
    minPlayers: number
    maxPlayers: number
    game: {
        id: string
        name: string
        description: string
        rule: string
        minPlayers: number
        maxPlayers: number
        imageUrl: string | null
    }
    host: Player
    players: Player[]
    isLocked: boolean
    isClosed: boolean
    status: RoomStatus
    gameUrl: string | null
    createdAt: Date
}

export class GetRoomResult extends DomainEvent {
    constructor(public readonly data: GetRoomResultSchema) {
        super('get-room-result', new Date())
    }
}

export type GetRoomResultEventSchema = GetRoomResult

export type GetRoomEventSchema = {
    type: 'get-room'
    data: GetRoomQuerySchema
}
