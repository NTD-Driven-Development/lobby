import { Player, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type PlayerJoinedRoomSchema = {
    roomId: RoomId
    user: Player
}

export class PlayerJoinedRoom extends DomainEvent {
    constructor(public readonly data: PlayerJoinedRoomSchema) {
        super('player-joined-room', new Date())
    }
}
