import { Player, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { JoinRoomCommandSchema } from '../command'
import { RoomEvent } from './room-event'

export type PlayerJoinedRoomSchema = {
    roomId: RoomId
    player: Player
}

export class PlayerJoinedRoom extends DomainEvent implements RoomEvent {
    constructor(public readonly data: PlayerJoinedRoomSchema) {
        super('player-joined-room', new Date())
    }
}

export type PlayerJoinedRoomEventSchema = PlayerJoinedRoom

export type JoinRoomEventSchema = {
    type: 'join-room'
    data: Omit<JoinRoomCommandSchema, 'playerId' | 'playerName'> & { roomId: RoomId }
}
