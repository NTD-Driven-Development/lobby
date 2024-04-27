import { Player, RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type PlayerLeaveRoomSchema = {
    roomId: RoomId
    user: Player
}

export class PlayerLeavedRoom extends DomainEvent<PlayerLeaveRoomSchema> {
    constructor(public readonly data: PlayerLeaveRoomSchema) {
        super('player-leaved-room', data)
    }
}
