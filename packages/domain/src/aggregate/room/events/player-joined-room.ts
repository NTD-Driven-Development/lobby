import { Player, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { PlayerJoinRoomCommandSchema } from '../command'

export type PlayerJoinedRoomSchema = {
    roomId: RoomId
    user: Player
}

export class PlayerJoinedRoom extends DomainEvent {
    constructor(public readonly data: PlayerJoinedRoomSchema) {
        super('player-joined-room', new Date())
    }
}

export type PlayerJoinedRoomEventSchema = PlayerJoinedRoom

export type PlayerJoinRoomEventSchema = {
    type: 'player-join-room'
    data: PlayerJoinRoomCommandSchema
}
