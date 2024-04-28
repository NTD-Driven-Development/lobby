import { Player, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type PlayerJoinRoomSchema = {
    roomId: RoomId
    user: Player
}

export class PlayerJoinedRoom extends DomainEvent {
    constructor(public readonly data: PlayerJoinRoomSchema) {
        super('player-joined-room', new Date())
    }
}
