import { PlayerId, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity/domain-event'

export type PlayerLeftRoomSchema = {
    roomId: RoomId
    userId: PlayerId
}

export class PlayerLeftRoom extends DomainEvent {
    constructor(public readonly data: PlayerLeftRoomSchema) {
        super('player-leaved-room', new Date())
    }
}
