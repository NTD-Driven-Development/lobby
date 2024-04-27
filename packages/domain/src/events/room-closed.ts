import { RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type CloseRoomSchema = {
    id: RoomId
}

export class RoomClosed extends DomainEvent<CloseRoomSchema> {
    constructor(public readonly data: CloseRoomSchema) {
        super('room-closed', data)
    }
}
