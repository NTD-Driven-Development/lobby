import { RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomClosedSchema = {
    id: RoomId
    isClosed: boolean
}

export class RoomClosed extends DomainEvent {
    constructor(public readonly data: RoomClosedSchema) {
        super('room-closed', new Date())
    }
}
