import { RoomId, RoomStatus } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { RoomEvent } from './room-event'

export type RoomEndedGameSchema = {
    roomId: RoomId
    status: RoomStatus
    gameUrl: string | null
}

export class RoomEndedGame extends DomainEvent implements RoomEvent {
    constructor(public readonly data: RoomEndedGameSchema) {
        super('room-ended-game', new Date())
    }
}

export type RoomEndedGameEventSchema = RoomEndedGame
