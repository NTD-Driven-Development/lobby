import { RoomId, RoomStatus } from '@room/entity'
import { DomainEvent } from '~/core/entity'
import { EndGameCommandSchema } from '@room/command'

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

export type RoomEndedGameEventSchema = RoomEndedGame

export type EndGameEventSchema = {
    type: 'end-game'
    data: EndGameCommandSchema
}
