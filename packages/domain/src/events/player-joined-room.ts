import { Player, RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type PlayerJoinRoomSchema = {
    roomId: RoomId
    user: Player
}

export class PlayerJoinedRoom extends DomainEvent<PlayerJoinRoomSchema> {
    constructor(public readonly data: PlayerJoinRoomSchema) {
        super('player-joined-room', data)
    }
}
