import { PlayerId, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { PlayerLeaveRoomCommandSchema } from '../command'

export type PlayerLeftRoomSchema = {
    roomId: RoomId
    userId: PlayerId
}

export class PlayerLeftRoom extends DomainEvent {
    constructor(public readonly data: PlayerLeftRoomSchema) {
        super('player-leaved-room', new Date())
    }
}

export type PlayerLeftRoomEventSchema = PlayerLeftRoom

export type PlayerLeaveRoomEventSchema = {
    type: 'player-leave-room'
    data: PlayerLeaveRoomCommandSchema
}
