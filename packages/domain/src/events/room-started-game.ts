import { RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type RoomStartGameSchema = {
    id: RoomId
    gameUrl: string
}

export class RoomStartedGame extends DomainEvent<RoomStartGameSchema> {
    constructor(public readonly data: RoomStartGameSchema) {
        super('room-started-game', data)
    }
}
