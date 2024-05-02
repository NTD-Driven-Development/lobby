import { RoomId, RoomStatus } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomEndedGameSchema = {
    id: RoomId
    status: RoomStatus
    gameUrl: string | null
}

export class RoomEndedGame extends DomainEvent {
    constructor(public readonly data: RoomEndedGameSchema) {
        super('room-ended-game', new Date())
    }
}
