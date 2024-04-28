import { RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomStartGameSchema = {
    id: RoomId
    gameUrl: string
}

export class RoomStartedGame extends DomainEvent {
    constructor(public readonly data: RoomStartGameSchema) {
        super('room-started-game', new Date())
    }
}
