import { RoomId, RoomStatus } from '@room/entity'
import { DomainEvent } from '~/core/entity'
import { StartGameCommandSchema } from '@room/command'

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

export type RoomStartedGameEventSchema = RoomStartedGame

export type StartGameEventSchema = {
    type: 'start-game'
    data: StartGameCommandSchema
}
