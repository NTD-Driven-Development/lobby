import { PlayerId, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity/domain-event'

export type PlayerLeaveRoomSchema = {
    roomId: RoomId
    userId: PlayerId
}

export class PlayerLeavedRoom extends DomainEvent {
    constructor(public readonly data: PlayerLeaveRoomSchema) {
        super('player-leaved-room', new Date())
    }
}
