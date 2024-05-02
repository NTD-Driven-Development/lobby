import { RoomId } from '@room/entity'
import { DomainEvent } from '~/core/entity/domain-event'
import { CloseRoomCommandSchema } from '@room/command'

export type RoomClosedSchema = {
    id: RoomId
    isClosed: boolean
}

export class RoomClosed extends DomainEvent {
    constructor(public readonly data: RoomClosedSchema) {
        super('room-closed', new Date())
    }
}

export type RoomClosedEventSchema = RoomClosed

export type CloseRoomEventSchema = {
    type: 'close-room'
    data: CloseRoomCommandSchema
}
