import { RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomEndGameSchema = {
    id: RoomId
}

export class RoomEndedGame extends DomainEvent {
    constructor(public readonly data: RoomEndGameSchema) {
        super('room-ended-game', new Date())
    }
}
