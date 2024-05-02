import { PlayerId, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type RoomChangedHostSchema = {
    id: RoomId
    host: PlayerId
}

export class RoomChangedHost extends DomainEvent {
    constructor(public readonly data: RoomChangedHostSchema) {
        super('room-changed-host', new Date())
    }
}
