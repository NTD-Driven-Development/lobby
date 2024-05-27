import { RoomId, RoomStatus } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { GetRoomsQuerySchema } from '../query'

export type GetRoomsResultSchema = {
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
    currentPlayers: number
    isLocked: boolean
    status: RoomStatus
}[]

export class GetRoomsResult extends DomainEvent {
    constructor(public readonly data: GetRoomsResultSchema) {
        super('get-rooms-result', new Date())
    }
}

export type GetRoomsResultEventSchema = GetRoomsResult

export type GetRoomsEventSchema = {
    type: 'get-rooms'
    data: GetRoomsQuerySchema
}
