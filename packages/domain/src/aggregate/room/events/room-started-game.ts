import { RoomId, RoomStatus } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomStartedGameSchema = {
    id: RoomId
    gameUrl: string
    status: RoomStatus
}

export class RoomStartedGame extends DomainEvent {
    constructor(public readonly data: RoomStartedGameSchema) {
        super('room-started-game', new Date())
    }
}
