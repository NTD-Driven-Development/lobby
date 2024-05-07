import { RoomId, RoomStatus } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { StartGameCommandSchema } from '../command'
import { RoomEvent } from './room-event'

export type RoomStartedGameSchema = {
    roomId: RoomId
    gameUrl: string
    status: RoomStatus
}

export class RoomStartedGame extends DomainEvent implements RoomEvent {
    constructor(public readonly data: RoomStartedGameSchema) {
        super('room-started-game', new Date())
    }
}

export type RoomStartedGameEventSchema = RoomStartedGame

export type StartGameEventSchema = {
    type: 'start-game'
    data: StartGameCommandSchema
}
