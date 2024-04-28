import { RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type CloseRoomSchema = {
    id: RoomId
}

export class RoomClosed extends DomainEvent {
    constructor(public readonly data: CloseRoomSchema) {
        super('room-closed', new Date())
    }
}
