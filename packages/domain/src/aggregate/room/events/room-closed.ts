import { RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { CloseRoomCommandSchema } from '../command'
import { RoomEvent } from './room-event'

export type RoomClosedSchema = {
    roomId: RoomId
    isClosed: boolean
}

export class RoomClosed extends DomainEvent implements RoomEvent {
    constructor(public readonly data: RoomClosedSchema) {
        super('room-closed', new Date())
    }
}

export type RoomClosedEventSchema = RoomClosed

export type CloseRoomEventSchema = {
    type: 'close-room'
    data: CloseRoomCommandSchema
}
