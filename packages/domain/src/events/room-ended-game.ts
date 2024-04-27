import { RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type RoomEndGameSchema = {
    id: RoomId
}

export class RoomEndedGame extends DomainEvent<RoomEndGameSchema> {
    constructor(public readonly data: RoomEndGameSchema) {
        super('room-ended-game', data)
    }
}
