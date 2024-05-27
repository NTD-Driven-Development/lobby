import { Player, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { RoomEvent } from './room-event'

export type PlayerReconnectedRoomSchema = {
    roomId: RoomId
    player: Player
}

export class PlayerReconnectedRoom extends DomainEvent implements RoomEvent {
    constructor(public readonly data: PlayerReconnectedRoomSchema) {
        super('player-reconnected-room', new Date())
    }
}

export type PlayerReconnectedRoomEventSchema = PlayerReconnectedRoom

export type ReconnectRoomEventSchema = {
    type: 'reconnect-room'
    data: { roomId: RoomId }
}
