import { PlayerId, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { ChangeHostCommandSchema } from '../command'

export type RoomChangedHostSchema = {
    id: RoomId
    host: PlayerId
}

export class RoomChangedHost extends DomainEvent {
    constructor(public readonly data: RoomChangedHostSchema) {
        super('room-changed-host', new Date())
    }
}

export type RoomChangedHostEventSchema = RoomChangedHost

export type ChangeHostEventSchema = {
    type: 'change-host'
    data: ChangeHostCommandSchema
}
