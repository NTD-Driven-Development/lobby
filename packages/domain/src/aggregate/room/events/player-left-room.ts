import { PlayerId, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { RoomEvent } from './room-event'

export type PlayerLeftRoomSchema = {
    roomId: RoomId
    playerId: PlayerId
}

export class PlayerLeftRoom extends DomainEvent implements RoomEvent {
    constructor(public readonly data: PlayerLeftRoomSchema) {
        super('player-left-room', new Date())
    }
}

export type PlayerLeftRoomEventSchema = PlayerLeftRoom

export type LeaveRoomEventSchema = {
    type: 'leave-room'
    data: { roomId: RoomId }
}
